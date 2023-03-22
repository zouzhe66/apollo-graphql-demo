import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import graphql from "@rollup/plugin-graphql";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      legacy({
        targets: ["defaults", "not IE 11"],
      }),
      graphql(),
    ],
  };
});
