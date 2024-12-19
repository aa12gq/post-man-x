import type { App } from "vue";
import { createI18n } from "vue-i18n";
import enUS from "./locales/langs/en-US.json";
import zhCN from "./locales/langs/zh-CN.json";

export type LanguageType = "en-US" | "zh-CN";

const messages = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

export type MessageSchema = (typeof messages)["en-US"];

export const i18n = createI18n<[MessageSchema], LanguageType>({
  legacy: false,
  locale: (localStorage.getItem("language") ||
    navigator.language) as LanguageType,
  fallbackLocale: "en-US",
  messages,
  missingWarn: false,
  fallbackWarn: false,
});

export function $t(key: string) {
  return i18n.global.t(key);
}

export function setLanguage(lang: LanguageType) {
  // @ts-ignore
  i18n.global.locale.value = lang;
  localStorage.setItem("language", lang);
  document.querySelector("html")?.setAttribute("lang", lang);
}

export async function setupI18n(app: App) {
  app.use(i18n);
}
