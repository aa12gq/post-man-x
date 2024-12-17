<template>
  <div>
    <!-- 收藏夹弹窗 -->
    <el-dialog
      v-model="showFavoritesDialog"
      :title="t('dialog.favorites.title')"
      width="60%"
      destroy-on-close
      class="themed-dialog"
    >
      <FavoriteManager @load="handleFavoriteLoad" />
    </el-dialog>

    <!-- 历史记录弹窗 -->
    <el-dialog
      v-model="showHistoryDialog"
      :title="t('dialog.history.title')"
      width="60%"
      destroy-on-close
      class="themed-dialog"
    >
      <RequestHistory
        :history-list="historyList"
        @load-request="handleHistoryLoad"
        @view-details="handleViewDetails"
        @remove-item="handleRemoveHistoryItem"
        @clear-history="handleClearHistory"
      />
    </el-dialog>

    <!-- 环境弹窗 -->
    <el-dialog
      v-model="showEnvironmentDialog"
      :title="t('dialog.environment.title')"
      width="60%"
      destroy-on-close
      class="themed-dialog"
    >
      <EnvironmentManager />
    </el-dialog>

    <!-- 创建工作空间对话框 -->
    <el-dialog
      v-model="showCreateWorkspaceDialog"
      :title="t('dialog.workspace.create')"
      width="500px"
      class="themed-dialog"
    >
      <el-form :model="newWorkspace" label-width="100px">
        <el-form-item :label="t('dialog.workspace.name')">
          <el-input
            v-model="newWorkspace.name"
            :placeholder="t('dialog.workspace.namePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('dialog.workspace.description')">
          <el-input
            v-model="newWorkspace.description"
            type="textarea"
            :placeholder="t('dialog.workspace.descriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateWorkspaceDialog = false">
          {{ t("common.cancel") }}
        </el-button>
        <el-button type="primary" @click="createWorkspace">
          {{ t("common.create") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import FavoriteManager from "../../components/FavoriteManager.vue";
import RequestHistory from "../../components/history/RequestHistory.vue";
import EnvironmentManager from "../../components/EnvironmentManager.vue";
import { useRequestHistory } from "../../composables/useRequestHistory";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showFavoritesDialog = ref(false);
const showHistoryDialog = ref(false);
const showEnvironmentDialog = ref(false);
const showCreateWorkspaceDialog = ref(false);

const {
  history: requestHistory,
  removeHistoryItem,
  clearHistory,
} = useRequestHistory();

const historyList = computed(() => {
  return requestHistory.value.map((item) => ({
    ...item,
    response: {
      ...item.response,
      headers: Object.entries(item.response.headers).reduce(
        (acc, [key, val]) => {
          acc[key] = Array.isArray(val) ? val[0] : val;
          return acc;
        },
        {} as Record<string, string>
      ),
    },
  }));
});

const newWorkspace = ref({
  name: "",
  description: "",
});

// 处理方法...
const handleFavoriteLoad = () => {
  showFavoritesDialog.value = false;
};

const handleHistoryLoad = () => {
  showHistoryDialog.value = false;
};

const handleViewDetails = () => {
  // 处理查看详情
};

const handleRemoveHistoryItem = (item: any) => {
  removeHistoryItem(item);
};

const handleClearHistory = () => {
  clearHistory();
};

const createWorkspace = () => {
  if (!newWorkspace.value.name) return;
  // 创建工作空间的逻辑
  showCreateWorkspaceDialog.value = false;
  newWorkspace.value = { name: "", description: "" };
};
</script>

<style scoped>
/* 对话框主题样式 */
:deep(.themed-dialog) {
  .el-dialog {
    background-color: var(--surface-1);
    border: 1px solid var(--border);
  }

  .el-dialog__header {
    background-color: var(--surface-2);
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .el-dialog__title {
    color: var(--text);
    font-weight: 600;
  }

  .el-dialog__body {
    color: var(--text-secondary);
    background-color: var(--surface-1);
    padding: 20px;
  }

  .el-dialog__footer {
    background-color: var(--surface-2);
    border-top: 1px solid var(--border);
    padding: 12px 20px;
  }

  /* 表单样式 */
  .el-form-item__label {
    color: var(--text);
  }

  .el-input__wrapper {
    background-color: var(--surface-1);
  }

  .el-input__inner {
    color: var(--text);
    background-color: var(--surface-1);
  }

  .el-textarea__inner {
    color: var(--text);
    background-color: var(--surface-1);
  }

  /* 关闭按钮样式 */
  .el-dialog__close {
    color: var(--text-secondary);

    &:hover {
      color: var(--text);
      background-color: var(--surface-3);
    }
  }
}
</style>
