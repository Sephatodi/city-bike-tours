import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

async function isBackendReady(target) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 500);
  try {
    const response = await fetch(`${target}/api/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const configuredTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL;
  const apiTarget = configuredTarget
    || (await isBackendReady("http://localhost:3000") ? "http://localhost:3000" : null)
    || (await isBackendReady("http://localhost:3001") ? "http://localhost:3001" : "http://localhost:3000");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
