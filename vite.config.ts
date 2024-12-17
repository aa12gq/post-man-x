import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import vueI18n from '@intlify/vite-plugin-vue-i18n'

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin({}),
    electron([
      {
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
    renderer(),
    vueI18n({
      include: [resolve(__dirname, './src/locales/langs/**')],
      runtimeOnly: false,
      compositionOnly: true,
      fullInstall: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['electron'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jsonWorker: ['monaco-editor/esm/vs/language/json/json.worker'],
          editorWorker: ['monaco-editor/esm/vs/editor/editor.worker'],
        }
      }
    },
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: true,
  }
}) 