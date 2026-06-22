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

/* Replit's WebSocket proxy hard-drops connections every ~35 seconds regardless
   of ping/pong activity. Vite's default response is to poll the server and
   then call location.reload() — causing the visible "auto refresh".

   Fix: patch Vite's own client.mjs (via transform hook) to call
   transport.connect() instead of location.reload(). Both symbols are in the
   same closure, so we can reference them directly.  The patched path:
     ✕ await waitForSuccessfulPing(url.href); location.reload();
     ✓ await waitForSuccessfulPing(url.href); transport.connect(createHMRHandler(handleMessage)); */
function viteHmrReconnect(): Plugin {
  return {
    name: "vite-hmr-reconnect",
    apply: "serve",
    transform(code, id) {
      if (!id.includes("vite/dist/client/client.mjs")) return null;

      const patched = code.replace(
        /await waitForSuccessfulPing\(url\.href\);\s*location\.reload\(\);/,
        `console.debug("[vite] connecting...");
transport.connect(createHMRHandler(handleMessage)).catch(() => location.reload());`,
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

      return { code: patched, map: null };
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
