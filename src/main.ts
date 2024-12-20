import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { createPinia } from "pinia";
import piniaPluginPersist from 'pinia-plugin-persist';
import { createApp, ref } from "vue";
import App from "./App.vue";
import "./assets/styles/global.css";
import VueDevTools from "./components/debug/VueDevTools.vue";
import { setupI18n } from "./locales";
import "./monaco-config";
import router from "./router";
import { useThemeStore } from "./stores/theme";
import "./styles/dark.css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersist);
const elementLocale = ref(
  localStorage.getItem("language") === "zh-CN" ? zhCn : en
);

app.use(pinia);
app.use(ElementPlus, {
  locale: elementLocale.value,
});
app.use(router);
app.use(setupI18n);
app.component("VueDevTools", VueDevTools);

const initializeTheme = () => {
  const themeStore = useThemeStore();
  const savedTheme = localStorage.getItem("theme-preference");
  if (savedTheme) {
    try {
      const { preset, id } = JSON.parse(savedTheme);
      themeStore.switchTheme(preset, id);
    } catch {
      themeStore.switchTheme("light");
    }
  } else {
    themeStore.switchTheme("light");
  }
};

initializeTheme();

app.mount("#app");
