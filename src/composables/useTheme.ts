import { ref } from 'vue';
import { Theme, ThemePreset } from '../types/theme';
import { generateThemeStyles, applyThemeToMonaco } from '../utils/theme';

const defaultLightTheme: Theme = {
  id: 'light',
  name: 'Light',
  isDark: false,
  colors: {
    primary: '#409eff',
    'primary-light': '#ecf5ff',
    'primary-dark': '#337ecc',
    background: '#ffffff',
    'background-light': '#f5f7fa',
    'background-dark': '#e4e7ed',
    text: '#333333',
    'text-secondary': '#909399',
    border: '#dcdfe6',
    hover: '#f5f7fa',
    header: '#f5f7fa',
    shadow: 'rgba(0, 0, 0, 0.1)',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    info: '#909399',
    selected: 'var(--el-color-primary-light-9)',
    'selected-hover': 'var(--el-color-primary-light-8)',
    'border-active': 'var(--el-color-primary-light-5)',
  },
};

const defaultDarkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  isDark: true,
  colors: {
    primary: '#409eff',
    'primary-light': '#18222c',
    'primary-dark': '#337ecc',
    background: '#1e1e1e',
    'background-light': '#252525',
    'background-dark': '#141414',
    text: '#e0e0e0',
    'text-secondary': '#909399',
    border: '#333333',
    hover: '#2c2c2c',
    header: '#252525',
    shadow: 'rgba(0, 0, 0, 0.3)',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    info: '#909399',
    selected: 'rgba(64, 158, 255, 0.1)',
    'selected-hover': 'rgba(64, 158, 255, 0.15)',
    'border-active': 'rgba(64, 158, 255, 0.2)',
  },
};

export function useTheme() {
  const currentTheme = ref<Theme>(defaultLightTheme);
  const customThemes = ref<Theme[]>([]);
  const themePreset = ref<ThemePreset>('light');

  // 从本地存储加载主题设置
  const loadThemeSettings = () => {
    const savedTheme = localStorage.getItem('theme-settings');
    if (savedTheme) {
      const { preset, custom } = JSON.parse(savedTheme);
      themePreset.value = preset;
      customThemes.value = custom || [];
      
      if (preset === 'custom') {
        const activeCustomTheme = customThemes.value.find(t => t.id === localStorage.getItem('active-custom-theme'));
        if (activeCustomTheme) {
          currentTheme.value = activeCustomTheme;
        }
      } else {
        currentTheme.value = preset === 'dark' ? defaultDarkTheme : defaultLightTheme;
      }
    }
  };

  // 保存主题设置到本地存储
  const saveThemeSettings = () => {
    localStorage.setItem('theme-settings', JSON.stringify({
      preset: themePreset.value,
      custom: customThemes.value,
    }));
    if (themePreset.value === 'custom') {
      localStorage.setItem('active-custom-theme', currentTheme.value.id);
    }
  };

  // 应用主题
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // 应用基础主题类型
    root.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');
    
    // 应用自定义颜色
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // 更新 Element Plus 主题色
    const styles = generateThemeStyles({
      'el-color-primary': theme.colors.primary,
      'el-color-success': theme.colors.success,
      'el-color-warning': theme.colors.warning,
      'el-color-danger': theme.colors.danger,
      'el-color-info': theme.colors.info,
    });
    
    let styleTag = document.getElementById('theme-colors');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-colors';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `:root{${styles}}`;
    
    // 更新编辑器主题
    if (window.monaco) {
      applyThemeToMonaco(window.monaco, theme.isDark);
    }
    
    currentTheme.value = theme;
  };

  // 切换主题
  const switchTheme = (preset: ThemePreset, themeId?: string) => {
    themePreset.value = preset;
    if (preset === 'custom' && themeId) {
      const theme = customThemes.value.find(t => t.id === themeId);
      if (theme) {
        applyTheme(theme);
      }
    } else {
      applyTheme(preset === 'dark' ? defaultDarkTheme : defaultLightTheme);
    }
    saveThemeSettings();
  };

  // 添加自定义主题
  const addCustomTheme = (theme: Omit<Theme, 'id'>) => {
    const newTheme = {
      ...theme,
      id: Date.now().toString(),
    };
    customThemes.value.push(newTheme);
    saveThemeSettings();
    return newTheme;
  };

  // 删除自定义主题
  const removeCustomTheme = (themeId: string) => {
    const index = customThemes.value.findIndex(t => t.id === themeId);
    if (index !== -1) {
      customThemes.value.splice(index, 1);
      saveThemeSettings();
    }
  };

  // 导出主题
  const exportTheme = (theme: Theme) => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${theme.name.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导入主题
  const importTheme = async (file: File): Promise<Theme> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string);
          resolve(theme);
        } catch (err) {
          reject(new Error('Invalid theme file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read theme file'));
      reader.readAsText(file);
    });
  };

  // 更新自定义主题
  const updateCustomTheme = (theme: Theme) => {
    const index = customThemes.value.findIndex(t => t.id === theme.id);
    if (index !== -1) {
      customThemes.value[index] = theme;
      saveThemeSettings();
      
      // 如果正在使用这个主题，需要重新应用
      if (currentTheme.value.id === theme.id) {
        applyTheme(theme);
      }
    }
  };

  // 初始化
  loadThemeSettings();

  return {
    currentTheme,
    customThemes,
    themePreset,
    switchTheme,
    addCustomTheme,
    removeCustomTheme,
    exportTheme,
    importTheme,
    updateCustomTheme,
  };
} 