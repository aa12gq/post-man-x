<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="logo-container">
        <LogoIcon class="logo" />
        <span class="app-title">RPC Master</span>
      </div>
      <WorkspaceSelector />
      <ToolbarIcons />
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn" @click="handleImport">
        <ImportIcon class="btn-icon" />
        <span class="btn-text">导入</span>
      </button>
      <button class="toolbar-btn" @click="handleExport">
        <ExportIcon class="btn-icon" />
        <span class="btn-text">导出</span>
      </button>
      <div class="divider"></div>
      <SettingsDropdown />
      <ThemeSwitch />
      <UserAvatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from "../../components/icons/LogoIcon.vue";
import WorkspaceSelector from "./WorkspaceSelector.vue";
import ToolbarIcons from "./ToolbarIcons.vue";
import SettingsDropdown from "./SettingsDropdown.vue";
import ThemeSwitch from "./ThemeSwitch.vue";
import UserAvatar from "./UserAvatar.vue";
import ImportIcon from "../../components/icons/ImportIcon.vue";
import ExportIcon from "../../components/icons/ExportIcon.vue";

const handleImport = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          console.log("导入的数据:", data);
          // TODO: 处理导入的数据
        } catch (err) {
          console.error("导入失败:", err);
          // TODO: 显示错误提示
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const handleExport = () => {
  // 模拟导出数据
  const mockData = {
    version: "1.0",
    exportTime: new Date().toISOString(),
    environments: [
      { id: "dev", name: "开发环境", baseUrl: "http://dev-api.example.com" },
      { id: "prod", name: "生产环境", baseUrl: "http://api.example.com" },
    ],
    collections: [
      {
        id: "1",
        name: "用户服务",
        methods: [
          { name: "getUserInfo", request: { id: 1 } },
          { name: "updateUser", request: { id: 1, name: "test" } },
        ],
      },
    ],
  };

  const blob = new Blob([JSON.stringify(mockData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rpc-master-export-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.toolbar {
  height: 48px;
  min-height: 48px;
  padding: 0 8px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.app-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background-color: var(--hover-color);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
  margin: 0 4px;
  flex-shrink: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .app-title {
    display: none;
  }

  .toolbar {
    padding: 0 4px;
  }

  .toolbar-left,
  .toolbar-right {
    gap: 4px;
  }

  .btn-text {
    display: none;
  }

  .toolbar-btn {
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .divider {
    display: none;
  }
}
</style>
