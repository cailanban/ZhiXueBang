import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gpuTarget = env.DIGIHUMAN_PROXY_TARGET || 'http://127.0.0.1:16006';

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/digi-api': {
          target: gpuTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/digi-api/, ''),
        },
      },
    },
  };
});
