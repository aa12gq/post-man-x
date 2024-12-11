<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <div class="header">
      <div class="content-wrapper">
        <div class="theme-switch">
          <el-tooltip content="切换昼夜模式" placement="bottom">
            <el-switch
              v-model="isDarkMode"
              :active-icon="Moon"
              :inactive-icon="Sunny"
              @change="toggleTheme"
              inline-prompt
              style="
                --el-switch-on-color: #409eff;
                --el-switch-off-color: #409eff;
              "
            />
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="app-container">
      <RequestPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { Moon, Sunny } from "@element-plus/icons-vue";
import RequestPanel from "./components/RequestPanel.vue";

const isDarkMode = ref(false);

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  isDarkMode.value = savedTheme === "dark";
  applyTheme(isDarkMode.value);
});

// 换主题
const toggleTheme = (value: boolean) => {
  isDarkMode.value = value;
  applyTheme(value);
  localStorage.setItem("theme", value ? "dark" : "light");
};

// 应用主题
const applyTheme = (isDark: boolean) => {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light"
  );
};
</script>

<style>
:root {
  /* 亮色主题变量 */
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #dcdfe6;
  --hover-color: #f5f7fa;
  --header-bg: #f5f7fa;
  --code-bg: #f8f9fa;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

:root[data-theme="dark"] {
  /* 修改暗色主题变量 */
  --bg-color: #1e1e1e;
  --text-color: #e0e0e0;
  --border-color: #333333;
  --hover-color: #2c2c2c;
  --header-bg: #252525;
  --code-bg: #1e1e1e;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

.header {
  width: 100%;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 10px 0;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.theme-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 优化开关样式 */
:deep(.el-switch) {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #409eff;
}

:deep(.el-switch__core) {
  border-color: transparent;
}

/* 图标样式优化 */
:deep(.el-switch__icon) {
  color: #fff;
}

/* Element Plus 暗色主题覆盖 */
.dark-mode {
  --el-bg-color: var(--bg-color);
  --el-text-color-primary: var(--text-color);
  --el-border-color: var(--border-color);
  --el-fill-color-blank: var(--bg-color);
  --el-bg-color-overlay: var(--header-bg);
  --el-text-color-regular: var(--text-color);
  --el-fill-color: var(--hover-color);
  --el-fill-color-light: var(--hover-color);
  --el-border-color-light: var(--border-color);
  --el-border-color-lighter: var(--border-color);
  --el-mask-color: rgba(0, 0, 0, 0.8);
}

.dark-mode :deep(.el-tabs--border-card) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

.dark-mode :deep(.el-tabs__header) {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

.dark-mode :deep(.el-tab-pane) {
  background-color: var(--bg-color);
}

.dark-mode :deep(.monaco-editor) {
  background-color: var(--code-bg) !important;
}

.dark-mode :deep(.el-drawer) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

.dark-mode :deep(.el-drawer__header) {
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.dark-mode :deep(.el-drawer__body) {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.dark-mode :deep(.el-collapse) {
  border-color: var(--border-color);
}

.dark-mode :deep(.el-collapse-item__header) {
  background-color: var(--header-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}

.dark-mode :deep(.el-collapse-item__content) {
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

.dark-mode :deep(.el-alert) {
  background-color: var(--header-bg);
  color: var(--text-color);
}

.dark-mode :deep(.el-alert__title) {
  color: var(--text-color);
}

.dark-mode :deep(.el-tag) {
  background-color: var(--header-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

/* 添加更多组件的暗色样式 */
.dark-mode {
  /* Select 下拉框 */
  :deep(.el-select-dropdown) {
    background-color: var(--bg-color);
    border-color: var(--border-color);
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-color);
    &.hover,
    &:hover {
      background-color: var(--hover-color);
    }
    &.selected {
      background-color: var(--hover-color);
      color: #409eff;
    }
  }

  /* Input 输入框 */
  :deep(.el-input__wrapper) {
    background-color: var(--bg-color);
    border-color: var(--border-color);
  }

  :deep(.el-input__inner) {
    color: var(--text-color);
    &::placeholder {
      color: #909399;
    }
  }

  /* Button 按钮 */
  :deep(.el-button) {
    &:not(.el-button--primary):not(.el-button--success):not(
        .el-button--warning
      ):not(.el-button--danger) {
      background-color: var(--bg-color);
      border-color: var(--border-color);
      color: var(--text-color);
      &:hover {
        background-color: var(--hover-color);
      }
    }
  }

  /* Table 表格 */
  :deep(.el-table) {
    background-color: var(--bg-color);
    color: var(--text-color);

    th,
    td {
      background-color: var(--bg-color);
      border-color: var(--border-color);
    }

    tr {
      background-color: var(--bg-color);
      &:hover > td {
        background-color: var(--hover-color);
      }
    }

    .el-table__header {
      background-color: var(--header-bg);
      th {
        background-color: var(--header-bg);
      }
    }
  }

  /* Autocomplete 自动完成 */
  :deep(.el-autocomplete-suggestion) {
    background-color: var(--bg-color);
    border-color: var(--border-color);

    li {
      color: var(--text-color);
      &:hover {
        background-color: var(--hover-color);
      }
    }
  }

  /* Tabs 标签页 */
  :deep(.el-tabs__nav-wrap) {
    background-color: var(--header-bg);
  }

  :deep(.el-tabs__item) {
    color: var(--text-color);
    &.is-active {
      color: #409eff;
    }
  }

  /* Message 消息提示 */
  :deep(.el-message) {
    background-color: var(--bg-color);
    border-color: var(--border-color);

    &--info {
      background-color: var(--bg-color);
      border-color: var(--border-color);
    }
  }

  /* Dialog 对话框 */
  :deep(.el-dialog) {
    background-color: var(--bg-color);

    .el-dialog__header {
      background-color: var(--header-bg);
    }

    .el-dialog__title {
      color: var(--text-color);
    }

    .el-dialog__body {
      color: var(--text-color);
    }
  }

  /* Form 表单 */
  :deep(.el-form-item__label) {
    color: var(--text-color);
  }

  /* Radio 单选框 */
  :deep(.el-radio__label) {
    color: var(--text-color);
  }

  /* Checkbox 复选框 */
  :deep(.el-checkbox__label) {
    color: var(--text-color);
  }

  /* Scrollbar 滚动条 */
  :deep(.el-scrollbar__thumb) {
    background-color: rgba(144, 147, 153, 0.3);
    &:hover {
      background-color: rgba(144, 147, 153, 0.5);
    }
  }
}

/* 修改滚动条样式 */
.dark-mode {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--bg-color);
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 4px;
    &:hover {
      background-color: rgba(144, 147, 153, 0.5);
    }
  }
}
</style>
