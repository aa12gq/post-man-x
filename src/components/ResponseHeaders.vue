<template>
  <div class="response-headers">
    <h3>响应头</h3>
    <el-table :data="headersList" style="width: 100%">
      <el-table-column prop="name" label="名称" width="200" />
      <el-table-column prop="value" label="值" show-overflow-tooltip />
      <el-table-column width="100">
        <template #default="scope">
          <el-button size="small" @click="copyValue(scope.row)">
            复制
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  headers: Record<string, string>
}>()

const headersList = computed(() => {
  return Object.entries(props.headers).map(([name, value]) => ({
    name,
    value
  }))
})

const copyValue = async (header: { name: string; value: string }) => {
  try {
    await navigator.clipboard.writeText(header.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.response-headers {
  margin-top: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}
</style> 