<template>
  <div class="raw-editor">
    <el-input
      :model-value="modelValue"
      @update:model-value="handleInput"
      type="textarea"
      :rows="8"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.raw-editor {
  width: 100%;
  height: 100%;
}

.raw-editor :deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 14px;
}
</style>
