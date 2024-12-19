import './monaco-config'
import { createApp, ref } from 'vue'
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
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const elementLocale = ref(localStorage.getItem('language') === 'zh-CN' ? zhCn : en)

app.use(pinia)
app.use(ElementPlus, {
  locale: elementLocale.value
})
app.use(router)
app.use(setupI18n)
app.component('VueDevTools', VueDevTools)

const initializeTheme = () => {
  const themeStore = useThemeStore()
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

initializeTheme()

app.mount('#app') 