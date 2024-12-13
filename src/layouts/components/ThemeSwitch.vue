<template>
  <el-button
    class="theme-button"
    :icon="isDarkMode ? Sunny : Moon"
    circle
    @click="toggleTheme"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Moon, Sunny } from "@element-plus/icons-vue";

const isDarkMode = ref(localStorage.getItem("theme") === "dark");

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  const theme = isDarkMode.value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme") || "light";
  isDarkMode.value = savedTheme === "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
});
</script>

<style scoped>
.theme-button {
  padding: 8px;
}
</style>
