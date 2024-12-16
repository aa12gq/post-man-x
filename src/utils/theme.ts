// 导出工具函数
export function generateThemeStyles(colors: Record<string, string>): string {
  return Object.entries(colors)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n');
}

export function getThemeValue(cssVar: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
}

export function setThemeValue(cssVar: string, value: string): void {
  document.documentElement.style.setProperty(cssVar, value);
}

export function applyThemeToMonaco(monaco: any, isDark: boolean): void {
  monaco.editor.defineTheme('custom-theme', {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': getThemeValue('--editor-bg'),
      'editor.foreground': getThemeValue('--text-color'),
      'editor.lineHighlightBackground': getThemeValue('--hover-color'),
      'editor.selectionBackground': getThemeValue('--editor-selection'),
      'editorLineNumber.foreground': getThemeValue('--editor-line-number'),
      'editorGutter.background': getThemeValue('--editor-gutter-bg'),
    }
  });
  monaco.editor.setTheme('custom-theme');
} 