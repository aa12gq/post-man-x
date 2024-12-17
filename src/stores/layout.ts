import { defineStore } from "pinia";

interface LayoutSettings {
  toolbarPosition: "top" | "bottom";
  isCollapsed: boolean;
  sidebarWidth: number;
  minSidebarWidth: number;
  maxSidebarWidth: number;
  isCollapsible: boolean;
  showSidebar: boolean;
  showToolbar: boolean;
  showTabs: boolean;
  compactMode: boolean;
  showBorders: boolean;
  showShadows: boolean;
  currentLayout: string;
  sidebarPosition: "left" | "right";
  tabsPosition: "top" | "left" | "bottom";
  showHeader?: boolean;
  layoutMode?: "fixed" | "fluid" | "custom";
  mainContentRatio?: number;
  sidebarRatio?: number;
  editorRatio?: number;
  responseRatio?: number;
  responsiveBreakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  animations?: {
    enabled: boolean;
    type: "slide" | "fade";
    duration: number;
  };
}

export const useLayoutStore = defineStore("layout", {
  state: () => {
    const savedSettings = localStorage.getItem("layoutSettings");
    const defaultSettings = {
      toolbarPosition: "top",
      isCollapsed: false,
      sidebarWidth: 240,
      minSidebarWidth: 200,
      maxSidebarWidth: 600,
      isCollapsible: true,
      showSidebar: true,
      showToolbar: true,
      showTabs: true,
      compactMode: false,
      showBorders: true,
      showShadows: true,
      currentLayout: "classic",
      sidebarPosition: localStorage.getItem("sidebarPosition") || "left",
      tabsPosition: "top",
    } as LayoutSettings;

    return {
      settings: savedSettings
        ? { ...defaultSettings, ...JSON.parse(savedSettings) }
        : defaultSettings,
      previewSettings: null as LayoutSettings | null,
    };
  },

  actions: {
    updateSettings(newSettings: Partial<LayoutSettings>) {
      this.settings = { ...this.settings, ...newSettings };
      localStorage.setItem("layoutSettings", JSON.stringify(this.settings));
    },

    previewLayout(settings: Partial<LayoutSettings>) {
      this.previewSettings = {
        ...this.settings,
        ...settings,
      };
    },

    applyPreview() {
      if (this.previewSettings) {
        this.updateSettings(this.previewSettings);
        this.previewSettings = null;
      }
    },

    cancelPreview() {
      this.previewSettings = null;
    },

    toggleSidebar() {
      this.updateSettings({ isCollapsed: !this.settings.isCollapsed });
    },
  },

  getters: {
    currentSettings(): LayoutSettings {
      return this.previewSettings || this.settings;
    },
  },
});
