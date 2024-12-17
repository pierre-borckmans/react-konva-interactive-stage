import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  resolve: {
    alias: process.env.NODE_ENV === 'development' ? {
      'react-konva-interactive-stage': path.resolve(__dirname, '../src/index.ts'),
    } : {},
  },
});
