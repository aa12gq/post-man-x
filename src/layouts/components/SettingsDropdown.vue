<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-button class="toolbar-btn">
      <el-icon><Setting /></el-icon>
      <span class="btn-text">{{ $t("header.settings.title") }}</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="theme">
          <el-icon><Brush /></el-icon>
          {{ $t("header.theme.title") }}
        </el-dropdown-item>
        <el-dropdown-item command="layout">
          <el-icon><Grid /></el-icon>
          {{ $t("header.settings.layout") }}
        </el-dropdown-item>
        <el-dropdown-item command="general">
          <el-icon><Setting /></el-icon>
          {{ $t("header.settings.general") }}
        </el-dropdown-item>
        <el-dropdown-item command="shortcuts">
          <el-icon><Operation /></el-icon>
          {{ $t("header.settings.shortcuts") }}
        </el-dropdown-item>
        <el-dropdown-item command="about" divided>
          <el-icon><InfoFilled /></el-icon>
          {{ $t("header.settings.about") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <el-dialog
    v-model="showSettings"
    :title="t('header.settings.title')"
    width="800px"
    :close-on-click-modal="false"
    class="settings-dialog themed-dialog"
  >
    <SettingsPanel :active-tab="activeTab" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Setting,
  Brush,
  Operation,
  InfoFilled,
  Grid,
} from "@element-plus/icons-vue";
import SettingsPanel from "../../components/settings/SettingsPanel.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showSettings = ref(false);
const activeTab = ref("theme");

const openSettings = (tab: string) => {
  activeTab.value = tab;
  showSettings.value = true;
};

const handleCommand = (command: string) => {
  activeTab.value = command;
  showSettings.value = true;
};

// 暴露方法给父组件
defineExpose({
  openSettings,
});
</script>

<style scoped>
/* 设置按钮样式 */
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background-color: var(--surface-2);
  color: var(--text);
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  background-color: var(--surface-1) !important;
  border-color: var(--border) !important;

  .el-dropdown-menu__item {
    color: var(--text-secondary);

    .el-icon {
      margin-right: 8px;
      color: var(--text-secondary);
    }

    &:hover {
      background-color: var(--surface-2);
      color: var(--text);

      .el-icon {
        color: var(--text);
      }
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--surface-2);

      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }

  .el-dropdown-menu__item.el-dropdown-menu__item--divided {
    border-top-color: var(--border);
  }
}

.settings-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }

  /* 对话框主题样式 */
  &:deep(.el-dialog) {
    background-color: var(--surface-1);
    border: 1px solid var(--border);
  }

  :deep(.el-dialog__header) {
    background-color: var(--surface-2);
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  :deep(.el-dialog__title) {
    color: var(--text);
    font-weight: 600;
  }

  :deep(.el-dialog__close) {
    color: var(--text-secondary);

    &:hover {
      color: var(--text);
      background-color: var(--surface-3);
    }
  }
}
</style>
