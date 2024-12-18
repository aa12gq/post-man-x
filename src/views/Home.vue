<template>
  <div
    class="min-h-screen w-full py-16 px-8 relative overflow-x-hidden sm:py-8 sm:px-4"
  >
    <!-- 背景装饰 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute w-2/5 aspect-square rounded-full opacity-10 -top-1/6 -right-1/6 animate-float bg-gradient-to-br from-primary-color to-success"
      ></div>
      <div
        class="absolute w-1/3 aspect-square rounded-full opacity-10 -bottom-1/6 -left-1/6 animate-float delay-[5s] bg-gradient-to-br from-warning to-danger"
      ></div>
      <div
        class="absolute w-1/4 aspect-square rounded-full opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float delay-[10s] bg-gradient-to-br from-primary-color to-info"
      ></div>
    </div>

    <!-- 主要内容区 -->
    <div
      class="max-w-5xl w-full mx-auto relative z-10 backdrop-blur-md p-8 rounded-2xl bg-surface-1/80 sm:p-4"
    >
      <!-- Logo 区域 -->
      <div class="flex flex-col items-center gap-4 mb-12">
        <LogoIcon class="w-16 h-16 text-primary-color animate-bounce" />
        <div class="flex flex-col items-center gap-3">
          <h1
            class="text-4xl sm:text-3xl m-0 bg-gradient-to-r from-primary-color to-success bg-clip-text text-transparent"
          >
            {{ t("home.title") }}
          </h1>
          <p class="text-lg sm:text-base text-text-secondary m-0">
            {{ t("home.subtitle") }}
          </p>
        </div>
      </div>

      <!-- 特性展示区 -->
      <div
        class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 my-12 mx-auto max-w-4xl"
      >
        <FeatureCard
          v-for="(feature, index) in features"
          :key="index"
          :icon="feature.icon"
          :title="t(feature.titleKey)"
          :description="t(feature.descKey)"
        />
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center"
      >
        <el-button
          type="primary"
          size="large"
          class="flex items-center justify-center gap-2 px-6 py-3 group"
          @click="$router.push('/request')"
        >
          <span>{{ t("home.getStarted") }}</span>
          <el-icon class="transition-transform group-hover:translate-x-1">
            <ArrowRight />
          </el-icon>
        </el-button>
        <el-button size="large" @click="handleLearnMore">
          {{ t("home.learnMore") }}
        </el-button>
        <el-button
          type="info"
          size="large"
          @click="$router.push('/background-test')"
        >
          背景测试
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from "../components/icons/LogoIcon.vue";
import FeatureCard from "../components/home/FeatureCard.vue";
import { ArrowRight } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 特性列表数据
const features = [
  {
    icon: "Connection",
    titleKey: "home.features.list.grpcFirst.title",
    descKey: "home.features.list.grpcFirst.desc",
  },
  {
    icon: "Box",
    titleKey: "home.features.list.workspaces.title",
    descKey: "home.features.list.workspaces.desc",
  },
  {
    icon: "Collection",
    titleKey: "home.features.list.collections.title",
    descKey: "home.features.list.collections.desc",
  },
  {
    icon: "Document",
    titleKey: "home.features.list.protoExplorer.title",
    descKey: "home.features.list.protoExplorer.desc",
  },
  {
    icon: "Monitor",
    titleKey: "home.features.list.debugTools.title",
    descKey: "home.features.list.debugTools.desc",
  },
  {
    icon: "Link",
    titleKey: "home.features.list.httpSupport.title",
    descKey: "home.features.list.httpSupport.desc",
  },
];

const handleLearnMore = () => {
  window.open("https://github.com/vtyug/rpc-master", "_blank");
};
</script>

<style>
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, 20px) rotate(5deg);
  }
  50% {
    transform: translate(0, 40px) rotate(0deg);
  }
  75% {
    transform: translate(-20px, 20px) rotate(-5deg);
  }
}

.animate-float {
  animation: float 20s infinite ease-in-out;
}
</style>
