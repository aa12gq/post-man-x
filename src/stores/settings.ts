import { defineStore } from 'pinia';
import { ref } from 'vue';

interface GeneralSettings {
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
}

interface ThemeColors {
  "surface-1": string;
  "surface-2": string;
  "surface-3": string;
  "surface-4": string;
}

export interface Settings {
  general: GeneralSettings;
  themeColors: ThemeColors;
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
  themeColors: {
    "surface-1": "#ffffff",
    "surface-2": "#f0f0f0",
    "surface-3": "#e0e0e0",
    "surface-4": "#d0d0d0",
  },
};

export const useSettings = defineStore('settings', () => {
  const settings = ref<Settings>(loadSettings());

  function loadSettings(): Settings {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        return {
          ...defaultSettings,
          ...JSON.parse(savedSettings),
        };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...defaultSettings };
  }

  function saveSettings() {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings.value));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
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
    applySettings();
  }

  function resetSettings<K extends keyof Settings>(section?: K) {
    if (section) {
      settings.value[section] = { ...defaultSettings[section] };
    } else {
      settings.value = { ...defaultSettings };
    }
    saveSettings();
    applySettings();
  }

  function applySettings() {
    // 应用字体设置
    document.documentElement.style.setProperty(
      '--editor-font-size',
      `${settings.value.general.fontSize}px`
    );
    document.documentElement.style.setProperty(
      '--editor-font-family',
      settings.value.general.fontFamily
    );

    // 发出设置变更事件
    window.dispatchEvent(
      new CustomEvent('settings-changed', { detail: settings.value })
    );
  }

  // 初始化时应用设置
  applySettings();

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}); 