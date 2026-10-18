import { useLanguage } from "./i18n";

// Code-native dot silhouette: quiff, jacket, microphone and alternating dance steps.
export function Rickroll({ onUnlock }: { onUnlock: () => void }) {
  const { language } = useLanguage();
  return <a className="rickroll" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noreferrer" aria-label={language === "en" ? "Rickroll · open music video" : "Rickroll · 打开音乐视频"} onClick={onUnlock} title="Never gonna give you up">
    <svg viewBox="0 0 100 120" aria-hidden="true"><defs><pattern id="rick-dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.35" fill="currentColor" /></pattern></defs><g fill="url(#rick-dots)"><g className="rick-body"><path d="M42 10L60 7L66 17L63 23H42L37 17Z"/><path d="M42 22H62V36L54 42L43 36Z"/><path d="M36 43L48 39L53 48L59 39L70 43L67 76H36Z"/><path className="rick-arm" d="M37 45L28 48L18 67L23 73L39 58ZM66 45L75 48L81 61L72 66L63 54Z"/><path d="M41 77H53L49 101L37 113H25L39 94Z" className="rick-leg"/><path d="M54 77H65L67 99L79 111H65L56 101Z"/></g><path d="M77 44H81V109H89V113H67V109H77Z"/><path d="M72 36H85V44H72Z"/></g></svg>
  </a>;
}
