import * as monaco from 'monaco-editor';

declare global {
  interface Window {
    monaco: typeof monaco;
  }
}

export interface IEditorOptions extends monaco.editor.IEditorOptions {
  value?: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  automaticLayout?: boolean;
  minimap?: { enabled: boolean };
  scrollBeyondLastLine?: boolean;
  fontSize?: number;
  tabSize?: number;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
}

export interface EditorInstance {
  editor: monaco.editor.IStandaloneCodeEditor;
  dispose: () => void;
} 