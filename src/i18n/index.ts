import { createI18n } from 'vue-i18n'
import en from '../locales/en'
import zhCN from '../locales/zh-CN'

const messages = {
  en,
  'zh-CN': zhCN
}

export const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages
})

export function setLanguage(lang: string) {
  i18n.global.locale.value = lang as "zh-CN" | "en";
  localStorage.setItem('language', lang)
  document.querySelector('html')?.setAttribute('lang', lang)
} 