/// <reference types="vue-router" />

// Monaco Editor 类型声明
declare interface Window {
  monaco: any;
}

// 自定义事件类型
interface CustomEventMap {
  'settings-changed': CustomEvent<{
    general: {
      defaultRequestType: 'rpc' | 'http';
      autoSave: boolean;
      autoSaveInterval: number;
      maxHistoryItems: number;
      responseSizeLimit: number;
      fontSize: string;
      fontFamily: string;
      tabSize: number;
      wordWrap: boolean;
      showLineNumbers: boolean;
    };
  }>;
}

declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void;
  }

  interface Window {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Window, ev: CustomEventMap[K]) => void
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Window, ev: CustomEventMap[K]) => void
    ): void;
  }
}

export {}; 