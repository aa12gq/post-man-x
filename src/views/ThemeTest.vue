<template>
  <div class="w-full h-full overflow-auto bg-background">
    <div class="p-8">
      <div class="max-w-5xl mx-auto space-y-8 pb-8">
        <h1 class="text-3xl font-bold text-text">主题测试页面</h1>

        <!-- 主题切换器 -->
        <section class="space-y-4">
          <h2 class="text-2xl text-text">主题切换</h2>
          <div class="flex flex-wrap gap-4">
            <el-button
              v-for="theme in officialThemes"
              :key="theme.id"
              :type="currentThemeId === theme.id ? 'primary' : 'default'"
              @click="handleThemeChange(theme)"
              class="theme-button"
            >
              {{ theme.name }}
            </el-button>
          </div>
        </section>

        <!-- 颜色展示区 -->
        <section class="space-y-4">
          <h2 class="text-2xl text-text">主题颜色</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="(value, key) in currentTheme.colors"
              :key="key"
              class="p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              <div class="h-12 rounded-md mb-2" :style="{ background: value }"></div>
              <div class="text-sm text-text font-medium">{{ key }}</div>
              <div class="text-sm text-text-secondary break-all">{{ value }}</div>
            </div>
          </div>
        </section>

        <!-- 按钮测试区 -->
        <section class="space-y-4">
          <h2 class="text-2xl text-text">按钮样式</h2>
          <div class="flex flex-wrap gap-4">
            <el-button>默认按钮</el-button>
            <el-button type="primary">主要按钮</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="warning">警告按钮</el-button>
            <el-button type="danger">危险按钮</el-button>
            <el-button type="info">信息按钮</el-button>
          </div>
          <div class="flex flex-wrap gap-4">
            <el-button plain>朴素按钮</el-button>
            <el-button type="primary" plain>主要按钮</el-button>
            <el-button type="success" plain>成功按钮</el-button>
            <el-button type="warning" plain>警告按钮</el-button>
            <el-button type="danger" plain>危险按钮</el-button>
            <el-button type="info" plain>信息按钮</el-button>
          </div>
        </section>

        <!-- 表单元素测试区 -->
        <section class="space-y-4">
          <h2 class="text-2xl text-text">表单元素</h2>
          <div class="space-y-4 max-w-md">
            <el-input v-model="inputText" placeholder="请输入内容"></el-input>
            <el-input
              type="textarea"
              v-model="textareaText"
              placeholder="请输入多行内容"
            ></el-input>
            <el-select v-model="selectValue" placeholder="请选择">
              <el-option label="选项1" value="1"></el-option>
              <el-option label="选项2" value="2"></el-option>
            </el-select>
            <div class="flex items-center gap-4">
              <el-switch v-model="switchValue"></el-switch>
              <el-checkbox v-model="checkboxValue">复选框</el-checkbox>
              <el-radio-group v-model="radioValue">
                <el-radio :label="1">选项1</el-radio>
                <el-radio :label="2">选项2</el-radio>
              </el-radio-group>
            </div>
            <el-slider v-model="sliderValue"></el-slider>
          </div>
        </section>

        <!-- 卡片测试区 -->
        <section class="space-y-4">
          <h2 class="text-2xl text-text">卡片样式</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="i in 4"
              :key="i"
              :class="`p-4 rounded-lg bg-surface-${i} border border-border hover:shadow-md transition-shadow`"
            >
              <h3 class="text-lg text-text mb-2">Surface {{ i }}</h3>
              <p class="text-text-secondary">这是一个使用 surface-{{ i }} 背景色的卡片</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { officialThemes } from '../constants/officialThemes'
import type { Theme } from '../types/theme'

// 表单数据
const inputText = ref('')
const textareaText = ref('')
const selectValue = ref('')
const switchValue = ref(false)
const checkboxValue = ref(false)
const radioValue = ref(1)
const sliderValue = ref(50)

// 主题相关
const currentThemeId = ref(officialThemes[0].id)
const currentTheme = ref<Theme>(officialThemes[0])

// 主题切换处理函数
function handleThemeChange(theme: Theme) {
  currentThemeId.value = theme.id
  currentTheme.value = theme
  applyTheme(theme)
}

// 应用主题函数
function applyTheme(theme: Theme) {
  const root = document.documentElement
  const style = document.getElementById('theme-test-style') || document.createElement('style')

  // 生成 CSS 变量
  const cssVars = Object.entries(theme.colors).map(([key, value]) => `--${key}: ${value};`)

  // 应用 CSS 变量到根元素
  root.setAttribute('style', cssVars.join(' '))

  // 更新 Element Plus 主题变量
  const elementVars = [
    `--el-color-primary: ${theme.colors.primary};`,
    `--el-color-success: ${theme.colors.success};`,
    `--el-color-warning: ${theme.colors.warning};`,
    `--el-color-danger: ${theme.colors.danger};`,
    `--el-color-info: ${theme.colors.info};`,
    `--el-text-color-primary: ${theme.colors.text};`,
    `--el-text-color-regular: ${theme.colors['text-secondary']};`,
    `--el-border-color: ${theme.colors.border};`,
    `--el-bg-color: ${theme.colors.background};`,
    `--el-bg-color-overlay: ${theme.colors['surface-1']};`,
    `--el-text-color-disabled: ${theme.colors['text-secondary']};`,
    `--el-border-color-light: ${theme.colors.border};`,
    `--el-border-color-lighter: ${theme.colors['border-active']};`,
    `--el-fill-color-blank: ${theme.colors['surface-1']};`,
    `--el-mask-color: ${theme.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'};`,
    `--el-mask-color-extra-light: ${theme.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};`,
  ]

  // 更新主题样式
  const themeStyles = `
    .theme-button.el-button--default {
      --el-button-text-color: ${theme.colors.text} !important;
      --el-button-bg-color: ${theme.colors['surface-1']};
      --el-button-border-color: ${theme.colors.border};
      --el-button-hover-text-color: ${theme.colors.text} !important;
      --el-button-hover-bg-color: ${theme.colors['surface-2']} !important;
      --el-button-hover-border-color: ${theme.colors['border-active']};
    }

    .theme-button.el-button--primary {
      --el-button-hover-bg-color: ${theme.colors['primary-dark']} !important;
      --el-button-hover-text-color: #ffffff !important;
      --el-button-hover-border-color: ${theme.colors['primary-dark']} !important;
    }

    .el-input__wrapper {
      background-color: ${theme.colors['surface-1']} !important;
    }
    .el-input__inner {
      color: ${theme.colors.text} !important;
    }
    .el-select-dropdown {
      background-color: ${theme.colors['surface-1']} !important;
      border-color: ${theme.colors.border} !important;
    }
    .el-select-dropdown__item {
      color: ${theme.colors.text} !important;
    }
    .el-select-dropdown__item.hover {
      background-color: ${theme.colors.hover} !important;
    }
  `

  style.id = 'theme-test-style'
  style.textContent = `:root { ${elementVars.join(' ')} } ${themeStyles}`

  if (!style.parentNode) {
    document.head.appendChild(style)
  }

  // 更新文档根元素的主题类
  root.classList.toggle('dark', theme.isDark)
}

// 初始化默认主题
handleThemeChange(officialThemes[0])
</script>

<style scoped>
/* 确保过渡效果平滑 */
* {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;
}

/* 使用 Tailwind 的暗色模式类 */
.dark {
  color-scheme: dark;
}

/* 强制应用主题文字颜色 */
.text-text {
  color: var(--text) !important;
}

.text-text-secondary {
  color: var(--text-secondary) !important;
}
</style>
