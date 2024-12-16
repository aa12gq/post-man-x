import { ref, watch } from 'vue';

export interface Settings {
  // 通用设置
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
  // 主题设置
  theme: {
    preset: 'light' | 'dark' | 'custom';
    customThemes: any[];
    activeThemeId?: string;
  };
  // 快捷键设置
  shortcuts: {
    categories: any[];
  };
}

const defaultSettings: Settings = {
  general: {
    defaultRequestType: 'rpc',
    autoSave: true,
    autoSaveInterval: 5,
    maxHistoryItems: 100,
    responseSizeLimit: 10,
    fontSize: '14',
    fontFamily: 'system-ui',
    tabSize: 2,
    wordWrap: true,
    showLineNumbers: true,
  },
  theme: {
    preset: 'light',
    customThemes: [],
  },
  shortcuts: {
    categories: [],
  },
};

export function useSettings() {
  const settings = ref<Settings>(loadSettings());

  function loadSettings(): Settings {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      return {
        ...defaultSettings,
        ...JSON.parse(savedSettings),
      };
    }
    return { ...defaultSettings };
  }

  function saveSettings() {
    localStorage.setItem('app-settings', JSON.stringify(settings.value));
  }

  function updateSettings<K extends keyof Settings>(
    section: K,
    newSettings: Partial<Settings[K]>
  ) {
    settings.value[section] = {
      ...settings.value[section],
      ...newSettings,
    };
    saveSettings();
  }

  function resetSettings<K extends keyof Settings>(section?: K) {
    if (section) {
      settings.value[section] = { ...defaultSettings[section] };
    } else {
      settings.value = { ...defaultSettings };
    }
    saveSettings();
  }

  // 监听设置变化并应用
  watch(
    () => settings.value,
    (newSettings) => {
      // 应用字体设置
      document.documentElement.style.setProperty(
        '--editor-font-size',
        `${newSettings.general.fontSize}px`
      );
      document.documentElement.style.setProperty(
        '--editor-font-family',
        newSettings.general.fontFamily
      );

      // 发出设置变更事件
      window.dispatchEvent(
        new CustomEvent('settings-changed', { detail: newSettings })
      );
    },
    { deep: true }
  );

  return {
    settings,
    updateSettings,
    resetSettings,
  };
} 