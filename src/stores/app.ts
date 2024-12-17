import { defineStore } from "pinia";
import type { Ref } from "vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const locale = ref(localStorage.getItem("app-locale") || "en");

  function setLocale(newLocale: string) {
    locale.value = newLocale;
    localStorage.setItem("app-locale", newLocale);

    try {
      const i18n = useI18n();
      if (i18n && typeof i18n.locale !== "undefined") {
        if (i18n.locale && "value" in i18n.locale) {
          (i18n.locale as Ref<string>).value = newLocale;
        }
      }
    } catch (error) {
      console.error("Failed to update i18n locale:", error);
    }
  }

  return {
    locale,
    setLocale,
  };
});
