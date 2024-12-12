<template>
  <div class="form-data-editor">
    <el-table :data="formItems" style="width: 100%">
      <el-table-column width="50">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" />
        </template>
      </el-table-column>
      
      <el-table-column label="Key">
        <template #default="{ row }">
          <el-input
            v-model="row.key"
            placeholder="Key"
            clearable
            @change="handleChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="Value">
        <template #default="{ row }">
          <el-input
            v-model="row.value"
            placeholder="Value"
            clearable
            @change="handleChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="Description" width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.description"
            placeholder="Description"
            clearable
            @change="handleChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column width="50">
        <template #default="{ $index }">
          <el-button
            type="danger"
            :icon="Delete"
            circle
            @click="removeItem($index)"
          />
        </template>
      </el-table-column>
    </el-table>

    <div class="form-data-actions">
      <el-button type="primary" @click="addItem">Add Item</el-button>
      <el-button @click="clearAll">Clear All</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

interface FormDataItem {
  enabled: boolean
  key: string
  value: string
  description: string
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const formItems = ref<FormDataItem[]>([])

// 初始化表单数据
watch(() => props.modelValue, (newValue) => {
  try {
    if (newValue) {
      const data = JSON.parse(newValue)
      formItems.value = Object.entries(data).map(([key, value]) => ({
        enabled: true,
        key,
        value: String(value),
        description: ''
      }))
    } else {
      formItems.value = []
    }
  } catch {
    formItems.value = []
  }
}, { immediate: true })

// 更新表单数据
const updateFormData = () => {
  const formData: Record<string, string> = {}
  formItems.value
    .filter(item => item.enabled && item.key)
    .forEach(item => {
      formData[item.key] = item.value
    })
  emit('update:modelValue', JSON.stringify(formData))
}

const handleChange = () => {
  updateFormData()
}

const addItem = () => {
  formItems.value.push({
    enabled: true,
    key: '',
    value: '',
    description: ''
  })
}

const removeItem = (index: number) => {
  formItems.value.splice(index, 1)
  updateFormData()
}

const clearAll = () => {
  formItems.value = []
  updateFormData()
}
</script>

<style scoped>
.form-data-editor {
  width: 100%;
}

.form-data-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
