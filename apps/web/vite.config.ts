import { defineConfig } from "vite-plus";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tanstackRouter(), react()],
});
