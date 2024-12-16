import { ref, onMounted, onUnmounted } from "vue";
import type { ShortcutCategory } from "../types/shortcuts";

const defaultShortcuts: ShortcutCategory[] = [
  {
    id: "general",
    name: "General",
    shortcuts: [
      {
        id: "new-request",
        name: "New Request",
        description: "Create a new request",
        key: "Ctrl+N",
        defaultKey: "Ctrl+N",
        command: "newRequest",
        scope: "global",
      },
      {
        id: "save-request",
        name: "Save Request",
        description: "Save current request",
        key: "Ctrl+S",
        defaultKey: "Ctrl+S",
        command: "saveRequest",
        scope: "request",
      },
      {
        id: "send-request",
        name: "Send Request",
        description: "Send current request",
        key: "Ctrl+Enter",
        defaultKey: "Ctrl+Enter",
        command: "sendRequest",
        scope: "request",
      },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    shortcuts: [
      {
        id: "toggle-sidebar",
        name: "Toggle Sidebar",
        description: "Toggle sidebar visibility",
        key: "Ctrl+B",
        defaultKey: "Ctrl+B",
        command: "toggleSidebar",
        scope: "global",
      },
      {
        id: "switch-tab",
        name: "Switch Tab",
        description: "Switch between tabs",
        key: "Ctrl+Tab",
        defaultKey: "Ctrl+Tab",
        command: "switchTab",
        scope: "global",
      },
    ],
  },
];

export function useShortcuts() {
  const shortcuts = ref<ShortcutCategory[]>([]);
  const handlers = new Map<string, Function>();

  const loadShortcuts = () => {
    const savedShortcuts = localStorage.getItem("shortcuts");
    if (savedShortcuts) {
      shortcuts.value = JSON.parse(savedShortcuts);
    } else {
      shortcuts.value = defaultShortcuts;
    }
  };

  const saveShortcuts = () => {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts.value));
  };

  const updateShortcut = (
    categoryId: string,
    shortcutId: string,
    key: string
  ) => {
    const category = shortcuts.value.find((c) => c.id === categoryId);
    if (category) {
      const shortcut = category.shortcuts.find((s) => s.id === shortcutId);
      if (shortcut) {
        shortcut.key = key;
        saveShortcuts();
      }
    }
  };

  const resetShortcut = (categoryId: string, shortcutId: string) => {
    const category = shortcuts.value.find((c) => c.id === categoryId);
    if (category) {
      const shortcut = category.shortcuts.find((s) => s.id === shortcutId);
      if (shortcut) {
        shortcut.key = shortcut.defaultKey;
        saveShortcuts();
      }
    }
  };

  const registerHandler = (command: string, handler: Function) => {
    handlers.set(command, handler);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = `${e.ctrlKey ? "Ctrl+" : ""}${e.key.toUpperCase()}`;

    for (const category of shortcuts.value) {
      for (const shortcut of category.shortcuts) {
        if (shortcut.key === key) {
          const handler = handlers.get(shortcut.command);
          if (handler) {
            e.preventDefault();
            handler();
          }
        }
      }
    }
  };

  onMounted(() => {
    loadShortcuts();
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return {
    shortcuts,
    updateShortcut,
    resetShortcut,
    registerHandler,
  };
}
