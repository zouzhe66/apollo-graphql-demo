import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import graphql from '@rollup/plugin-graphql'

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [vue(), vueJsx(), graphql()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
