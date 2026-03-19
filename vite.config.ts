import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [react(), nitro()],
  nitro: {
    serverDir: "./server",
  },
  staged: {
    "*": "vp check --fix",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
