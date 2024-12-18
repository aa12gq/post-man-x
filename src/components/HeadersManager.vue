<template>
  <div class="headers-manager">
    <el-table :data="headers" style="width: 100%">
      <el-table-column label="启用">
        <template #default="scope">
          <el-checkbox v-model="scope.row.enabled" />
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template #default="scope">
          <el-input v-model="scope.row.name" placeholder="Header名称" />
        </template>
      </el-table-column>
      <el-table-column label="值">
        <template #default="scope">
          <el-input v-model="scope.row.value" placeholder="Header值" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button
            type="danger"
            size="small"
            @click="removeHeader(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="headers-actions">
      <el-button type="primary" @click="addHeader">添加Header</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

export interface Header {
  enabled: boolean
  name: string
  value: string
}

const props = defineProps<{
  modelValue: Header[]
}>()

const emit = defineEmits<{
  'update:modelValue': [headers: Header[]];
  'update:headers': [headers: Header[]];
  'change': [headers: Header[]];
}>();

const headers = ref<Header[]>(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    headers.value = newValue
  }
)

watch(
  headers,
  (newValue) => {
    emit('update:modelValue', newValue);
    emit('update:headers', newValue);
    emit('change', newValue);
  },
  { deep: true }
)

const addHeader = () => {
  headers.value.push({
    enabled: true,
    name: '',
    value: ''
  })
}

const removeHeader = (index: number) => {
  headers.value.splice(index, 1)
}
</script>

<style scoped>
.headers-manager {
  margin: 10px 0;
}

.headers-actions {
  margin-top: 10px;
  text-align: right;
}

:deep(.el-table) {
  --el-table-bg-color: var(--bg-color);
  --el-table-tr-bg-color: var(--bg-color);
  --el-table-header-bg-color: var(--header-bg);
  --el-table-border-color: var(--border-color);
  --el-table-text-color: var(--text-color);
  --el-table-header-text-color: var(--text-color);
}
</style> 