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
      <div class="method-section">
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
            <template v-if="(service.methods || []).length === 0">
              <el-option
                :value="service.name"
                :label="'Load methods...'"
                @click="loadServiceMethods(service.name)"
              >
                <div class="method-option">
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
      <el-button
        type="primary"
        @click="$emit('send')"
        :loading="loading"
        :disabled="!canSend"
      >
        <el-icon><CaretRight /></el-icon>
        Invoke
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { CaretRight, Refresh } from "@element-plus/icons-vue";
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

const selectedMethod = ref("");

const canSend = computed(() => {
  return props.url && selectedMethod.value;
});

const handleUrlClear = () => {
  selectedMethod.value = "";
  emit("update:url", "");
};

const handleMethodChange = (value: string) => {
  selectedMethod.value = value;
  emit("method-change", value);
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

:deep(.el-select-dropdown__wrap) {
  max-height: 400px;
}
</style>
