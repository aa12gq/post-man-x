<template>
  <div class="rpc-toolbar">
    <div class="toolbar-section">
      <div class="url-section">
        <el-autocomplete
          :model-value="url"
          @update:model-value="$emit('update:url', $event)"
          :fetch-suggestions="handleFetchSuggestions"
          :placeholder="t('request.rpc.toolbar.serverUrl')"
          class="server-url"
          clearable
          @clear="handleUrlClear"
        />
      </div>
      <el-button-group class="view-toggle">
        <el-tooltip
          :content="t('request.rpc.toolbar.viewModes.dropdown')"
          placement="top"
        >
          <el-button
            :type="viewMode === 'dropdown' ? 'primary' : ''"
            @click="viewMode = 'dropdown'"
            size="small"
          >
            <el-icon><List /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="t('request.rpc.toolbar.viewModes.cascade')"
          placement="top"
        >
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
          :placeholder="t('request.rpc.toolbar.selectMethod')"
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
                {{ t("request.rpc.messages.enterUrl") }}
              </p>
              <p v-else-if="loadingServices">
                {{ t("request.rpc.messages.loadingServices") }}
              </p>
              <p v-else>{{ t("request.rpc.messages.noMethods") }}</p>
            </div>
          </template>

          <template #footer>
            <button
              @click.stop="loadServices"
              :loading="loadingServices"
              class="el-button el-button--text el-button--small refresh-button"
            >
              <span>Use server reflection</span>
              <i class="el-icon refresh-icon">
                <svg class="icon" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M784.512 230.272v-50.56a32 32 0 1 1 64 0v149.056a32 32 0 0 1-32 32H667.52a32 32 0 1 1 0-64h92.992a384 384 0 1 0 116.224 297.728 32 32 0 1 1 64 0 448 448 0 1 1-156.224-364.224z"
                  />
                </svg>
              </i>
            </button>
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
          popper-class="custom-cascader-dropdown"
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

          <template #empty>
            <div class="select-empty">
              <p v-if="!props.url">
                {{ t("request.rpc.messages.enterUrl") }}
              </p>
              <p v-else-if="loadingServices">
                {{ t("request.rpc.messages.loadingServices") }}
              </p>
              <p v-else>{{ t("request.rpc.messages.noMethods") }}</p>
            </div>
          </template>
        </el-cascader>
      </div>
      <el-button
        type="primary"
        @click="$emit('send')"
        :loading="loading"
        :disabled="!canSend"
      >
        {{ t("request.rpc.toolbar.invoke") }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { List, Operation, Cpu, Link, Loading } from "@element-plus/icons-vue";
import type { RpcService } from "../../services/RpcService";
import type { CascaderValue } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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

const handleCascaderChange = (value: CascaderValue) => {
  if (Array.isArray(value) && value.length === 2) {
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

onMounted(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            node.classList.contains("custom-cascader-dropdown")
          ) {
            const footer = document.createElement("div");
            footer.className = "el-cascader__dropdown-footer";
            footer.innerHTML = `
              <button class="el-button el-button--text el-button--small refresh-button">
                <span>Use server reflection</span>
                <i class="el-icon refresh-icon">
                  <svg class="icon" viewBox="0 0 1024 1024">
                    <!-- Refresh icon path -->
                  </svg>
                </i>
              </button>
            `;

            footer
              .querySelector(".refresh-button")
              ?.addEventListener("click", (e) => {
                e.stopPropagation();
                loadServices();
              });

            node.appendChild(footer);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  onUnmounted(() => {
    observer.disconnect();
  });
});
</script>

<style scoped>
.rpc-toolbar {
  padding: 12px;
  background-color: var(--surface-1);
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
  display: flex;
  flex-direction: column;
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
  color: var(--text-secondary);
}

.select-footer {
  padding: 8px;
  border-top: none;
  text-align: center;
  background-color: var(--surface-1);
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

.el-select__wrapper {
  background-color: var(--surface-1) !important;
}

.service-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
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
  background-color: var(--surface-2);
  color: var(--text);
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

.refresh-button {
  width: 100%;
  justify-content: center;
}

:deep(.el-cascader__dropdown) {
  .select-empty {
    padding: 8px;
    text-align: center;
    color: var(--text-secondary);
  }

  .select-footer {
    padding: 8px;
    border-top: 1px solid var(--border);
    text-align: center;
    background-color: var(--surface-1);
  }

  .refresh-button {
    width: 100%;
    justify-content: center;
  }

  .refresh-icon.is-loading {
    animation: rotating 2s linear infinite;
  }
}

:deep(.custom-cascader-dropdown) {
  .el-cascader-panel {
    &::after {
      content: "";
      position: relative;
      display: block;
      height: 40px;
      border-top: 1px solid var(--border);
    }
  }

  .el-cascader__dropdown-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background-color: var(--surface-1);
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .refresh-button {
    width: 100%;
    justify-content: center;
  }
}

:global(.custom-cascader-dropdown) {
  .el-cascader-panel::after {
    content: "";
    display: block;
    height: 40px;
  }

  .el-cascader__dropdown-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background-color: var(--surface-1);
    border-top: 1px solid var(--border);
    text-align: center;
    z-index: 1;
  }

  .el-button.refresh-button {
    width: 100%;
    justify-content: center;
  }
}

:deep(.el-input) {
  width: 100% !important;
}

:deep(.el-input__wrapper) {
  background-color: var(--surface-1);
  box-shadow: 0 0 0 1px var(--border) !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}

:deep(.el-input__inner) {
  color: var(--text);
}

:deep(.el-select-dropdown__item) {
  color: var(--text-secondary);
}

:deep(.el-select-dropdown__item.hover) {
  background-color: var(--surface-2);
  color: var(--text);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--surface-2);
  color: var(--el-color-primary);
}

:deep(.el-select-group__title) {
  padding: 8px 12px;
  font-weight: bold;
  background-color: var(--surface-2);
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-cascader__dropdown) {
  .select-empty {
    padding: 8px;
    text-align: center;
    color: var(--text-secondary);
  }

  .select-footer {
    padding: 8px;
    border-top: 1px solid var(--border);
    text-align: center;
    background-color: var(--surface-1);
  }
}

:deep(.custom-cascader-dropdown) {
  .el-cascader-panel {
    &::after {
      content: "";
      position: relative;
      display: block;
      height: 40px;
      border-top: 1px solid var(--border);
    }
  }

  .el-cascader__dropdown-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background-color: var(--surface-1);
    border-top: 1px solid var(--border);
    text-align: center;
  }
}

:global(.custom-cascader-dropdown) {
  .el-cascader-panel::after {
    content: "";
    display: block;
    height: 40px;
  }

  .el-cascader__dropdown-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background-color: var(--surface-1);
    border-top: 1px solid var(--border);
    text-align: center;
    z-index: 1;
  }
}

:deep(.el-select-dropdown) {
  background-color: var(--surface-1);
  border-color: var(--border);

  .el-select-dropdown__item {
    color: var(--text-secondary);

    &:hover,
    &.hover {
      background-color: var(--surface-2);
      color: var(--text);
    }

    &.selected {
      background-color: var(--surface-2);
      color: var(--el-color-primary);
    }

    .el-icon {
      color: var(--text-secondary);
    }

    &:hover .el-icon {
      color: var(--text);
    }
  }
}

:deep(.el-cascader-menu) {
  background-color: var(--surface-1);
  border-right-color: var(--border);

  .el-cascader-menu__item {
    color: var(--text-secondary);

    &:hover,
    &.is-active {
      background-color: var(--surface-2);
      color: var(--text);
    }

    &.is-active {
      color: var(--el-color-primary);
    }
  }
}

:deep(.el-cascader-menu__item) {
  color: var(--text-secondary);
}

:deep(.el-cascader-menu__item:hover) {
  background-color: var(--surface-2);
  color: var(--text);
}

:deep(.el-cascader-menu__item.is-active) {
  background-color: var(--surface-2);
  color: var(--el-color-primary);
}

:deep(.el-button) {
  background-color: var(--surface-1);
  border-color: var(--border);
  color: var(--text-secondary);
}

:deep(.el-button:hover) {
  background-color: var(--surface-2);
  border-color: var(--el-color-primary);
  color: var(--text);
}

:deep(.el-button--primary) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

:deep(.el-button--primary:hover) {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
  color: white;
}

:deep(.el-select-dropdown__footer),
:deep(.el-cascader__dropdown-footer) {
  background-color: var(--surface-2);
  border-top-color: var(--border);
}

:deep(.el-select-group__title) {
  color: var(--text);
  background-color: var(--surface-2);
}

:deep(.el-select-dropdown__empty) {
  color: var(--text-secondary);
  background-color: var(--surface-1);
}

:deep(.el-popper) {
  background-color: var(--surface-1) !important;
  border-color: var(--border) !important;
  transition: none !important;
}

:deep(.el-select-dropdown__wrap),
:deep(.el-cascader-menu__wrap) {
  background-color: var(--surface-1);
}

:deep(.el-popper__arrow::before) {
  background-color: var(--surface-1) !important;
  border-color: var(--border) !important;
  transition: none !important;
}

:deep(.el-select-dropdown),
:deep(.el-cascader__dropdown) {
  transition: none !important;
}

:deep(.el-select-dropdown__item),
:deep(.el-cascader-menu__item) {
  transition: none !important;
}

:deep(.el-select-dropdown.el-popper),
:deep(.el-cascader__dropdown.el-popper) {
  transition: none !important;
}
</style>
