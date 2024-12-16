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

export interface Settings {
  general: GeneralSettings;
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