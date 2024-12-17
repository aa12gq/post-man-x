<template>
  <div class="home">
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="welcome-section">
      <div class="logo-container">
        <LogoIcon class="logo animate-bounce" />
        <div class="text-content">
          <h1>{{ t("home.title") }}</h1>
          <p class="subtitle">
            {{ t("home.subtitle") }}
          </p>
        </div>
      </div>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <el-icon class="feature-icon"><Connection /></el-icon>
          </div>
          <h3>{{ t("home.features.list.grpcFirst.title") }}</h3>
          <p>{{ t("home.features.list.grpcFirst.desc") }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <el-icon class="feature-icon"><Box /></el-icon>
          </div>
          <h3>{{ t("home.features.list.workspaces.title") }}</h3>
          <p>{{ t("home.features.list.workspaces.desc") }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <el-icon class="feature-icon"><Collection /></el-icon>
          </div>
          <h3>{{ t("home.features.list.collections.title") }}</h3>
          <p>{{ t("home.features.list.collections.desc") }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <el-icon class="feature-icon"><Document /></el-icon>
          </div>
          <h3>{{ t("home.features.list.protoExplorer.title") }}</h3>
          <p>{{ t("home.features.list.protoExplorer.desc") }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <el-icon class="feature-icon"><Monitor /></el-icon>
          </div>
          <h3>{{ t("home.features.list.debugTools.title") }}</h3>
          <p>{{ t("home.features.list.debugTools.desc") }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon-wrapper">
            <el-icon class="feature-icon"><Link /></el-icon>
          </div>
          <h3>{{ t("home.features.list.httpSupport.title") }}</h3>
          <p>{{ t("home.features.list.httpSupport.desc") }}</p>
        </div>
      </div>

      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          class="start-button"
          @click="$router.push('/request')"
        >
          <span>{{ t("home.getStarted") }}</span>
          <el-icon class="el-icon-right"><ArrowRight /></el-icon>
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
import {
  Connection,
  Link,
  Collection,
  ArrowRight,
  Box,
  Document,
  Monitor,
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const handleLearnMore = () => {
  window.open("https://github.com/vtyug/rpc-master", "_blank");
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: auto;
  background-color: transparent;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-success) 100%
  );
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(
    135deg,
    var(--el-color-warning) 0%,
    var(--el-color-danger) 100%
  );
  bottom: -150px;
  left: -150px;
  animation-delay: -5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-info) 100%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

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

.welcome-section {
  max-width: 1000px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 16px;
  background-color: rgba(var(--surface-1), 0.8);
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}

.logo {
  width: 72px;
  height: 72px;
  color: var(--el-color-primary);
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

h1 {
  font-size: 36px;
  color: var(--text-color);
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-success) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 18px;
  color: var(--text-color-secondary);
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 48px 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.feature-item {
  padding: 20px;
  border-radius: 16px;
  background: var(--surface-2);
  transition: all 0.3s ease;
  border: 1px solid var(--border);
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-color);
  border-color: var(--el-color-primary);
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-7) 0%,
    var(--el-color-primary-light-9) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.feature-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.feature-item h3 {
  font-size: 20px;
  margin: 0 0 8px;
  color: var(--text);
}

.feature-item p {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
}

.el-icon-right {
  transition: transform 0.3s ease;
}

.start-button:hover .el-icon-right {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .home {
    padding: 20px;
    align-items: flex-start;
  }

  .welcome-section {
    padding: 20px;
    margin: 20px 0;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .circle-1 {
    width: 300px;
    height: 300px;
  }

  .circle-2 {
    width: 200px;
    height: 200px;
  }

  .circle-3 {
    width: 150px;
    height: 150px;
  }
}

.feature-card {
  padding: 24px;
  border-radius: 12px;
  background-color: var(--surface-2);
  border: 1px solid var(--border);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  background-color: var(--surface-3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.feature-description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
