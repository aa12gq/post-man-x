<template>
  <div class="theme-editor">
    <el-form :model="themeForm" label-width="120px">
      <el-form-item label="Theme Name">
        <el-input v-model="themeForm.name" placeholder="Enter theme name" />
      </el-form-item>

      <el-form-item label="Theme Type">
        <el-switch
          v-model="themeForm.isDark"
          active-text="Dark"
          inactive-text="Light"
        />
      </el-form-item>

      <div class="colors-section">
        <h3>Colors</h3>
        <div class="color-grid">
          <div v-for="(_value, key) in themeForm.colors" :key="key" class="color-item">
            <span class="color-label">{{ formatColorLabel(key) }}</span>
            <div class="color-input-group">
              <el-color-picker
                v-model="themeForm.colors[key]"
                show-alpha
                :predefine="predefineColors"
              />
              <el-input v-model="themeForm.colors[key]" size="small" />
            </div>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <h3>Preview</h3>
        <div 
          class="preview-content"
          :style="previewStyles"
        >
          <div class="preview-header">
            <span>Header</span>
            <el-button type="primary" size="small">Button</el-button>
          </div>
          <div class="preview-body">
            <div class="preview-card">
              <h4>Card Title</h4>
              <p>Sample text content</p>
              <el-button type="success" size="small">Success</el-button>
              <el-button type="warning" size="small">Warning</el-button>
              <el-button type="danger" size="small">Danger</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <el-button @click="$emit('cancel')">Cancel</el-button>
        <el-button type="primary" @click="handleSave">Save Theme</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { Theme } from '../../types/theme';

const props = defineProps<{
  initialTheme?: Partial<Theme> | null;
}>();

const emit = defineEmits<{
  (e: 'save', theme: Omit<Theme, 'id'>): void;
  (e: 'cancel'): void;
}>();

const defaultColors = {
  primary: '#409eff',
  'primary-light': '#ecf5ff',
  'primary-dark': '#337ecc',
  background: '#ffffff',
  'background-light': '#f5f7fa',
  'background-dark': '#e4e7ed',
  text: '#333333',
  'text-secondary': '#909399',
  border: '#dcdfe6',
  hover: '#f5f7fa',
  header: '#f5f7fa',
  shadow: 'rgba(0, 0, 0, 0.1)',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  info: '#909399',
};

const themeForm = ref({
  name: props.initialTheme?.name || '',
  isDark: props.initialTheme?.isDark || false,
  colors: { ...defaultColors, ...(props.initialTheme?.colors || {}) },
});

const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#FFFFFF',
  '#000000',
];

const formatColorLabel = (key: string) => {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const previewStyles = computed(() => {
  const styles: Record<string, string> = {};
  Object.entries(themeForm.value.colors).forEach(([key, value]) => {
    styles[`--${key}`] = value;
  });
  return styles;
});

const handleSave = () => {
  if (!themeForm.value.name) {
    ElMessage.warning('Please enter a theme name');
    return;
  }
  emit('save', {
    name: themeForm.value.name,
    isDark: themeForm.value.isDark,
    colors: themeForm.value.colors,
  });
};
</script>

<style scoped>
.theme-editor {
  padding: 20px;
}

.colors-section {
  margin: 20px 0;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  font-size: 14px;
  color: var(--text-color);
}

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input-group :deep(.el-input) {
  width: 120px;
}

.preview-section {
  margin: 20px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.preview-content {
  background-color: var(--background);
}

.preview-header {
  padding: 16px;
  background-color: var(--header);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-body {
  padding: 16px;
}

.preview-card {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-light);
}

.preview-card h4 {
  margin: 0 0 8px;
  color: var(--text-color);
}

.preview-card p {
  margin: 0 0 16px;
  color: var(--text-secondary);
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style> 