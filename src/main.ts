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
import { setupI18n, i18n } from './i18n'
import './assets/styles/global.css'
import VueDevTools from './components/debug/VueDevTools.vue'
import { watch } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 创建一个响应式的 Element Plus locale
const elementLocale = ref(localStorage.getItem('language') === 'zh-CN' ? zhCn : en)

app.use(pinia)
app.use(ElementPlus, {
  locale: elementLocale.value
})
app.use(router)
app.use(setupI18n)
app.component('VueDevTools', VueDevTools)

// 监听 i18n 的语言变化
watch(() => i18n.global.locale.value, (newLocale) => {
  elementLocale.value = newLocale === 'zh-CN' ? zhCn : en
}, { immediate: true })

// 在应用启动时初始化主题
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