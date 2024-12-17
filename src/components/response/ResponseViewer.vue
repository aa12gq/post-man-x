<template>
  <div class="response-viewer">
    <div class="response-header">
      <div class="resize-handle">
        <div class="resize-handle-line"></div>
        <div class="resize-handle-icon">
          <el-icon><ArrowUp /></el-icon>
        </div>
      </div>

      <div class="header-left">
        <span class="header-title"></span>
        <div
          v-if="props.status"
          class="response-status"
          :class="{ success: isSuccess }"
        >
          {{ statusText }}
        </div>
        <span v-if="responseTime !== null" class="response-time">
          {{ responseTime }}ms
        </span>
      </div>
      <div class="header-right">
        <el-button size="small" text>
          <el-icon>
            <ArrowUp />
          </el-icon>
        </el-button>
      </div>
    </div>

    <div class="response-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- Payload 选项卡 -->
        <el-tab-pane
          :label="t('request.rpc.response.tabs.payload')"
          name="body"
        >
          <div class="tab-content">
            <CodeEditor
              style="height: 100%"
              :model-value="response"
              language="json"
              :read-only="true"
            />
            <!-- <div v-else class="empty-response">No response data</div> -->
          </div>
        </el-tab-pane>

        <!-- Debug Info 选项卡 -->
        <el-tab-pane :label="t('request.rpc.response.tabs.debug')" name="debug">
          <div class="tab-content">
            <template v-if="debugCommand || debugLogs">
              <div v-if="debugCommand" class="command-section">
                <h4>{{ t("request.rpc.response.debugCommand") }}</h4>
                <pre>{{ debugCommand }}</pre>
              </div>
              <div v-if="debugLogs" class="logs-section">
                <h4>{{ t("request.rpc.response.debugInfo") }}</h4>
                <pre>{{ debugLogs }}</pre>
              </div>
            </template>
            <div v-else class="empty-response">
              {{ t("request.rpc.response.noDebugInfo") }}
            </div>
          </div>
        </el-tab-pane>

        <!-- Metadata 选项卡 -->
        <el-tab-pane
          :label="t('request.rpc.response.tabs.metadata')"
          name="headers"
        >
          <div class="tab-content">
            <div
              v-for="(values, key) in headers"
              :key="key"
              class="header-item"
            >
              <span class="header-name">{{ key }}:</span>
              <span class="header-value">{{
                Array.isArray(values) ? values.join(", ") : values
              }}</span>
            </div>
            <div
              v-if="Object.keys(headers).length === 0"
              class="empty-response"
            >
              {{ t("request.rpc.response.noMetadata") }}
            </div>
          </div>
        </el-tab-pane>

        <!-- Trailers 选项卡 -->
        <el-tab-pane
          :label="t('request.rpc.response.tabs.trailers')"
          name="trailers"
        >
          <div class="tab-content">
            <div
              v-for="(values, key) in trailers"
              :key="key"
              class="header-item"
            >
              <span class="header-name">{{ key }}:</span>
              <span class="header-value">{{
                Array.isArray(values) ? values.join(", ") : values
              }}</span>
            </div>
            <div
              v-if="Object.keys(trailers).length === 0"
              class="empty-response"
            >
              {{ t("request.rpc.response.noTrailers") }}
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ArrowUp } from "@element-plus/icons-vue";
import CodeEditor from "../CodeEditor.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  response: string;
  responseTime: number | null;
  headers: Record<string, string[]>;
  trailers?: Record<string, string[]>;
  debugLogs?: string;
  debugCommand?: string;
  status?: number | string;
}>();

const activeTab = ref(
  props.response ? "body" : props.debugLogs ? "debug" : "body"
);

const isSuccess = computed(() => {
  if (!props.status) return false;
  const statusCode = Number(props.status);
  return statusCode >= 200 && statusCode < 300;
});

const statusText = computed(() => {
  const statusCode = Number(props.status);
  const statusMap: Record<number, string> = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };
  return `${statusCode} ${statusMap[statusCode] || ""}`;
});

const trailers = computed(() => props.trailers || {});
</script>

<style scoped>
.response-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--surface-1);
  border: none;
  border-radius: 0;
}

.response-viewer.collapsed {
  height: 48px;
}

.response-header {
  position: relative;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.response-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.response-time {
  color: var(--el-text-color-secondary);
  font-size: 0.9em;
}

.header-right {
  display: flex;
  gap: 8px;
}

:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin: 0;
  flex-shrink: 0;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
  height: 100%;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.tab-content {
  height: 100%;
  overflow: auto;
  padding: 16px;
}

.empty-response {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.header-item {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-item:last-child {
  border-bottom: none;
}

.header-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 150px;
}

.header-value {
  color: var(--el-text-color-regular);
  word-break: break-all;
  flex: 1;
}

.command-section,
.logs-section {
  margin-bottom: 20px;
}

.command-section h4,
.logs-section h4 {
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.logs-section {
  white-space: pre-wrap;
  word-break: break-all;
}

.logs-section pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

pre {
  background-color: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}

.response-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  border: 1px solid var(--el-color-danger-light-7);
}

.response-status.success {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
  border: 1px solid var(--el-color-success-light-7);
}

.resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  cursor: row-resize;
  z-index: 1;
}

.resize-handle-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background-color: var(--border-color);
  opacity: 0;
  transition: opacity 0.2s;
}

.resize-handle:hover .resize-handle-line {
  opacity: 1;
  background-color: var(--el-color-primary);
}

.resize-handle-icon {
  display: none;
}
</style>
