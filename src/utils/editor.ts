import type { Settings } from "../stores/settings";
import * as monaco from "monaco-editor";
import { editorManager } from "../utils/editorManager";

export function createEditorOptions(
  settings: Settings["general"],
  isDark: boolean
): monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions {
  return {
    fontSize: parseInt(settings.fontSize),
    fontFamily: settings.fontFamily,
    tabSize: settings.tabSize,
    wordWrap: settings.wordWrap ? "on" : "off",
    lineNumbers: settings.showLineNumbers ? "on" : "off",
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    renderWhitespace: "selection",
    automaticLayout: true,
    theme: isDark ? "vs-dark" : "vs",
    // 其他编辑器选项
    renderControlCharacters: true,
    renderLineHighlight: "all",
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      alwaysConsumeMouseWheel: false
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    lineNumbersMinChars: 3,
    folding: false,
    renderStatusBar: {
      position: 'right',
      alignment: 'right'
    },
    showMemory: true,
    maxTokenizationLineLength: 20000,
  };
}

export function applyEditorTheme(isDark: boolean) {
  if (window.monaco) {
    window.monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
  }
}

export function updateAllEditors(
  options: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions
) {
  if (window.monaco) {
    window.monaco.editor.getModels().forEach((model) => {
      const editors = window.monaco.editor.getEditors();
      editors.forEach((editor) => {
        if (editor.getModel() === model) {
          editor.updateOptions(options);
        }
      });
    });
  }
}

export async function loadLanguage(language: string): Promise<void> {
  const monaco = await editorManager.loadMonaco();
  if (!monaco) {
    throw new Error("Monaco editor not loaded");
  }

  // 检查语言是否已加载
  const languages = monaco.languages.getLanguages();
  if (!languages.some((lang: { id: string }) => lang.id === language)) {
    // 语言支持已经包含在基础包中，不需要额外加载
    console.warn(
      `Language ${language} not found, but should be included in base package`
    );
  }
}

export async function setupEditor(
  container: HTMLElement,
  options: any,
  id: string
): Promise<any> {
  try {
    if (!container) {
      throw new Error("Invalid container element");
    }

    const monaco = await editorManager.loadMonaco();
    if (!monaco) {
      throw new Error("Failed to load Monaco editor");
    }

    if (options?.language) {
      await loadLanguage(options.language);
    }

    const editor = monaco.editor.create(container, options);
    editorManager.registerEditor(id, { 
      editor, 
      dispose: () => editor.dispose() 
    });
    return editor;
  } catch (error) {
    console.error("Failed to setup editor:", error);
    throw error;
  }
}

export function setupEditorKeybindings(
  editor: monaco.editor.IStandaloneCodeEditor
) {
  // 格式化文
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    editor.getAction("editor.action.formatDocument")?.run();
  });

  // 查找
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
    editor.getAction("actions.find")?.run();
  });

  // 替换
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
    editor.getAction("editor.action.startFindReplaceAction")?.run();
  });
}

// 创建自定义主题
export function createMonacoTheme(isDark: boolean): monaco.editor.IStandaloneThemeData {
  return {
    base: isDark ? 'vs-dark' as const : 'vs' as const,
    inherit: true,
    rules: [],
    colors: {
      "editor.background": isDark ? "#1e1e1e" : "#ffffff",
      "editor.foreground": isDark ? "#d4d4d4" : "#333333",
      "editor.lineHighlightBackground": isDark ? "#2c2c2c" : "#f5f7fa",
      "editor.selectionBackground": isDark ? "#264f78" : "#e6f2ff",
      "editorLineNumber.foreground": isDark ? "#666666" : "#999999",
      "editorGutter.background": isDark ? "#252525" : "#f5f7fa",
      "editorIndentGuide.background": isDark ? "#404040" : "#e4e7ed",
      "editorIndentGuide.activeBackground": isDark ? "#707070" : "#c0c4cc",
      "editor.inactiveSelectionBackground": isDark ? "#3a3d41" : "#e8f2fc",
      "editorBracketMatch.background": isDark ? "#0d3a58" : "#c9def5",
      "editorBracketMatch.border": isDark ? "#888888" : "#409eff",
    },
  };
}

// 应用主题到编辑器
export function applyMonacoTheme(
  editor: monaco.editor.IStandaloneCodeEditor,
  isDark: boolean
) {
  const theme = createMonacoTheme(isDark);
  monaco.editor.defineTheme("custom-theme", theme);
  monaco.editor.setTheme("custom-theme");
  editor.updateOptions({ theme: "custom-theme" });
}

export { applyThemeToMonaco } from './editorTheme.js';
