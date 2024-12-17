<template>
  <div class="background-test">
    <div class="test-content">
      <div class="test-card">
        <h3>背景图片信息</h3>
        <p>当前背景图片状态：{{ backgroundEnabled ? "已启用" : "未启用" }}</p>
        <div v-if="backgroundImage" class="image-info">
          <p>当前背景图片：</p>
          <div class="image-url">{{ backgroundImage }}</div>
        </div>
        <p>不透明度：{{ opacity }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeStore } from "../stores/theme";
import { storeToRefs } from "pinia";

const themeStore = useThemeStore();
const { currentTheme } = storeToRefs(themeStore);

// 计算背景图片相关的属性
const backgroundEnabled = computed(
  () => currentTheme.value?.backgroundImage?.enabled ?? false
);
const backgroundImage = computed(
  () => currentTheme.value?.backgroundImage?.image ?? ""
);
const opacity = computed(
  () => currentTheme.value?.backgroundImage?.opacity ?? 1
);
</script>

<style scoped>
.background-test {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.test-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.test-card {
  background-color: rgba(var(--background-rgb), 0.8);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--border-color), 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.test-card h3 {
  font-size: 24px;
  margin: 0;
  color: var(--text-color);
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-success) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.test-card p {
  font-size: 16px;
  margin: 0;
  color: var(--text-color);
  line-height: 1.6;
}

.test-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .test-content {
    grid-template-columns: 1fr;
  }

  .background-test {
    padding: 20px;
  }
}

.image-info {
  margin-top: 8px;
}

.image-url {
  background-color: rgba(var(--background-rgb), 0.5);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  max-height: 80px;
  overflow-y: auto;
  border: 1px solid rgba(var(--border-color), 0.1);
  margin-top: 4px;
}

/* 自定义滚动条样式 */
.image-url::-webkit-scrollbar {
  width: 4px;
}

.image-url::-webkit-scrollbar-track {
  background: transparent;
}

.image-url::-webkit-scrollbar-thumb {
  background-color: rgba(var(--border-color), 0.3);
  border-radius: 2px;
}

.image-url::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--border-color), 0.5);
}
</style>
