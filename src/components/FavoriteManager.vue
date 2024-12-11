<template>
  <div class="favorite-manager">
    <el-table :data="favorites" style="width: 100%">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          {{ scope.row.type.toUpperCase() }}
        </template>
      </el-table-column>
      <el-table-column prop="url" label="URL" show-overflow-tooltip />
      <el-table-column prop="method" label="方法" width="100" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button @click="loadRequest(scope.row)" size="small">
            加载
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteFavorite(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import FavoriteService, { FavoriteRequest } from '../services/FavoriteService'
import { ElMessageBox } from 'element-plus'

const favorites = ref<FavoriteRequest[]>([])

const emit = defineEmits<{
  (e: 'load', request: FavoriteRequest): void
}>()

onMounted(() => {
  loadFavorites()
})

const loadFavorites = () => {
  favorites.value = FavoriteService.getFavorites()
}

const loadRequest = (favorite: FavoriteRequest) => {
  emit('load', favorite)
}

const deleteFavorite = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个收藏吗？', '提示', {
      type: 'warning'
    })
    FavoriteService.deleteFavorite(id)
    loadFavorites()
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.favorite-manager {
  margin: 10px 0;
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