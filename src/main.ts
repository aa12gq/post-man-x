import './monaco-config'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/dark.css'
import router from './router'
import { useThemeStore } from './stores/theme'
import { setupI18n } from './i18n'
import './assets/styles/global.css'
import VueDevTools from './components/debug/VueDevTools.vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(ElementPlus)
app.use(router)
app.use(setupI18n)
app.component('VueDevTools', VueDevTools)

// 在应用启动时初始化主题
const initializeTheme = () => {
  const themeStore = useThemeStore()
  // 从本地存储加载上次使用的主题
  const savedTheme = localStorage.getItem('theme-preference')
  if (savedTheme) {
    try {
      const { preset, id } = JSON.parse(savedTheme)
      themeStore.switchTheme(preset, id)
    } catch {
      themeStore.switchTheme('light')
    }
  } else {
    themeStore.switchTheme('light')
  }
}

// 在应用初始化时调用
initializeTheme()

app.mount('#app') 