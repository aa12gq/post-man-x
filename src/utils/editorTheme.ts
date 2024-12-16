import type { editor } from 'monaco-editor';

export function applyThemeToMonaco(monaco: { editor: typeof editor }, isDark: boolean) {
  const theme = {
    base: isDark ? "vs-dark" as const : "vs" as const,
    inherit: true,
    rules: [],
    colors: {
      "editor.background": isDark ? "#1e1e1e" : "#ffffff",
      "editor.foreground": isDark ? "#d4d4d4" : "#333333",
    },
  };
  monaco.editor.defineTheme("custom-theme", theme);
  monaco.editor.setTheme("custom-theme");
}
