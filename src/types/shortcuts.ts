export interface Shortcut {
  id: string;
  name: string;
  description: string;
  key: string;
  command: string;
  scope: 'global' | 'editor' | 'request';
  defaultKey: string;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  shortcuts: Shortcut[];
} 