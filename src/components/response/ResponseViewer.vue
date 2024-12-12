<template>
  <div class="response-viewer">
    <div class="response-header">
      <div class="header-left">
        <span class="header-title">Response</span>
        <span v-if="responseTime !== null" class="response-time">
          {{ responseTime }}ms
        </span>
      </div>
      <div class="header-right">
        <el-button size="small" @click="copyResponse">
          <el-icon><DocumentCopy /></el-icon>
          Copy
        </el-button>
        <el-button size="small" @click="$emit('clear')">
          <el-icon><Delete /></el-icon>
          Clear
        </el-button>
      </div>
    </div>

    <div class="response-tabs">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- Response Body 选项卡 -->
        <el-tab-pane label="Response Body" name="body">
          <div class="response-body">
            <CodeEditor
              v-if="response"
              :model-value="response"
              language="json"
              :read-only="true"
            />
            <div v-else class="empty-response">No response data</div>
          </div>
        </el-tab-pane>

        <!-- Debug Info 选项卡 -->
        <el-tab-pane label="Debug Info" name="debug">
          <div class="debug-info">
            <div class="command-section">
              <h4>Command</h4>
              <pre>{{ debugCommand }}</pre>
            </div>
            <div class="logs-section">
              <h4>gRPC Logs</h4>
              <pre>{{ debugLogs }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <!-- Response Headers 选项卡 -->
        <el-tab-pane label="Response Headers" name="headers">
          <div class="headers-list">
            <div v-for="(value, key) in headers" :key="key" class="header-item">
              <span class="header-name">{{ key }}:</span>
              <span class="header-value">{{ value }}</span>
            </div>
            <div
              v-if="Object.keys(headers).length === 0"
              class="empty-response"
            >
              No headers
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DocumentCopy, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import CodeEditor from "../CodeEditor.vue";

const props = defineProps<{
  response: string;
  responseTime: number | null;
  headers: Record<string, string>;
  debugLogs?: string;
  debugCommand?: string;
}>();

const emit = defineEmits<{
  (e: "clear"): void;
}>();

const activeTab = ref("body");

const copyResponse = async () => {
  try {
    await navigator.clipboard.writeText(props.response);
    ElMessage.success("Response copied to clipboard");
  } catch (err) {
    ElMessage.error("Failed to copy response");
  }
};
</script>

<style scoped>
.response-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
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

.response-tabs {
  flex: 1;
  overflow: hidden;
}

.response-body {
  height: 100%;
  min-height: 200px;
}

.empty-response {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-item {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.header-name {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.header-value {
  color: var(--el-text-color-regular);
  word-break: break-all;
}

:deep(.el-tabs__content) {
  height: calc(100% - 40px);
  padding: 16px;
}

.debug-info {
  padding: 16px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
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

.debug-info pre {
  background-color: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  overflow-x: auto;
}
</style>
