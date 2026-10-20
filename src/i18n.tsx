import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import contentEnglish from "./content.en.json";
import interfaceEnglish from "./ui.en.json";
import { articles, concepts, edges } from "./content";
import { nextEnglish } from "./content-next";
import { algebraEnglish } from "./content-algebra";

export type Language = "zh" | "en";
const LANGUAGE_KEY = "nms-language-v1";
const catalog: Record<string, string> = { ...contentEnglish, ...interfaceEnglish, ...nextEnglish, ...algebraEnglish };
export type Translate = (value: string, ...parameters: (string | number)[]) => string;

/** @requires Curated text, never user notes. @ensures Both languages keep identical identifiers and TeX. */
export function translate(language: Language, value: string, ...parameters: (string | number)[]) {
  const key = value.replace(/\s+/g, " ").trim();
  const text = language === "en" ? (catalog[value] ?? catalog[key] ?? value) : value;
  return text.replace(/\{(\d+)\}/g, (match, index) =>
    parameters[Number(index)] === undefined ? match : String(parameters[Number(index)]),
  );
}

/** @requires Static content only. @ensures Numeric models, source URLs and formula blocks are preserved. */
export function localizeContent<T>(value: T, language: Language): T {
  if (typeof value === "string") return translate(language, value) as T;
  if (Array.isArray(value)) return value.map(item => localizeContent(item, language)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) =>
      [key, localizeContent(item, language)],
    )) as T;
  }
  return value;
}

const content = {
  zh: { articles, concepts, edges },
  en: localizeContent({ articles, concepts, edges }, "en"),
};
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
}>({ language: "zh", setLanguage: () => {}, t: (text, ...args) => translate("zh", text, ...args) });

/** @requires Browser storage is optional. @ensures Switching languages does not remount the reader or alter progress. */
export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (initialLanguage) return initialLanguage;
    try { return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "zh"; }
    catch { return "zh"; }
  });
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    try { localStorage.setItem(LANGUAGE_KEY, language); }
    catch { /* The current session remains usable when browser storage is unavailable. */ }
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (text, ...args) => translate(language, text, ...args) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export const useContent = () => content[useLanguage().language];
