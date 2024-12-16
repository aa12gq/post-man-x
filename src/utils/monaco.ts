import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

type MonacoEditor = typeof monaco;
let monacoLoadPromise: Promise<typeof monaco> | null = null;

// 配置 Monaco 环境
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    return new editorWorker();
  }
};

// 初始化 Monaco 编辑器配置
export function initMonaco(): Promise<MonacoEditor> {
  if (!monacoLoadPromise) {
    monacoLoadPromise = new Promise<typeof monaco>((resolve, reject) => {
      try {
        // 配置 JSON 语言
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: true,
          schemas: [],
        });
        
        // 等待一个短暂的时间确保编辑器完全加载
        setTimeout(() => {
          resolve(monaco);
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }
  return monacoLoadPromise;
}

// 创建编辑器实例的工厂函数
export async function createEditor(
  container: HTMLElement,
  options: monaco.editor.IStandaloneEditorConstructionOptions
): Promise<monaco.editor.IStandaloneCodeEditor> {
  const monacoInstance = await initMonaco();
  if (!monacoInstance) {
    throw new Error('Monaco editor failed to load');
  }

  return monacoInstance.editor.create(container, {
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    padding: { top: 0, bottom: 0 },
    lineNumbers: 'on',
    folding: false,
    wordWrap: 'on',
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    fixedOverflowWidgets: true,
    ...options,
  });
} 