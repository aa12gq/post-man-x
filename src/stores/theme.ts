import { defineStore } from "pinia";
import { ref } from "vue";
import type { Theme, ThemePreset } from "../types/theme";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";

declare module "pinia" {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | PersistenceOptions | PersistenceOptions[];
  }
}

const defaultLightTheme: Theme = {
  id: "light",
  name: "Light",
  isDark: false,
  colors: {
    primary: "#409eff",
    "primary-light": "#ecf5ff",
    "primary-dark": "#337ecc",
    background: "#ffffff",
    "background-light": "#f5f7fa",
    "background-dark": "#e4e7ed",
    text: "#333333",
    "text-secondary": "#909399",
    border: "#dcdfe6",
    hover: "#f5f7fa",
    header: "#f5f7fa",
    shadow: "rgba(0, 0, 0, 0.1)",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
  },
};

const defaultDarkTheme: Theme = {
  id: "dark",
  name: "Dark",
  isDark: true,
  colors: {
    primary: "#409eff",
    "primary-light": "#18222c",
    "primary-dark": "#337ecc",
    background: "#1e1e1e",
    "background-light": "#252525",
    "background-dark": "#141414",
    text: "#e0e0e0",
    "text-secondary": "#909399",
    border: "#333333",
    hover: "#2c2c2c",
    header: "#252525",
    shadow: "rgba(0, 0, 0, 0.3)",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
  },
};

export const useThemeStore = defineStore(
  "theme",
  () => {
    const currentTheme = ref<Theme>(defaultLightTheme);
    const customThemes = ref<Theme[]>([]);
    const themePreset = ref<ThemePreset>("light");
    const isInitialized = ref(false);

    // 初始化主题
    function initializeTheme() {
      if (isInitialized.value) return;

      loadThemeSettings();
      isInitialized.value = true;
    }

    // 从本地存储加载主题设置
    function loadThemeSettings() {
      try {
        const savedTheme = localStorage.getItem("theme-settings");
        const savedCurrentTheme = localStorage.getItem("current-theme");

        if (savedTheme) {
          const { preset, custom } = JSON.parse(savedTheme);
          customThemes.value = custom || [];
          themePreset.value = preset;

          if (preset === "custom") {
            try {
              const parsedTheme = JSON.parse(savedCurrentTheme || "");
              if (parsedTheme && parsedTheme.id && parsedTheme.colors) {
                currentTheme.value = parsedTheme;
                applyTheme(parsedTheme);
              }
            } catch {
              console.warn("Failed to parse saved theme, using default");
              applyDefaultTheme();
            }
          } else {
            const theme =
              preset === "dark" ? defaultDarkTheme : defaultLightTheme;
            currentTheme.value = theme;
            applyTheme(theme);
          }
        } else {
          applyDefaultTheme();
        }
      } catch (error) {
        console.error("Failed to load theme settings:", error);
        applyDefaultTheme();
      }
    }

    // 应用默认主题
    function applyDefaultTheme() {
      // 更新 store 状态
      themePreset.value = "light";
      currentTheme.value = defaultLightTheme;
      customThemes.value = [];

      // 应用主题
      applyTheme(defaultLightTheme);

      // 保存设置
      saveThemeSettings();
    }

    // 应用主题
    function applyTheme(theme: Theme) {
      const root = document.documentElement;

      // 应用基础主题类型
      root.setAttribute("data-theme", theme.isDark ? "dark" : "light");

      // 应用所有颜色变量
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);

        // 设置 Element Plus 对应的变量
        switch (key) {
          case "primary":
            root.style.setProperty("--el-color-primary", value);
            break;
          case "success":
            root.style.setProperty("--el-color-success", value);
            break;
          case "warning":
            root.style.setProperty("--el-color-warning", value);
            break;
          case "danger":
            root.style.setProperty("--el-color-danger", value);
            break;
          case "info":
            root.style.setProperty("--el-color-info", value);
            break;
          case "text":
            root.style.setProperty("--el-text-color-primary", value);
            break;
          case "text-secondary":
            root.style.setProperty("--el-text-color-regular", value);
            break;
          case "border":
            root.style.setProperty("--el-border-color", value);
            break;
          case "background":
            root.style.setProperty("--el-bg-color", value);
            break;
          case "background-light":
            root.style.setProperty("--el-bg-color-page", value);
            break;
        }
      });

      // 应用 Element Plus 主题变量
      const elementStyles =
        document.getElementById("element-plus-theme") ||
        document.createElement("style");
      elementStyles.id = "element-plus-theme";
      elementStyles.textContent = `
        :root {
          --el-color-primary: ${theme.colors.primary} !important;
          --el-color-primary-light-3: ${theme.colors["primary-light"]} !important;
          --el-color-primary-dark-2: ${theme.colors["primary-dark"]} !important;
          --el-color-success: ${theme.colors.success} !important;
          --el-color-warning: ${theme.colors.warning} !important;
          --el-color-danger: ${theme.colors.danger} !important;
          --el-color-info: ${theme.colors.info} !important;
          
          --el-bg-color: ${theme.colors.background} !important;
          --el-bg-color-page: ${theme.colors["background-light"]} !important;
          --el-text-color-primary: ${theme.colors.text} !important;
          --el-text-color-regular: ${theme.colors["text-secondary"]} !important;
          --el-border-color: ${theme.colors.border} !important;
        }
      `;

      if (!elementStyles.parentNode) {
        document.head.appendChild(elementStyles);
      }

      currentTheme.value = theme;
    }

    // 保存主题设置到本地存储
    function saveThemeSettings() {
      try {
        // 保存主题设置
        localStorage.setItem(
          "theme-settings",
          JSON.stringify({
            preset: themePreset.value,
            custom: customThemes.value,
          })
        );

        // 如果是自定义主题，保存当前主题的完整信息
        if (themePreset.value === "custom") {
          localStorage.setItem(
            "current-theme",
            JSON.stringify(currentTheme.value)
          );
        }
      } catch (error) {
        console.error("Failed to save theme settings:", error);
      }
    }

    // 切换主题
    function switchTheme(preset: ThemePreset, themeId?: string) {
      themePreset.value = preset;
      let themeToApply: Theme;

      if (preset === "custom" && themeId) {
        const theme = customThemes.value.find((t) => t.id === themeId);
        if (theme) {
          themeToApply = { ...theme }; // 创建一个副本
        } else {
          console.warn("Theme not found:", themeId);
          themeToApply = { ...defaultLightTheme };
        }
      } else {
        themeToApply =
          preset === "dark"
            ? { ...defaultDarkTheme }
            : { ...defaultLightTheme };
      }

      // 更新 store 状态
      currentTheme.value = themeToApply;

      // 应用主题
      applyTheme(themeToApply);

      // 保存设置到 localStorage
      saveThemeSettings();
    }

    // 添加自定义主题
    function addCustomTheme(theme: Omit<Theme, "id">) {
      const newTheme = {
        ...theme,
        id: Date.now().toString(),
      };
      customThemes.value = [...customThemes.value, newTheme];

      // 添加后自动切换到新主题
      themePreset.value = "custom";
      applyTheme(newTheme);
      saveThemeSettings();

      return newTheme;
    }

    // 更新自定义主题
    const updateCustomTheme = (theme: Theme) => {
      const index = customThemes.value.findIndex((t) => t.id === theme.id);
      if (index !== -1) {
        customThemes.value[index] = theme;
        saveThemeSettings();

        if (currentTheme.value.id === theme.id) {
          applyTheme(theme);
        }
      }
    };

    // 删除自定义主题
    const removeCustomTheme = (themeId: string) => {
      const index = customThemes.value.findIndex((t) => t.id === themeId);
      if (index !== -1) {
        customThemes.value.splice(index, 1);
        saveThemeSettings();
      }
    };

    // 导出主题
    const exportTheme = (theme: Theme) => {
      const blob = new Blob([JSON.stringify(theme, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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
            reject(new Error("Invalid theme file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read theme file"));
        reader.readAsText(file);
      });
    };

    // 在主题切换函数中应用所有变量
    const applyThemeVariables = (variables: Record<string, string>) => {
      Object.entries(variables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    };

    return {
      currentTheme,
      customThemes,
      themePreset,
      initializeTheme,
      switchTheme,
      addCustomTheme,
      updateCustomTheme,
      removeCustomTheme,
      exportTheme,
      importTheme,
      applyThemeVariables,
    };
  },
  {
    persist: {
      key: "theme-store",
      storage: localStorage,
      paths: ["currentTheme", "customThemes", "themePreset"] as string[],
    } as PersistenceOptions,
  }
);
