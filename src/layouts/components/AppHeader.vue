<template>
  <div
    class="h-12 min-h-12 px-2 bg-surface-1 border-b border-border flex items-center justify-between flex-nowrap relative z-50 shadow-sm"
  >
    <!-- 左侧区域 -->
    <div class="flex items-center gap-2 min-w-0 flex-shrink-1">
      <!-- Logo -->
      <div
        class="flex items-center gap-2 flex-shrink-0 cursor-pointer p-1 rounded hover:bg-surface-2 transition-colors"
        @click="goHome"
      >
        <LogoIcon
          class="w-6 h-6 flex-shrink-0"
          :style="{
            color: `${themeStore.currentTheme.colors.primary}`,
            filter: 'brightness(1.1)',
          }"
        />
        <span
          class="font-semibold text-base hidden sm:block gradient-text"
          :style="{
            background: `linear-gradient(45deg, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }"
        >
          RPC Master
        </span>
      </div>
      <WorkspaceSelector />
      <!-- 新建项目 -->
      <el-button size="small" @click="openCreateProjectDialog = true">
        <template #icon>
          <el-icon><Plus /></el-icon>
        </template>
        新建
      </el-button>
    </div>

    <!-- 右侧区域 -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- 分隔线 -->
      <div class="w-px h-6 bg-border mx-1 flex-shrink-0 hidden sm:block"></div>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <button
          class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text transition-colors min-w-[100px] sm:min-w-fit"
        >
          <span class="w-4 h-4 leading-none">{{ locale === 'zh-CN' ? '🇨🇳' : '🇺🇸' }}</span>
          <span class="hidden sm:block">{{
            $t(`header.language.${locale === 'zh-CN' ? 'zh' : 'en'}`)
          }}</span>
          <el-icon class="text-xs transition-transform group-hover:translate-y-0.5 hidden sm:block"
            ><ArrowDown
          /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="!bg-surface-1 !border-border">
            <el-dropdown-item command="en-US">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4">🇺🇸</span>
                <span>{{ $t('header.language.en-US') }}</span>
                <el-icon v-if="locale === 'en-US'" class="ml-auto"><Check /></el-icon>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="zh-CN">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4">🇨🇳</span>
                <span>{{ $t('header.language.zh-CN') }}</span>
                <el-icon v-if="locale === 'zh-CN'" class="ml-auto"><Check /></el-icon>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换 -->
      <button
        class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text transition-colors min-w-[100px] sm:min-w-fit"
        @click="showThemeDrawer = true"
      >
        <div
          class="w-4 h-4 rounded shadow-inner"
          :style="{ backgroundColor: themeStore.currentTheme.colors.primary }"
        ></div>
        <span class="hidden sm:block text-sm">{{ $t('header.theme.title') }}</span>
        <el-icon class="text-xs transition-transform group-hover:translate-y-0.5 hidden sm:block"
          ><ArrowDown
        /></el-icon>
      </button>

      <!-- 通知和消息 -->
      <div class="flex items-center gap-2">
        <!-- 通知按钮 -->
        <el-dropdown trigger="click" @command="handleNotificationCommand">
          <el-badge :value="notifications.length" class="notification-badge">
            <button
              class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
            >
              <el-icon><Bell /></el-icon>
            </button>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu
              class="!w-80 !max-h-[400px] !overflow-y-auto !bg-surface-1 !border-border"
            >
              <div class="px-4 py-2 border-b border-border">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-text">通知</span>
                  <el-button link type="primary" @click="clearNotifications">清除全部</el-button>
                </div>
              </div>
              <template v-if="notifications.length">
                <el-dropdown-item v-for="notification in notifications" :key="notification.id">
                  <div class="notification-item flex items-start gap-3 py-2 relative">
                    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        :src="notification.avatar"
                        :alt="notification.user"
                        class="w-full h-full object-cover"
                        @error="handleAvatarError"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-text">{{ notification.user }}</span>
                      </div>
                      <div class="text-sm text-text">
                        {{ notification.title }}
                      </div>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-text-secondary">{{ notification.time }}</span>
                        <span class="text-xs text-text-secondary">·</span>
                        <span class="time-text text-xs">{{ notification.workspace }}</span>
                      </div>
                    </div>
                  </div>
                </el-dropdown-item>
              </template>
              <template v-else>
                <div class="py-8 text-center text-sm text-text-secondary bg-surface-1">
                  {{ $t('header.notification.empty') }}
                </div>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 消息按钮 -->
        <el-dropdown trigger="click" @command="handleMessageCommand">
          <el-badge :value="messages.length" class="message-badge">
            <button
              class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
            >
              <el-icon><Message /></el-icon>
            </button>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu
              class="!w-96 !max-h-[600px] !overflow-y-auto !bg-surface-1 !border-border"
            >
              <div class="px-4 py-2 border-b border-border">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-text">消息</span>
                  <el-button link type="primary" @click="clearMessages">清除全部</el-button>
                </div>
              </div>
              <template v-if="messages.length">
                <el-dropdown-item v-for="message in messages" :key="message.id">
                  <div class="message-item flex items-start gap-3 py-2 relative">
                    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        :src="message.avatar"
                        :alt="message.sender"
                        class="w-full h-full object-cover"
                        @error="handleAvatarError"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-text">{{ message.sender }}</span>
                        <span class="text-xs text-text-secondary">{{ message.role }}</span>
                      </div>
                      <div class="preview-image mt-2" v-if="message.preview">
                        <img :src="message.preview" class="w-full h-32 object-cover" />
                      </div>
                      <div class="text-sm mt-1 text-text">
                        {{ message.content }}
                      </div>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-text-secondary">{{ message.workspace }}</span>
                        <span class="text-xs text-text-secondary">·</span>
                        <span class="time-text text-xs">{{ message.time }}</span>
                      </div>
                    </div>
                  </div>
                </el-dropdown-item>
              </template>
              <template v-else>
                <div class="py-8 text-center text-sm text-text-secondary bg-surface-1">
                  {{ $t('header.message.empty') }}
                </div>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 设置和用户头像 -->
      <SettingsDropdown ref="settingsDropdownRef" />
      <UserAvatar />
    </div>
  </div>

  <!-- 主题选择抽屉 -->
  <el-drawer
    v-model="showThemeDrawer"
    :title="t('header.theme.title')"
    size="400px"
    :with-header="true"
    class="theme-drawer"
  >
    <div class="p-6 overflow-y-auto">
      <!-- 官方主题 -->
      <div class="mb-10">
        <h3 class="text-lg font-semibold text-text-color mb-6 flex items-center gap-2">
          <div class="w-1 h-6 bg-primary-color rounded-full"></div>
          {{ t('settings.theme.officialThemes') }}
        </h3>
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="theme in themeStore.officialCustomThemes"
            :key="theme.id"
            class="group relative border border-border/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-surface-1 to-surface-2"
            :class="{
              'ring-2 ring-primary-color ring-offset-4 ring-offset-surface-1':
                themeStore.currentTheme.id === theme.id,
            }"
            @click="applyTheme(['custom', theme.id])"
          >
            <!-- 悬停渐变效果 -->
            <div
              class="absolute -inset-[1px] bg-gradient-to-r from-primary-color/20 via-success/20 to-primary-color/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
            ></div>

            <!-- 主题预览卡片 -->
            <div
              class="relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-primary-color/20"
            >
              <ThemePreviewCard :theme="theme" class="w-full aspect-[3/1] relative z-10" />
            </div>

            <!-- 主题信息 -->
            <div class="text-center mt-4 relative z-10">
              <span
                class="block text-base font-medium text-text-color mb-1.5 group-hover:text-primary-color transition-colors"
              >
                {{ theme.name }}
              </span>
              <span
                class="inline-block px-3 py-1 text-sm text-text-secondary bg-surface-1/80 rounded-full shadow-inner backdrop-blur-sm"
              >
                {{ t(`settings.theme.${theme.isDark ? 'dark' : 'light'}`) }}
              </span>
            </div>

            <!-- 选中指示器 -->
            <div
              v-if="themeStore.currentTheme.id === theme.id"
              class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary-color rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <el-icon class="text-white text-sm"><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义主题 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-text-color flex items-center gap-2">
            <div class="w-1 h-6 bg-primary-color rounded-full"></div>
            {{ t('settings.theme.customThemes') }}
          </h3>
          <el-button
            type="primary"
            class="!bg-gradient-to-r !from-primary-color !to-success hover:!opacity-90 border-none flex items-center gap-2 !px-4 !h-9"
            @click="showThemeEditor = true"
          >
            <el-icon><Plus /></el-icon>
            {{ t('settings.theme.createTheme') }}
          </el-button>
        </div>
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="theme in themeStore.customThemes"
            :key="theme.id"
            class="group relative border border-border/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-surface-1 to-surface-2"
            :class="{
              'ring-2 ring-primary-color ring-offset-4 ring-offset-surface-1':
                themeStore.currentTheme.id === theme.id,
            }"
            @click="applyTheme(['custom', theme.id])"
          >
            <!-- 悬停渐变效果 -->
            <div
              class="absolute -inset-[1px] bg-gradient-to-r from-primary-color/20 via-success/20 to-primary-color/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
            ></div>

            <!-- 主题预览卡片 -->
            <div
              class="relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-primary-color/20"
            >
              <ThemePreviewCard :theme="theme" class="w-full aspect-[3/1] relative z-10" />
            </div>

            <!-- 主题信息 -->
            <div class="text-center mt-4 relative z-10">
              <span
                class="block text-base font-medium text-text-color mb-1.5 group-hover:text-primary-color transition-colors"
              >
                {{ theme.name }}
              </span>
              <span
                class="inline-block px-3 py-1 text-sm text-text-secondary bg-surface-1/80 rounded-full shadow-inner backdrop-blur-sm"
              >
                {{ t(`settings.theme.${theme.isDark ? 'dark' : 'light'}`) }}
              </span>
            </div>

            <!-- 选中指示器 -->
            <div
              v-if="themeStore.currentTheme.id === theme.id"
              class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary-color rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <el-icon class="text-white text-sm"><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>

  <!-- 主题编辑器对话框 -->
  <el-dialog v-model="showThemeEditor" title="Create New Theme" width="800px">
    <ThemeEditor :initial-theme="null" @save="handleSaveTheme" @cancel="showThemeEditor = false" />
  </el-dialog>

  <!-- 创建项目弹窗 -->
  <el-dialog v-model="openCreateProjectDialog" title="创建项目" width="400px">
    <el-form label-position="top">
      <el-form-item label="项目名称">
        <el-input v-model="projectName" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="openCreateProjectDialog = false">取消</el-button>
      <el-button type="primary" @click="handleCreateProject">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  ArrowDown,
  Bell,
  ChatDotRound,
  Check,
  Document,
  Message,
  Plus,
  Setting,
  Share,
  User,
  UserFilled,
} from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ThemePreviewCard from '../../components/common/ThemePreviewCard.vue'
import LogoIcon from '../../components/icons/LogoIcon.vue'
import ThemeEditor from '../../components/settings/ThemeEditor.vue'
import { LanguageType, setLanguage } from '../../locales'
import { useThemeStore } from '../../stores/theme'
import { Theme } from '../../types/theme'
import { displayNotification } from '../../utils/message'
import SettingsDropdown from './SettingsDropdown.vue'
import UserAvatar from './UserAvatar.vue'
import WorkspaceSelector from './WorkspaceSelector.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const settingsDropdownRef = ref()
const showThemeEditor = ref(false)
const showThemeDrawer = ref(false)
const { locale, t } = useI18n()
const projectName = ref('')
// 创建项目弹窗
const openCreateProjectDialog = ref(false)

const goHome = () => {
  if (route.path !== '/') {
    router.push('/')
  }
}

const handleCreateProject = () => {
  openCreateProjectDialog.value = false
  displayNotification('创建成功', 'success')
}

// 处理主题相关命令
const applyTheme = (command: [string, string]) => {
  if (Array.isArray(command)) {
    const [type, id] = command
    if (type === 'custom') {
      themeStore.switchTheme('custom', id)
    }
  } else if (command === 'customize') {
    showThemeEditor.value = true
  }
}

// 处理保存新主题
const handleSaveTheme = (theme: Omit<Theme, 'id'>) => {
  const newTheme = themeStore.addCustomTheme(theme)
  themeStore.switchTheme('custom', newTheme.id)
  showThemeEditor.value = false
}

const handleLanguageChange = (lang: LanguageType) => {
  try {
    setLanguage(lang)
  } catch (error) {
    console.error('Failed to change language:', error)
  }
}

// 通知数据
const notifications = ref([
  {
    id: 1,
    title: '新的团队成员加入',
    time: '2小时前',
    icon: User,
    iconColor: 'text-green-500',
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    user: 'Charlie Brown',
    workspace: '电商项目',
  },
  {
    id: 2,
    title: 'API集合已分享',
    time: '5小时前',
    icon: Share,
    iconColor: 'text-blue-500',
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    user: 'Sarah Zhang',
    workspace: '电商项目',
  },
  {
    id: 3,
    title: '工作区设置已更新',
    time: '昨天',
    icon: Setting,
    iconColor: 'text-orange-500',
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    user: 'Mike Wilson',
    workspace: '语聊项目',
  },
])

// 消息数据
const messages = ref([
  {
    id: 1,
    sender: 'Alice Johnson',
    role: 'API Designer',
    content: '请查看新的API文档更新',
    type: 'document',
    time: '1小时前',
    workspace: '电商项目',
    unread: true,
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    preview:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 2,
    sender: 'Bob Wilson',
    role: '前端开发',
    content: '新的UI组件已经完成',
    type: 'code',
    time: '2小时前',
    workspace: '组库',
    unread: true,
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    preview:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 3,
    sender: 'Carol White',
    role: 'Project Manager',
    content: '@你 于新接口的设计讨论',
    type: 'mention',
    time: '5小时前',
    workspace: '用户中心',
    unread: true,
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    preview:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 4,
    sender: 'David Chen',
    role: 'Frontend Developer',
    content: '已将你添加到「登录模块」协作组',
    type: 'collaboration',
    time: '1天前',
    workspace: '认证系统',
    unread: false,
    avatar:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    preview:
      'https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
])

// 处理通知点
const handleNotificationCommand = (command: string) => {
  console.log('Notification clicked:', command)
}

// 处理消息点击
const handleMessageCommand = (command: string) => {
  console.log('Message clicked:', command)
}

// 清除所有通知
const clearNotifications = () => {
  notifications.value = []
}

// 清除所有消息
const clearMessages = () => {
  messages.value = []
}

// 获取消息类型对应的图标
const getMessageTypeIcon = (type: string) => {
  const iconMap = {
    document: Document,
    environment: Setting,
    mention: ChatDotRound,
    collaboration: UserFilled,
  }
  return iconMap[type as keyof typeof iconMap]
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const name = target.alt || 'User'
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=random&color=fff&size=128`
}

const currentUser = ref({
  avatar: 'https://api.avatars.githubusercontent.com/u/1234567',
  user: 'Charlie Brown',
})

const userMenuItems = ref([
  {
    command: 'profile',
    icon: User,
    iconColor: 'text-green-500',
    avatar: 'https://api.avatars.githubusercontent.com/u/2345678',
    user: 'Charlie Brown',
  },
  // ... 其他菜单项
])
</script>

<style>
/* 消息和通知下拉框样式 */
:deep(.el-popper.is-light) {
  background-color: var(--surface-1) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-popper.is-light .el-popper__arrow::before) {
  background-color: var(--surface-1) !important;
  border-color: var(--border-color) !important;
}

/* 下拉菜单基础样式 */
:deep(.el-dropdown-menu) {
  background-color: var(--surface-1) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-dropdown-menu__item) {
  background-color: var(--surface-1) !important;
  color: var(--text-color) !important;
  padding: 0 !important;
}

:deep(.el-dropdown-menu__item:hover),
:deep(.el-dropdown-menu__item:focus) {
  background-color: transparent !important;
}

/* 消息和通知项样式 */
:deep(.notification-item),
:deep(.message-item) {
  transition: background-color 0.2s ease;
  padding: 8px 16px;
}

:deep(.notification-item:hover),
:deep(.message-item:hover) {
  background-color: var(--surface-2) !important;
}

/* 活动项样式 */
:deep(.el-dropdown-menu__item.is-active) {
  color: var(--primary-color) !important;
  background-color: transparent !important;
}

/* 清空按钮样式 */
:deep(.clear-button) {
  color: var(--text-secondary) !important;
  border-top: 1px solid var(--border-color);
  transition: all 0.2s ease;
  padding: 8px 16px;
  width: 100%;
  display: block;
}

:deep(.clear-button:hover) {
  background-color: var(--surface-2) !important;
  color: var(--text-color) !important;
}

/* 未读标记样式 */
:deep(.unread-dot) {
  background-color: var(--primary-color);
}

/* 时间和工作区标签样式 */
:deep(.time-text),
:deep(.workspace-tag) {
  color: var(--text-secondary);
}

/* 消息预览图片容器 */
:deep(.preview-image) {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

/* 工作区选择器样式 */
:deep(.workspace-selector .el-dropdown-link) {
  color: var(--text-secondary);
}

:deep(.workspace-selector .el-dropdown-link:hover) {
  color: var(--text-color);
  background-color: var(--surface-2);
}

/* 图标和动画效果 */
:deep(svg) {
  transition: color 0.3s ease;
}

.gradient-text {
  transition: all 0.3s ease;
  background-size: 200% auto;
  animation: shine 2s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.cursor-pointer:hover :deep(svg),
.cursor-pointer:hover .gradient-text {
  filter: brightness(1.1);
  transform: scale(1.02);
}
</style>
