<template>
  <div class="rpc-toolbar">
    <div class="toolbar-section">
      <div class="url-section">
        <el-autocomplete
          :model-value="url"
          @update:model-value="$emit('update:url', $event)"
          :fetch-suggestions="handleFetchSuggestions"
          placeholder="Enter Server URL"
          class="server-url"
          clearable
          @clear="handleUrlClear"
        />
      </div>
      <el-button-group class="view-toggle">
        <el-tooltip content="Dropdown View" placement="top">
          <el-button
            :type="viewMode === 'dropdown' ? 'primary' : ''"
            @click="viewMode = 'dropdown'"
            size="small"
          >
            <el-icon><List /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="Cascade View" placement="top">
          <el-button
            :type="viewMode === 'cascade' ? 'primary' : ''"
            @click="viewMode = 'cascade'"
            size="small"
          >
            <el-icon><Operation /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
      <div v-if="viewMode === 'dropdown'" class="method-section">
        <el-select
          v-model="selectedMethod"
          placeholder="Select Method"
          class="method-select"
          :loading="loadingMethods"
          filterable
          @change="handleMethodChange"
        >
          <el-option-group
            v-for="service in services"
            :key="service.name"
            :label="service.name"
          >
            <template #label>
              <div class="service-label">
                <el-icon><Cpu /></el-icon>
                <span>{{ service.name }}</span>
              </div>
            </template>
            <template v-if="(service.methods || []).length === 0">
              <el-option
                :value="service.name"
                :label="'Load methods...'"
                @click="loadServiceMethods(service.name)"
              >
                <div class="method-option">
                  <el-icon><Loading /></el-icon>
                  <span class="method-name">Load methods...</span>
                </div>
              </el-option>
            </template>
            <template v-else>
              <el-option
                v-for="method in service.methods || []"
                :key="`${service.name}.${method.name}`"
                :label="`${service.name}.${method.name}`"
                :value="`${service.name}.${method.name}`"
              >
                <div class="method-option">
                  <el-icon><Link /></el-icon>
                  <span class="method-name">{{ method.name }}</span>
                </div>
              </el-option>
            </template>
          </el-option-group>

          <template #empty>
            <div class="select-empty">
              <p v-if="!props.url">
                Enter a server URL to load available methods
              </p>
              <p v-else-if="loadingServices">Loading services...</p>
              <p v-else>No methods found. Try using server reflection.</p>
            </div>
          </template>

          <template #footer>
            <div class="select-footer">
              <el-button
                class="refresh-button"
                :loading="loadingServices"
                @click.stop="loadServices"
                size="small"
                text
              >
                Use server reflection
                <el-icon
                  class="refresh-icon"
                  :class="{ 'is-loading': loadingServices }"
                >
                  <Refresh />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-select>
      </div>
      <div v-else class="method-section">
        <el-cascader
          v-model="selectedMethodPath"
          :options="serviceOptions"
          :props="cascaderProps"
          placeholder="Select Service and Method"
          class="method-select"
          :loading="loadingMethods"
          filterable
          @change="handleCascaderChange"
        >
          <template #default="{ node, data }">
            <span class="cascader-label">
              <el-icon>
                <Cpu v-if="data.children" />
                <Link v-else />
              </el-icon>
              <span>{{ data.label }}</span>
            </span>
            <span v-if="data.methods && !node.loaded" class="load-trigger">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="loadServiceMethods(data.name)"
              >
                <el-icon><Loading /></el-icon>
                Load Methods
              </el-button>
            </span>
          </template>
        </el-cascader>
      </div>
      <el-button
        type="primary"
        @click="$emit('send')"
        :loading="loading"
        :disabled="!canSend"
      >
        Invoke
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  CaretRight,
  Refresh,
  List,
  Operation,
  Cpu,
  Connection,
  Link,
  Loading,
} from "@element-plus/icons-vue";
import type { RpcService } from "../../services/RpcService";

const props = defineProps<{
  url: string;
  loading: boolean;
  loadingMethods: boolean;
  loadingServices: boolean;
  services: RpcService[];
}>();

const emit = defineEmits<{
  "update:url": [value: string];
  "method-change": [method: string];
  send: [];
  "load-methods": [serviceName: string];
  "load-services": [];
}>();

const viewMode = ref<"dropdown" | "cascade">("dropdown");
const selectedMethod = ref("");
const selectedMethodPath = ref<string[]>([]);

const serviceOptions = computed(() => {
  return props.services.map((service) => ({
    value: service.name,
    label: service.name,
    name: service.name,
    methods: service.methods,
    children:
      service.methods?.map((method) => ({
        value: method.name,
        label: method.name,
        name: method.name,
      })) || [],
  }));
});

const cascaderProps = {
  expandTrigger: "hover" as const,
  checkStrictly: false,
  multiple: false,
  emitPath: true,
};

const canSend = computed(() => {
  return (
    props.url && (selectedMethod.value || selectedMethodPath.value.length === 2)
  );
});

const handleUrlClear = () => {
  selectedMethod.value = "";
  selectedMethodPath.value = [];
  emit("update:url", "");
};

const handleMethodChange = (value: string) => {
  selectedMethod.value = value;
  emit("method-change", value);
};

const handleCascaderChange = (value: string[]) => {
  if (value.length === 2) {
    const fullMethodName = `${value[0]}.${value[1]}`;
    selectedMethod.value = fullMethodName;
    emit("method-change", fullMethodName);
  }
};

const loadServiceMethods = (serviceName: string) => {
  emit("load-methods", serviceName);
};

const loadServices = () => {
  if (props.url) {
    emit("load-services");
  }
};

const handleFetchSuggestions = (query: string, cb: (data: any[]) => void) => {
  const suggestions = !query ? [] : [{ value: query }];
  cb(suggestions);
};
</script>

<style scoped>
.rpc-toolbar {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.toolbar-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.url-section {
  width: 300px;
}

.server-url {
  width: 100%;
}

.method-section {
  flex: 1;
}

.method-select {
  width: 100%;
}

:deep(.el-cascader) {
  width: 100%;
}

.view-toggle {
  margin: 0 8px;
}

.load-trigger {
  margin-left: 8px;
  font-size: 12px;
}

:deep(.el-cascader-panel) {
  max-height: 400px;
}

:deep(.el-cascader-menu) {
  min-width: 200px;
  max-width: 400px;
}

:deep(.el-cascader-menu__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 24px;
  height: 34px;
}

:deep(.el-select-dropdown__wrap),
:deep(.el-cascader-menu__wrap) {
  max-height: 400px;
}

:deep(.el-cascader-panel) {
  min-width: 480px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-name {
  font-family: monospace;
}

.select-empty {
  padding: 8px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

.select-footer {
  padding: 8px;
  border-top: 1px solid var(--el-border-color-light);
  text-align: center;
}

.refresh-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.service-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

.service-label .el-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.method-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-option .el-icon {
  font-size: 14px;
  color: var(--el-color-info);
}

.cascader-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.cascader-label .el-icon {
  font-size: 14px;
  flex-shrink: 0;
  color: var(--el-color-primary);
}

.cascader-label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-cascader-menu) {
  min-width: 200px;
  max-width: 300px;
}

:deep(.el-cascader-menu__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 24px;
}

:deep(.el-cascader-menu__item.is-active) {
  .cascader-label .el-icon {
    color: var(--el-color-primary);
  }
}

.load-trigger {
  margin-left: 8px;
  font-size: 12px;
  flex-shrink: 0;
}

.load-trigger .el-button .el-icon {
  margin-right: 4px;
  color: var(--el-color-primary);
}

:deep(.el-select-group__title) {
  padding: 8px 12px;
  font-weight: bold;
  background-color: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-select-group__title .el-icon) {
  margin-right: 4px;
  font-size: 16px;
  color: var(--el-color-primary);
}

:deep(.el-select-dropdown__item) {
  padding: 0 12px 0 24px;
}
</style>
