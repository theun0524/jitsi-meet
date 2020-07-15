import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import MAIN_RESOURCES from "../lang/main.json";

import languageDetector from "./languageDetector";

export const DEFAULT_LANGUAGE = "en";

/**
 * The options to initialize i18next with.
 *
 * @type {Object}
 */
const options = {
  defaultNS: "main",
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  load: "languageOnly",
  ns: ["main"],
  react: {
    useSuspense: false,
  },
  returnEmptyString: false,
  returnNull: false,
};

i18next
  // .use(I18nextXHRBackend)
  .use(languageDetector)
  .use(initReactI18next)
  .init(options);

i18next.addResourceBundle(
  DEFAULT_LANGUAGE,
  "main",
  MAIN_RESOURCES,
  /* deep */ true,
  /* overwrite */ true
);

export default i18next;
