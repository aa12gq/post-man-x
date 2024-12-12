<template>
  <div class="binary-editor">
    <el-upload
      class="upload-area"
      drag
      action=""
      :auto-upload="false"
      :show-file-list="true"
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
    </el-upload>

    <div v-if="selectedFile" class="file-info">
      <p>Selected file: {{ selectedFile.name }}</p>
      <p>Size: {{ formatFileSize(selectedFile.size) }}</p>
      <el-button type="danger" @click="clearFile">Clear</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

const props = defineProps<{
  modelValue: File | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
}>()

const selectedFile = ref<File | null>(null)

const handleFileChange = (file: UploadFile) => {
  selectedFile.value = file.raw || null
  emit('update:modelValue', selectedFile.value)
}

const clearFile = () => {
  selectedFile.value = null
  emit('update:modelValue', null)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.binary-editor {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.file-info {
  margin-top: 16px;
  padding: 16px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}

.file-info p {
  margin: 4px 0;
}
</style>
