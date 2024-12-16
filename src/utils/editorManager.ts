import type * as monaco from 'monaco-editor';
import type { EditorInstance } from '../types/monaco';

class EditorManager {
  private editors: Map<string, EditorInstance> = new Map();
  private monacoLoadPromise: Promise<typeof monaco> | null = null;

  async loadMonaco(): Promise<typeof monaco> {
    if (!this.monacoLoadPromise) {
      this.monacoLoadPromise = new Promise(async (resolve, reject) => {
        try {
          // 动态导入 Monaco Editor
          const monaco = await import('monaco-editor');
          const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker');
          const jsonWorker = await import('monaco-editor/esm/vs/language/json/json.worker?worker');

          // 配置 Monaco 环境
          self.MonacoEnvironment = {
            getWorker(_, label) {
              if (label === 'json') {
                return new jsonWorker.default();
              }
              return new editorWorker.default();
            }
          };

          resolve(monaco);
        } catch (error) {
          reject(error);
        }
      });
    }
    return this.monacoLoadPromise;
  }

  registerEditor(id: string, instance: EditorInstance) {
    this.editors.set(id, instance);
  }

  disposeEditor(id: string) {
    const instance = this.editors.get(id);
    if (instance) {
      instance.dispose();
      this.editors.delete(id);
    }
  }

  disposeAll() {
    this.editors.forEach(instance => instance.dispose());
    this.editors.clear();
  }

  async createEditor(container: HTMLElement, options: any, id: string) {
    if (!window.monaco) {
      throw new Error('Monaco editor not loaded');
    }
    const editor = window.monaco.editor.create(container, options);
    this.registerEditor(id, { editor, dispose: () => editor.dispose() });
    return editor;
  }
}

export const editorManager = new EditorManager(); 