import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig(() => ({
  // @ts-expect-error vite-plugin-wasm type mismatch
  plugins: [react(), tailwindcss(), wasm()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            },
            {
              name: "ui-vendor",
              test: /[\\/]node_modules[\\/](lucide-react|motion)[\\/]/,
            },
            {
              name: "radix-vendor",
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            },
          ],
        },
      },
    },
  },
}));
