import "vue-i18n";
import type { Composer } from "vue-i18n";
import type { LanguageType } from "../locales";

declare module "vue-i18n" {
  interface Composer extends Composer {
    locale: LanguageType;
  }
}
