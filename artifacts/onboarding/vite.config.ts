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

/* Replit's WebSocket proxy has a ~35-second idle timeout. When the HMR
   WebSocket goes idle, the proxy closes it; Vite enters "polling for
   restart" mode and calls location.reload() on reconnect — causing the
   visible page refresh. Fix: send a WebSocket ping every 15 seconds so
   the connection is never idle long enough for the proxy to drop it. */
function viteHmrKeepAlive(): Plugin {
  return {
    name: "vite-hmr-keep-alive",
    apply: "serve",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        /* Access the underlying ws.Server (not in Vite's public API but
           stable across Vite 4/5/6/7 — keep as any to avoid type drift). */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wss = (server.ws as any).wss as
          | { clients: Set<{ readyState: number; ping(): void }> }
          | undefined;
        if (!wss) return;

        const timer = setInterval(() => {
          wss.clients.forEach((client) => {
            if (client.readyState === 1 /* OPEN */) client.ping();
          });
        }, 15_000);

        server.httpServer?.on("close", () => clearInterval(timer));
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    viteHmrKeepAlive(),
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
