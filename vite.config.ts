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
    monacoEditorPlugin({
      languageWorkers: ['json'],
      customWorkers: [
        {
          label: 'json',
          entry: 'monaco-editor/esm/vs/language/json/json.worker',
        },
      ],
    }),
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
    include: [
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/editor/editor.worker'
    ],
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
    sourcemap: true,
  }
}) 