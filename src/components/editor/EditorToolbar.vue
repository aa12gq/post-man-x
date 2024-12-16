<template>
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <el-button-group>
        <el-button
          size="small"
          :icon="Format"
          @click="emit('format')"
          :title="formatShortcut"
        >
          Format
        </el-button>
        <el-button
          size="small"
          :icon="Copy"
          @click="handleCopy"
          :title="copyShortcut"
        >
          Copy
        </el-button>
      </el-button-group>
    </div>
    <div class="toolbar-right">
      <el-select
        v-model="language"
        size="small"
        style="width: 120px"
        @change="emit('language-change', $event)"
      >
        <el-option label="JSON" value="json" />
        <el-option label="YAML" value="yaml" />
        <el-option label="JavaScript" value="javascript" />
        <el-option label="TypeScript" value="typescript" />
      </el-select>
      <el-select
        v-model="currentThemeValue"
        @change="handleThemeChange"
        class="theme-selector"
      >
        <el-option
          v-for="option in themeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
          <template v-if="option.children">
            <el-option-group :label="option.label">
              <el-option
                v-for="child in option.children"
                :key="child.value"
                :label="child.label"
                :value="child.value"
              />
            </el-option-group>
          </template>
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  Document as Format,
  DocumentCopy as Copy,
} from "@element-plus/icons-vue";
import { useThemeStore } from "../../stores/theme";
import type { ThemePreset } from "../../types/theme";

const props = defineProps<{
  modelValue?: string;
  currentLanguage?: string;
}>();

const emit = defineEmits<{
  format: [];
  copy: [];
  "language-change": [language: string];
}>();

const language = ref(props.currentLanguage || "json");

const formatShortcut =
  import.meta.env.VITE_PLATFORM === "darwin" ? "⌘K" : "Ctrl+K";
const copyShortcut =
  import.meta.env.VITE_PLATFORM === "darwin" ? "⌘C" : "Ctrl+C";

const handleCopy = async () => {
  if (props.modelValue) {
    try {
      await navigator.clipboard.writeText(props.modelValue);
      ElMessage.success("Copied to clipboard");
      emit("copy");
    } catch (error) {
      ElMessage.error("Failed to copy");
    }
  }
};

const themeStore = useThemeStore();
interface ThemeOption {
  label: string;
  value: string;
  children?: {
    label: string;
    value: string;
  }[];
}

const themeOptions = computed<ThemeOption[]>(() => {
  const options: ThemeOption[] = [];

  // 官方主题组
  const officialThemes = themeStore.allCustomThemes.filter(theme => 
    theme.id.startsWith('official_')
  );
  
  if (officialThemes.length > 0) {
    options.push({
      label: "官方主题",
      value: "official-themes",
      children: officialThemes.map((theme) => ({
        label: theme.name,
        value: `custom:${theme.id}`,
      })),
    });
  }

  // 自定义主题组
  const customThemes = themeStore.allCustomThemes.filter(theme => 
    !theme.id.startsWith('official_')
  );
  
  if (customThemes.length > 0) {
    options.push({
      label: "自定义主题", 
      value: "custom-themes",
      children: customThemes.map((theme) => ({
        label: theme.name,
        value: `custom:${theme.id}`,
      })),
    });
  }

  return options;
});

const handleThemeChange = (value: string) => {
  const themeId = value.split(":")[1];
  themeStore.switchTheme("custom", themeId);
};

const currentThemeValue = computed(() => {
  return `custom:${themeStore.currentTheme.id}`;
});
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-button .el-icon) {
  margin: 0;
}

.theme-selector {
  width: 160px;
}
</style>
