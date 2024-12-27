<template>
  <div class="min-h-screen w-full py-16 px-8 relative overflow-x-hidden sm:py-8 sm:px-4">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute w-[800px] aspect-square rounded-full opacity-10 -top-[400px] -right-[200px] animate-float"
        :style="{
          background: `linear-gradient(to bottom right, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
        }"
      ></div>
      <div
        class="absolute w-[600px] aspect-square rounded-full opacity-10 -bottom-[300px] -left-[150px] animate-float delay-[5s]"
        :style="{
          background: `linear-gradient(to bottom right, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
        }"
      ></div>
    </div>

    <!-- 主要内容区 -->
    <div
      class="max-w-5xl w-full mx-auto relative z-10 backdrop-blur-md p-8 rounded-2xl bg-surface-1/80 sm:p-4"
    >
      <!-- Logo 区域 -->
      <div class="flex flex-col items-center gap-4 mb-12">
        <LogoIcon
          class="w-16 h-16 animate-bounce"
          :style="{ color: themeStore.currentTheme.colors.primary }"
        />
        <div class="flex flex-col items-center gap-3">
          <h1
            class="text-4xl sm:text-3xl m-0"
            :style="{
              background: `linear-gradient(to right, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }"
          >
            {{ t('home.title') }}
          </h1>
          <p class="text-lg sm:text-base text-text-secondary m-0">
            {{ t('home.subtitle') }}
          </p>
        </div>
      </div>

      <!-- 特性展示区 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 my-12 mx-auto max-w-4xl">
        <FeatureCard
          v-for="(feature, index) in features"
          :key="index"
          :icon="feature.icon"
          :title="t(feature.titleKey)"
          :description="t(feature.descKey)"
          :style="{
            '--card-gradient': `linear-gradient(45deg, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
          }"
          class="feature-card"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
        <el-button
          type="primary"
          size="large"
          class="flex items-center justify-center gap-2 px-6 py-3 group"
          @click="$router.push('/workspace-manage')"
        >
          <span>{{ t('home.getStarted') }}</span>
          <el-icon class="transition-transform group-hover:translate-x-1">
            <ArrowRight />
          </el-icon>
        </el-button>
        <el-button size="large" @click="handleLearnMore">
          {{ t('home.learnMore') }}
        </el-button>
        <el-button type="info" size="large" @click="$router.push('/theme-test')">
          主题测试
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from '../components/icons/LogoIcon.vue'
import FeatureCard from '../components/home/FeatureCard.vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()

// 特性列表数据
const features = [
  {
    icon: 'Connection',
    titleKey: 'home.features.list.grpcFirst.title',
    descKey: 'home.features.list.grpcFirst.desc',
  },
  {
    icon: 'Box',
    titleKey: 'home.features.list.workspaces.title',
    descKey: 'home.features.list.workspaces.desc',
  },
  {
    icon: 'Collection',
    titleKey: 'home.features.list.collections.title',
    descKey: 'home.features.list.collections.desc',
  },
  {
    icon: 'Document',
    titleKey: 'home.features.list.protoExplorer.title',
    descKey: 'home.features.list.protoExplorer.desc',
  },
  {
    icon: 'Monitor',
    titleKey: 'home.features.list.debugTools.title',
    descKey: 'home.features.list.debugTools.desc',
  },
  {
    icon: 'Link',
    titleKey: 'home.features.list.httpSupport.title',
    descKey: 'home.features.list.httpSupport.desc',
  },
]

const handleLearnMore = () => {
  window.open('https://github.com/vtyug/rpc-master', '_blank')
}
</script>

<style>
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(50px, 50px) rotate(5deg) scale(1.05);
  }
  50% {
    transform: translate(0, 100px) rotate(0deg) scale(1);
  }
  75% {
    transform: translate(-50px, 50px) rotate(-5deg) scale(0.95);
  }
}

.animate-float {
  animation: float 20s infinite ease-in-out;
  will-change: transform;
}

.feature-card {
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--card-gradient);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 0.1;
}

/* 确保渐变文字有平滑过渡 */
[style*='background-clip: text'] {
  transition: all 0.3s ease;
}

/* 图标颜色过渡 */
:deep(svg) {
  transition: color 0.3s ease;
}
</style>
