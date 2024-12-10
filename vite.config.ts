import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'electron/main.ts',
      vite: {
        build: {
          outDir: 'dist-electron'
        }
      }
    }),
    electron({
      entry: 'electron/preload.ts',
      onstart(options) {
        options.reload()
      },
      vite: {
        build: {
          outDir: 'dist-electron'
        }
      }
    })
  ]
}) 