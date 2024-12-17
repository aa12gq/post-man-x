import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Theme, ThemePreset } from "../types/theme";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import { officialThemes } from "../constants/officialThemes";

// 辅助函数：将十六进制颜色转换为 RGB
function hexToRgb(hex: string) {
  // 移除可能存在的 # 前缀
  hex = hex.replace(/^#/, "");

  // 处理缩写形式 (#fff => #ffffff)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // 解析 RGB 值
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// 默认主题设置
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
    "surface-1": "#ffffff",
    "surface-2": "#f5f7fa",
    "surface-3": "#f0f2f5",
    "surface-4": "#e4e7ed",
    text: "#333333",
    "text-secondary": "#909399",
    border: "#dcdfe6",
    hover: "rgba(64, 158, 255, 0.1)",
    header: "#f0f2f5",
    shadow: "rgba(0, 0, 0, 0.1)",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    selected: "rgba(64, 158, 255, 0.15)",
    "selected-hover": "rgba(64, 158, 255, 0.25)",
    "border-active": "rgba(64, 158, 255, 0.3)",
  },
  backgroundImage: {
    enabled: false,
    image: "",
    blendMode: "normal",
    opacity: 0.1,
    type: "image",
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
    "surface-1": "#2d2d2d",
    "surface-2": "#252525",
    "surface-3": "#1e1e1e",
    "surface-4": "#181818",
    text: "#ffffff",
    "text-secondary": "#a0a0a0",
    border: "#333333",
    hover: "rgba(64, 158, 255, 0.15)",
    header: "#1e1e1e",
    shadow: "rgba(0, 0, 0, 0.3)",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    selected: "rgba(64, 158, 255, 0.25)",
    "selected-hover": "rgba(64, 158, 255, 0.35)",
    "border-active": "rgba(64, 158, 255, 0.4)",
  },
  backgroundImage: {
    enabled: false,
    image: "",
    blendMode: "normal",
    opacity: 0.1,
    type: "image",
  },
};

// Element Plus 主题变量映射
const elementPlusVariables = {
  primary: "--el-color-primary",
  "primary-light": "--el-color-primary-light-3",
  "primary-dark": "--el-color-primary-dark-2",
  success: "--el-color-success",
  warning: "--el-color-warning",
  danger: "--el-color-danger",
  info: "--el-color-info",
  text: "--el-text-color-primary",
  "text-secondary": "--el-text-color-regular",
  border: "--el-border-color",
  background: "--el-bg-color",
  "background-light": "--el-bg-color-page",
} as const;

// 安全深拷贝函数
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 在文件开头添加一个函数来重置到默认主题
function resetToDefaultTheme(): Theme {
  // 只清除当前主题相关的存储
  localStorage.removeItem("theme-settings");
  localStorage.removeItem("current-theme");

  // 返回一个全新的默认主题实例
  return deepClone(defaultLightTheme);
}

export const useThemeStore = defineStore(
  "theme",
  () => {
    const currentTheme = ref<Theme>(defaultLightTheme);
    const customThemes = ref<Theme[]>([]);
    const themePreset = ref<ThemePreset>("light");
    const isInitialized = ref(false);
    const officialCustomThemes = ref<Theme[]>([]);

    // 初始化主题
    function initializeTheme() {
      if (isInitialized.value) return;

      // 初始化官方主题
      officialCustomThemes.value = officialThemes.map((theme) => ({
        ...theme,
        id: `official_${theme.name.toLowerCase().replace(/\s+/g, "_")}`,
      }));

      // 监听系统主题变化
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        if (themePreset.value === "system") {
          const theme = e.matches ? defaultDarkTheme : defaultLightTheme;
          currentTheme.value = deepClone(theme);
          applyTheme(currentTheme.value);
        }
      });

      loadThemeSettings();
      isInitialized.value = true;
    }

    // 从本地存储加载主题设置
    function loadThemeSettings() {
      try {
        const savedTheme = localStorage.getItem("theme-settings");
        const savedCurrentTheme = localStorage.getItem("current-theme");

        if (!savedTheme) {
          applyDefaultTheme();
          return;
        }

        let settings;
        try {
          settings = JSON.parse(savedTheme);
        } catch {
          console.warn("Invalid theme settings JSON");
          applyDefaultTheme();
          return;
        }

        const { preset, custom = [] } = settings;

        if (
          !preset ||
          !["system", "light", "dark", "custom"].includes(preset)
        ) {
          console.warn("Invalid theme preset");
          applyDefaultTheme();
          return;
        }

        customThemes.value = custom;
        themePreset.value = preset;

        if (preset === "custom") {
          try {
            const parsedTheme = JSON.parse(savedCurrentTheme || "");
            if (isValidTheme(parsedTheme)) {
              currentTheme.value = parsedTheme;
              applyTheme(parsedTheme);
            } else {
              throw new Error("Invalid theme structure");
            }
          } catch {
            console.warn("Invalid custom theme, using default");
            applyDefaultTheme();
          }
        } else {
          const theme =
            preset === "dark" ? defaultDarkTheme : defaultLightTheme;
          currentTheme.value = theme;
          applyTheme(theme);
        }
      } catch (error) {
        console.error("Failed to load theme settings:", error);
        applyDefaultTheme();
      }
    }

    function isValidTheme(theme: any): theme is Theme {
      return (
        theme &&
        typeof theme.id === "string" &&
        isValidThemeId(theme.id) &&
        typeof theme.name === "string" &&
        typeof theme.isDark === "boolean" &&
        theme.colors &&
        typeof theme.colors === "object"
      );
    }

    // 应用默认主题
    function applyDefaultTheme() {
      // 使用重置函数来确保完全回到默认状态
      const defaultTheme = resetToDefaultTheme();

      // 更新 store 状态
      themePreset.value = "light";
      currentTheme.value = defaultTheme;
      customThemes.value = [];

      // 应用主题
      applyTheme(defaultTheme);

      // 保存设置
      saveThemeSettings();
    }

    // 应用主题
    function applyTheme(theme: Theme) {
      const root = document.documentElement;
      const style =
        document.getElementById("element-plus-theme") ||
        document.createElement("style");
      const cssVars: string[] = [];
      const elementVars: string[] = [];

      // 先应用 CSS 变量
      Object.entries(theme.colors).forEach(([key, value]) => {
        cssVars.push(`--${key}: ${value};`);
        if (key === "background") {
          const rgb = hexToRgb(value);
          if (rgb) {
            cssVars.push(`--background-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`);
          }
        }
        if (key in elementPlusVariables) {
          const elVar =
            elementPlusVariables[key as keyof typeof elementPlusVariables];
          elementVars.push(`${elVar}: ${value} !important;`);
        }
      });

      // 应用背景图片设置
      if (theme.backgroundImage?.enabled) {
        const {
          type,
          image,
          blendMode,
          opacity,
          gradient,
          pattern,
          position,
          repeat,
          size,
        } = theme.backgroundImage;

        if (type === "image" && image) {
          const overlayColor = theme.isDark ? "0, 0, 0" : "255, 255, 255";
          cssVars.push(
            `--background-overlay: linear-gradient(rgba(${overlayColor}, ${
              1 - opacity
            }), rgba(${overlayColor}, ${1 - opacity}));`
          );
          cssVars.push(`--background-image: url("${image}");`);
          cssVars.push(`--background-blend-mode: ${blendMode || "normal"};`);
          cssVars.push(`--background-size: ${size || "cover"};`);
          cssVars.push(
            `--background-position: ${position || "center center"};`
          );
          cssVars.push(`--background-repeat: ${repeat || "no-repeat"};`);
          cssVars.push(`--background-attachment: fixed;`);
        } else if (type === "gradient" && gradient) {
          cssVars.push(`--background-image: ${gradient};`);
          cssVars.push(`--background-overlay: none;`);
        } else if (type === "pattern" && pattern) {
          cssVars.push(`--background-image: url("${pattern}");`);
          cssVars.push(`--background-overlay: none;`);
          cssVars.push(`--background-repeat: repeat;`);
        } else {
          // 如果没有启用背景图片，清除相关样式
          cssVars.push(`--background-image: none;`);
          cssVars.push(`--background-overlay: none;`);
          cssVars.push(`--background-blend-mode: normal;`);
          cssVars.push(`--background-size: auto;`);
          cssVars.push(`--background-position: initial;`);
          cssVars.push(`--background-repeat: repeat;`);
          cssVars.push(`--background-attachment: scroll;`);
        }
      }

      // 应用所有 CSS 变量
      root.setAttribute("style", cssVars.join(" "));

      // 更新 Element Plus 样式
      style.id = "element-plus-theme";
      style.textContent = `:root { ${elementVars.join(" ")} }`;
      if (!style.parentNode) {
        document.head.appendChild(style);
      }

      currentTheme.value = theme;
    }

    // 保存主题设置到本地存储
    function saveThemeSettings() {
      try {
        localStorage.setItem(
          "theme-settings",
          JSON.stringify({
            preset: themePreset.value,
            custom: customThemes.value,
          })
        );

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
      let themeToApply: Theme;

      switch (preset) {
        case "custom":
          if (themeId) {
            // 先从官方主题中查找
            const officialTheme = officialCustomThemes.value.find(
              (t) => t.id === themeId
            );
            // 再从自定义主题中查找
            const customTheme = customThemes.value.find(
              (t) => t.id === themeId
            );

            const foundTheme = officialTheme || customTheme;

            if (!foundTheme) {
              console.warn("Theme not found, using default light theme");
              themeToApply = deepClone(defaultLightTheme);
              preset = "light";
            } else {
              themeToApply = deepClone(foundTheme);
            }
          } else {
            themeToApply = deepClone(defaultLightTheme);
            preset = "light";
          }
          break;

        case "system":
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          themeToApply = prefersDark
            ? deepClone(defaultDarkTheme)
            : deepClone(defaultLightTheme);
          break;

        case "dark":
          themeToApply = deepClone(defaultDarkTheme);
          break;

        case "light":
          themeToApply = deepClone(defaultLightTheme);
          break;

        default:
          themeToApply = deepClone(defaultLightTheme);
          preset = "light";
          break;
      }

      // 更新主题预设和当前主题
      themePreset.value = preset;
      currentTheme.value = themeToApply;
      applyTheme(themeToApply);

      // 保存设置
      saveThemeSettings();
    }

    // 自定义题管理
    function addCustomTheme(theme: Omit<Theme, "id">) {
      const id = generateThemeId();
      if (!isValidThemeId(id)) {
        throw new Error("Failed to generate valid theme ID");
      }

      const newTheme = { ...theme, id };
      customThemes.value = [...customThemes.value, newTheme];
      themePreset.value = "custom";
      currentTheme.value = deepClone(newTheme);
      applyTheme(currentTheme.value);
      saveThemeSettings();

      return newTheme;
    }

    function generateThemeId(): string {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10);
      const prefix = "theme";
      return `${prefix}_${timestamp}_${random}`;
    }

    function isValidThemeId(id: string): boolean {
      return /^theme_\d+_[a-z0-9]{8}$/.test(id);
    }

    function updateCustomTheme(theme: Theme) {
      const index = customThemes.value.findIndex((t) => t.id === theme.id);
      if (index === -1) {
        throw new Error("Theme not found");
      }

      customThemes.value[index] = theme;

      if (currentTheme.value.id === theme.id) {
        currentTheme.value = theme;
        applyTheme(theme);
      }

      saveThemeSettings();
    }

    function removeCustomTheme(themeId: string) {
      const index = customThemes.value.findIndex((t) => t.id === themeId);
      if (index === -1) return;

      customThemes.value = customThemes.value.filter((t) => t.id !== themeId);

      if (currentTheme.value.id === themeId) {
        // 如果删除的是当前主题，切换到默认主题
        switchTheme("light");
      }

      saveThemeSettings();
    }

    function exportTheme(theme: Theme) {
      const themeData = JSON.stringify(theme, null, 2);
      const blob = new Blob([themeData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${theme.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-theme.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    async function importTheme(file: File): Promise<Omit<Theme, "id">> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const theme = JSON.parse(content);

            if (!isValidThemeStructure(theme)) {
              throw new Error("Invalid theme structure");
            }

            // 移除 id，因为导入时会生成新的 id
            const { id, ...themeWithoutId } = theme;
            resolve(themeWithoutId);
          } catch (error) {
            reject(new Error("Invalid theme file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    }

    // 验证主题结构的辅助函数
    function isValidThemeStructure(theme: any): theme is Theme {
      return (
        theme &&
        typeof theme.name === "string" &&
        typeof theme.isDark === "boolean" &&
        theme.colors &&
        typeof theme.colors === "object" &&
        Object.keys(defaultLightTheme.colors).every(
          (key) => typeof theme.colors[key] === "string"
        )
      );
    }

    const allCustomThemes = computed(() => [
      ...officialCustomThemes.value,
      ...customThemes.value,
    ]);

    // 添加背景图片处理函数
    async function handleBackgroundImage(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error("Failed to read image file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(file);
      });
    }

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
      officialCustomThemes,
      allCustomThemes,
      handleBackgroundImage,
    };
  },
  {
    persist: {
      key: "theme-store",
      storage: localStorage,
      paths: ["customThemes", "themePreset"],
    } as PersistenceOptions,
  }
);
