import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

/* Why this plugin exists
   ─────────────────────
   Replit's WebSocket proxy hard-drops every ~35 s. Vite's default response is:
     await waitForSuccessfulPing(url.href);
     location.reload();                      ← full page flash every 35 s
   We replace that with a smart reconnect:

   • If Vite re-optimised deps while disconnected → browserHash in _metadata.json
     will differ from the hash stored on page-load → we MUST do location.reload()
     to avoid two React instances coexisting (stale chunk from memory + fresh chunk
     from the new bundle).  Two React instances = "Invalid hook call" crash.

   • If hash is unchanged → fast transport.connect() with no visible flash.

   The initial hash is captured by appending a fetch to client.mjs itself so it
   runs as soon as the HMR client module is evaluated (milliseconds after load,
   long before the first 35-s disconnect window). */
function viteHmrReconnect(): Plugin {
  return {
    name: "vite-hmr-reconnect",
    apply: "serve",
    transform(code, id) {
      if (!id.includes("vite/dist/client/client.mjs")) return null;

      /* Patch 1 — replace reconnect→reload with dep-hash-aware logic */
      const patched = code.replace(
        /await waitForSuccessfulPing\(url\.href\);\s*location\.reload\(\);/,
        `try {
  const __resp = await fetch(
    "/node_modules/.vite/deps/_metadata.json?t=" + Date.now(),
    { cache: "no-store" },
  );
  const __meta = __resp.ok ? await __resp.json() : null;
  const __srvHash = __meta && (__meta.browserHash || __meta.hash);
  const __cliHash = typeof window !== "undefined" ? window.__viteDepHash : null;
  if (__cliHash && __srvHash && __cliHash !== __srvHash) {
    /* Dep optimisation happened while we were disconnected.
       Must reload so the whole module graph uses one React instance. */
    console.debug("[vite] dep hash changed (" + __cliHash + " → " + __srvHash + ") — reloading for module consistency");
    location.reload();
  } else {
    console.debug("[vite] connecting...");
    transport.connect(createHMRHandler(handleMessage)).catch(() => location.reload());
  }
} catch {
  /* If the metadata fetch fails (e.g. offline), reconnect optimistically.
     If that also fails, the .catch() above falls back to location.reload(). */
  console.debug("[vite] connecting...");
  transport.connect(createHMRHandler(handleMessage)).catch(() => location.reload());
}`,
      );

      if (patched === code) {
        /* Pattern not found — likely a Vite version change. Fall back to
           default behaviour (page reload) rather than crashing. */
        console.warn(
          "[vite-hmr-reconnect] Could not patch client.mjs — pattern not found. " +
            "HMR will fall back to page reloads on WebSocket drops.",
        );
        return null;
      }

      /* Patch 2 — capture the dep browserHash as soon as client.mjs evaluates.
         By the time a 35-s disconnect can occur, this fetch will have completed.
         We append rather than prepend to avoid breaking client.mjs's own init. */
      const withCapture =
        patched +
        `\n// [vite-hmr-reconnect] Capture initial dep hash for later comparison
if (typeof window !== "undefined" && typeof fetch !== "undefined") {
  fetch("/node_modules/.vite/deps/_metadata.json", { cache: "no-cache" })
    .then(r => r.ok ? r.json() : null)
    .then(meta => { if (meta) window.__viteDepHash = meta.browserHash || meta.hash; })
    .catch(() => {});
}\n`;

      return { code: withCapture, map: null };
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    viteHmrReconnect(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    /* ── Chunk splitting (SSOT) ───────────────────────────────────────────
       Heavy vendor libs land in dedicated chunks so they can be cached
       independently of app code changes. Never merge large vendor libs
       back into the main bundle — cache invalidation defeats the purpose. */
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-query":  ["@tanstack/react-query"],
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    historyApiFallback: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
