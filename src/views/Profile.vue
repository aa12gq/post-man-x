<template>
  <div class="bg-surface-1 min-h-screen overflow-auto">
    <!-- 顶部区域 -->
    <div class="relative h-72 overflow-hidden">
      <!-- 高级背景效果 -->
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-surface-1">
          <!-- 动态渐变背景 -->
          <div class="absolute inset-0">
            <!-- 科技感渐变背景 -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/10 via-[#2563EB]/5 to-[#4F46E5]/10 animate-gradient"
            ></div>

            <!-- 动态光斑 -->
            <div
              class="absolute -left-48 -top-48 w-96 h-96 bg-[#0EA5E9]/25 rounded-full filter blur-[100px] animate-pulse-slow"
            ></div>
            <div
              class="absolute -right-48 -bottom-48 w-96 h-96 bg-[#4F46E5]/25 rounded-full filter blur-[100px] animate-pulse-slow delay-1000"
            ></div>

            <!-- 科技纹理 -->
            <div class="absolute inset-0">
              <div
                class="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-[0.04] bg-repeat mix-blend-overlay"
              ></div>
            </div>
          </div>

          <!-- 高级光效 -->
          <div class="absolute inset-0 overflow-hidden">
            <!-- 主光效 -->
            <div class="absolute w-full h-full">
              <!-- 光束效果 -->
              <div class="absolute inset-0">
                <div
                  class="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-r from-[#0EA5E9]/40 to-transparent rotate-45 transform origin-left animate-beam"
                ></div>
                <div
                  class="absolute top-0 -right-1/4 w-full h-full bg-gradient-to-l from-[#4F46E5]/40 to-transparent -rotate-45 transform origin-right animate-beam delay-2000"
                ></div>
              </div>
            </div>

            <!-- 流光效果 -->
            <div class="absolute inset-0">
              <div
                class="absolute h-[2px] w-full top-1/3 bg-gradient-to-r from-transparent via-[#0EA5E9]/50 to-transparent animate-flow"
              ></div>
              <div
                class="absolute h-[2px] w-full top-2/3 bg-gradient-to-r from-transparent via-[#4F46E5]/50 to-transparent animate-flow-reverse"
              ></div>
            </div>

            <!-- 粒子效果 -->
            <div class="absolute inset-0">
              <div class="particle-container">
                <div
                  class="particle bg-[#0EA5E9]/60 w-1.5 h-1.5 shadow-[0_0_5px_#0EA5E9]"
                ></div>
                <div
                  class="particle bg-[#4F46E5]/60 w-2 h-2 shadow-[0_0_5px_#4F46E5]"
                ></div>
                <div
                  class="particle bg-[#0EA5E9]/50 w-2.5 h-2.5 shadow-[0_0_5px_#0EA5E9]"
                ></div>
                <div
                  class="particle bg-[#4F46E5]/50 w-1.5 h-1.5 shadow-[0_0_5px_#4F46E5]"
                ></div>
                <div
                  class="particle bg-[#0EA5E9]/40 w-2 h-2 shadow-[0_0_5px_#0EA5E9]"
                ></div>
              </div>
            </div>
          </div>

          <!-- 网格纹理 -->
          <div class="absolute inset-0 overflow-hidden">
            <div
              class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-white/[0.01] backdrop-blur-[2px]"
            ></div>
            <!-- 玻璃态蒙版 -->
            <div
              class="absolute inset-0 backdrop-blur-[2px] backdrop-saturate-150 bg-white/[0.02]"
            ></div>
          </div>

          <!-- 光影效果 -->
          <div class="absolute inset-0">
            <div
              class="absolute inset-0 bg-gradient-to-t from-surface-2/80 via-surface-2/30 to-transparent backdrop-blur-sm"
            >
              <!-- 光晕效果 -->
              <div
                class="absolute inset-0 bg-gradient-radial from-transparent to-surface-2/50"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="relative h-full max-w-6xl mx-auto px-8">
        <div class="flex items-center gap-12 h-full">
          <!-- 头像区域 -->
          <div class="relative group">
            <div class="relative">
              <!-- 头像装饰边框 -->
              <div
                class="absolute -inset-1 bg-gradient-to-br from-primary/30 to-success/30 rounded-2xl blur"
              ></div>
              <!-- 头像容器 -->
              <div
                class="w-36 h-36 rounded-2xl overflow-hidden ring-2 ring-surface-4/30 shadow-2xl relative bg-surface-2 backdrop-blur-xl flex items-center justify-center"
              >
                <el-upload
                  class="avatar-uploader h-full"
                  action="/api/upload/avatar"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                >
                  <div class="relative w-36 h-36 cursor-pointer group">
                    <template v-if="userData.avatar">
                      <img
                        :src="userData.avatar"
                        class="w-36 h-36 object-cover transition-all duration-500 group-hover:scale-110"
                      />
                    </template>
                    <template v-else>
                      <div
                        class="w-36 h-36 flex items-center justify-center bg-surface-2"
                      >
                        <el-icon class="text-5xl text-text-secondary">
                          <UserFilled />
                        </el-icon>
                      </div>
                    </template>
                    <!-- 悬浮上传提示 -->
                    <div
                      class="absolute inset-0 bg-surface-4/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm gap-2"
                    >
                      <el-icon class="text-2xl text-text"><Camera /></el-icon>
                      <span class="text-xs text-text-secondary"
                        >Change Avatar</span
                      >
                    </div>
                  </div>
                </el-upload>
              </div>
            </div>
            <!-- 在线状态指示器 -->
            <div
              class="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full ring-4 ring-surface-1 flex items-center justify-center"
            >
              <div class="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          <!-- 用户信息区域 -->
          <div class="text-text pt-4">
            <div class="flex items-center gap-4 mb-3">
              <h1 class="text-3xl font-semibold tracking-tight">
                {{ userData.username }}
              </h1>
              <div class="flex items-center gap-2">
                <el-tag
                  size="small"
                  type="success"
                  effect="dark"
                  class="!border-0"
                  >{{ userData.membership }}</el-tag
                >
                <el-tag
                  size="small"
                  type="warning"
                  effect="dark"
                  class="!border-0"
                  >{{ userData.role }}</el-tag
                >
              </div>
            </div>
            <p
              class="text-text-secondary text-lg font-light mb-8 flex items-center gap-2"
            >
              <el-icon><Message /></el-icon>
              {{ userData.email }}
            </p>
            <!-- 数据统计 -->
            <div class="flex items-stretch gap-8">
              <div class="stat-item">
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-semibold text-text">{{
                    userData.stats.requests
                  }}</span>
                  <div class="stat-trend success">+12.5%</div>
                </div>
                <div class="text-sm text-text-secondary font-light">
                  Requests
                </div>
              </div>
              <div class="stat-divider">
                <div class="stat-divider-line"></div>
                <div class="stat-divider-dot"></div>
              </div>
              <div class="stat-item">
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-semibold text-text">{{
                    userData.stats.collections
                  }}</span>
                  <div class="stat-trend success">+5.2%</div>
                </div>
                <div class="text-sm text-text-secondary font-light">
                  Collections
                </div>
              </div>
              <div class="stat-divider">
                <div class="stat-divider-line"></div>
                <div class="stat-divider-dot"></div>
              </div>
              <div class="stat-item">
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-semibold text-text">{{
                    userData.stats.workspaces
                  }}</span>
                  <div class="stat-trend warning">-2.1%</div>
                </div>
                <div class="text-sm text-text-secondary font-light">
                  Workspaces
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-6xl mx-auto px-8 -mt-12 pb-16 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧面板 -->
        <div class="space-y-8">
          <!-- 快捷操作卡片 -->
          <div
            class="bg-surface-2/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-border transition-all duration-300 hover:bg-surface-2/70"
          >
            <div class="p-6 relative">
              <h3 class="text-base font-medium text-text mb-4">
                Quick Actions
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="action in quickActions"
                  :key="action.label"
                  class="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-1 bg-opacity-30 backdrop-blur-xl backdrop-saturate-150 hover:bg-surface-3 hover:bg-opacity-40 transition-all duration-300 group border border-border"
                >
                  <el-icon
                    class="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110"
                    :class="action.iconColor"
                  >
                    <component :is="action.icon" />
                  </el-icon>
                  <span class="text-sm text-text">{{ action.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 活动记录卡片 -->
          <div
            class="bg-surface-2/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-border transition-all duration-300 hover:bg-surface-2/70"
          >
            <div class="p-6 relative">
              <h3
                class="text-base font-medium text-text mb-6 flex items-center gap-2"
              >
                <el-icon class="text-[#0EA5E9]"><Timer /></el-icon>
                Recent Activities
              </h3>
              <div class="space-y-3">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.title"
                  class="flex items-start gap-4 p-3 rounded-xl bg-surface-1 bg-opacity-30 backdrop-blur-xl backdrop-saturate-150 hover:bg-surface-3 hover:bg-opacity-40 transition-all duration-300 cursor-pointer group border border-border"
                >
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="activity.iconBg"
                  >
                    <el-icon class="text-lg" :class="activity.iconColor">
                      <component :is="activity.icon" />
                    </el-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div
                      class="text-sm font-medium text-text truncate group-hover:text-primary transition-colors"
                    >
                      {{ activity.title }}
                    </div>
                    <div class="text-xs text-secondary">
                      {{ activity.time }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 基本信息卡片 -->
          <div
            class="bg-surface-2/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-border transition-all duration-300 hover:bg-surface-2/70"
          >
            <div class="p-6 relative">
              <h3
                class="text-base font-medium text-text mb-6 flex items-center gap-2"
              >
                <el-icon class="text-[#0EA5E9]"><User /></el-icon>
                Basic Information
              </h3>
              <el-form :model="form" label-position="top">
                <el-form-item label="Username">
                  <el-input
                    v-model="form.username"
                    placeholder="Enter your username"
                    class="profile-input"
                  />
                </el-form-item>
                <el-form-item label="Email">
                  <el-input
                    v-model="form.email"
                    type="email"
                    disabled
                    class="profile-input"
                  />
                </el-form-item>
                <el-form-item label="Bio">
                  <el-input
                    v-model="form.bio"
                    type="textarea"
                    :rows="4"
                    placeholder="Tell us about yourself"
                    class="profile-input"
                  />
                </el-form-item>
                <div class="flex justify-end">
                  <el-button
                    type="primary"
                    @click="saveProfile"
                    class="!px-8 !h-10 !rounded-xl !bg-primary-color hover:!opacity-90 transition-opacity"
                  >
                    Save
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>

          <!-- 安全设置卡片 -->
          <div
            class="bg-surface-2/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-border transition-all duration-300 hover:bg-surface-2/70"
          >
            <div class="p-6 relative">
              <h3
                class="text-base font-medium text-text mb-6 flex items-center gap-2"
              >
                <el-icon class="text-[#4F46E5]"><Lock /></el-icon>
                Security
              </h3>
              <!-- 安全选项列表 -->
              <div class="space-y-6">
                <!-- 修改密码 -->
                <div
                  class="flex items-center justify-between p-4 rounded-xl bg-surface-1 bg-opacity-30 hover:bg-surface-3/30 transition-all duration-300 group/item"
                >
                  <div>
                    <div
                      class="text-sm font-medium text-text group-hover/item:text-[#4F46E5] transition-colors flex items-center gap-2"
                    >
                      <el-icon><Key /></el-icon>
                      Change Password
                      <el-tag
                        v-if="security.passwordLastChanged"
                        size="small"
                        type="info"
                        class="ml-2"
                      >
                        Last changed {{ security.passwordLastChanged }}
                      </el-tag>
                    </div>
                    <div class="text-xs text-text-secondary">
                      Update your password regularly to keep your account secure
                    </div>
                  </div>
                  <el-button
                    type="primary"
                    class="!bg-[#4F46E5]"
                    @click="showPasswordChange = !showPasswordChange"
                  >
                    <el-icon class="mr-1"><Edit /></el-icon>
                    {{ showPasswordChange ? "Cancel" : "Change" }}
                  </el-button>
                </div>

                <!-- 密码修改流程 -->
                <div v-show="showPasswordChange" class="space-y-6 mt-4">
                  <!-- 步骤指示器 -->
                  <el-steps
                    :active="currentStep"
                    finish-status="success"
                    class="mb-8"
                  >
                    <el-step
                      title="Current Password"
                      description="Verify your identity"
                    />
                    <el-step
                      title="New Password"
                      description="Set a strong password"
                    />
                    <el-step
                      title="Confirm"
                      description="Verify new password"
                    />
                  </el-steps>

                  <el-form
                    :model="passwordForm"
                    :rules="passwordRules"
                    ref="passwordFormRef"
                    label-position="top"
                    class="bg-surface-1/50 backdrop-blur-xl rounded-xl p-6"
                  >
                    <!-- 当前密码 -->
                    <div v-show="currentStep === 0">
                      <el-form-item
                        prop="currentPassword"
                        label="Current Password"
                      >
                        <el-input
                          v-model="passwordForm.currentPassword"
                          type="password"
                          placeholder="Enter your current password"
                          show-password
                        />
                      </el-form-item>
                    </div>

                    <!-- 新密码 -->
                    <div v-show="currentStep === 1">
                      <el-form-item prop="newPassword" label="New Password">
                        <el-input
                          v-model="passwordForm.newPassword"
                          type="password"
                          placeholder="Enter your new password"
                          show-password
                          @input="checkPasswordStrength"
                        />
                        <!-- 密码强度指示器 -->
                        <div class="mt-4">
                          <div class="flex items-center justify-between">
                            <span class="text-sm text-text-secondary"
                              >Password Strength</span
                            >
                            <span class="text-sm" :class="strengthColor">{{
                              strengthText
                            }}</span>
                          </div>
                          <div class="h-1.5 bg-surface-2 rounded-full mt-2">
                            <div
                              class="h-full transition-all duration-300 rounded-full"
                              :class="strengthBarClass"
                              :style="{ width: `${strengthScore * 25}%` }"
                            />
                          </div>
                          <!-- 密码要求列表 -->
                          <div class="mt-4 space-y-2">
                            <div
                              v-for="(req, key) in requirements"
                              :key="key"
                              class="flex items-center gap-2"
                              :class="
                                req.met ? 'text-success' : 'text-text-secondary'
                              "
                            >
                              <el-icon><Check /></el-icon>
                              <span class="text-sm">{{ req.text }}</span>
                            </div>
                          </div>
                        </div>
                      </el-form-item>
                    </div>

                    <!-- 确认密码 -->
                    <div v-show="currentStep === 2">
                      <el-form-item
                        prop="confirmPassword"
                        label="Confirm Password"
                      >
                        <el-input
                          v-model="passwordForm.confirmPassword"
                          type="password"
                          placeholder="Confirm your new password"
                          show-password
                        />
                      </el-form-item>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="flex justify-end gap-2 mt-6">
                      <el-button v-if="currentStep > 0" @click="currentStep--"
                        >Previous</el-button
                      >
                      <el-button
                        type="primary"
                        :loading="changing"
                        :disabled="!canProceed"
                        @click="
                          currentStep === 2
                            ? handleChangePassword()
                            : nextStep()
                        "
                      >
                        {{ currentStep === 2 ? "Confirm Change" : "Next" }}
                      </el-button>
                    </div>
                  </el-form>
                </div>

                <!-- 其他安全选项... -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserFilled,
  Camera,
  Collection,
  FolderAdd,
  Setting,
  Share,
  User,
  Message,
  Edit,
  Check,
  Lock,
  Key,
  Timer,
  Monitor,
} from "@element-plus/icons-vue";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

const userData = ref({
  username: "VT YUG",
  email: "vtyug@gmail.com",
  avatar:
    "https://images.pexels.com/photos/9072343/pexels-photo-9072343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  membership: "Pro",
  role: "Admin",
  bio: "Full-stack developer passionate about creating amazing tools",
  stats: {
    requests: "2.5k",
    collections: 36,
    workspaces: 12,
  },
});

const quickActions = [
  {
    label: "New Collection",
    icon: Collection,
    iconColor: "text-blue-500",
  },
  {
    label: "New Workspace",
    icon: FolderAdd,
    iconColor: "text-green-500",
  },
  {
    label: "Share Profile",
    icon: Share,
    iconColor: "text-purple-500",
  },
  {
    label: "Settings",
    icon: Setting,
    iconColor: "text-orange-500",
  },
];

const recentActivities = [
  {
    title: 'Created new collection "API Testing"',
    time: "2 hours ago",
    icon: Collection,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "Updated workspace settings",
    time: "5 hours ago",
    icon: Setting,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    title: "Shared collection with team",
    time: "Yesterday",
    icon: Share,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    title: "Created new environment",
    time: "2 days ago",
    icon: Monitor,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
];

const handleAvatarSuccess = (response: { url: string }) => {
  userData.value.avatar = response.url;
};

const saveProfile = () => {
  console.log("saveProfile");
};

const form = ref({
  username: userData.value.username,
  email: userData.value.email,
  bio: userData.value.bio,
});

const security = ref({
  twoFactor: false,
  passwordLastChanged: "2 months ago",
  lastLogin: "2 hours ago",
  connectedDevices: 3,
});

const showPasswordChange = ref(false);
const changing = ref(false);
const passwordFormRef = ref();
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordRules = {
  currentPassword: [
    { required: true, message: "Please input current password" },
  ],
  newPassword: [
    { required: true, message: "Please input new password" },
    { min: 8, message: "Password must be at least 8 characters" },
  ],
  confirmPassword: [
    { required: true, message: "Please confirm new password" },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error("Passwords do not match"));
        } else {
          callback();
        }
      },
    },
  ],
};

const currentStep = ref(0);
const strengthScore = ref(0);
const requirements = ref({
  length: { met: false, text: "At least 8 characters" },
  uppercase: { met: false, text: "Contains uppercase letter" },
  lowercase: { met: false, text: "Contains lowercase letter" },
  number: { met: false, text: "Contains number" },
  special: { met: false, text: "Contains special character" },
});

const strengthText = computed(() => {
  if (strengthScore.value === 0) return "Very Weak";
  if (strengthScore.value === 1) return "Weak";
  if (strengthScore.value === 2) return "Medium";
  if (strengthScore.value === 3) return "Strong";
  return "Very Strong";
});

const strengthColor = computed(() => {
  if (strengthScore.value <= 1) return "text-error";
  if (strengthScore.value === 2) return "text-warning";
  return "text-success";
});

const strengthBarClass = computed(() => {
  if (strengthScore.value <= 1) return "bg-error";
  if (strengthScore.value === 2) return "bg-warning";
  return "bg-success";
});

const canProceed = computed(() => {
  if (currentStep.value === 0)
    return passwordForm.value.currentPassword.length >= 6;
  if (currentStep.value === 1) return strengthScore.value >= 2;
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const checkPasswordStrength = () => {
  const password = passwordForm.value.newPassword;
  let score = 0;

  requirements.value.length.met = password.length >= 8;
  if (requirements.value.length.met) score++;

  requirements.value.uppercase.met = /[A-Z]/.test(password);
  if (requirements.value.uppercase.met) score++;

  requirements.value.lowercase.met = /[a-z]/.test(password);
  if (requirements.value.lowercase.met) score++;

  requirements.value.number.met = /[0-9]/.test(password);
  if (requirements.value.number.met) score++;

  requirements.value.special.met = /[^A-Za-z0-9]/.test(password);
  if (requirements.value.special.met) score++;

  strengthScore.value = Math.min(4, Math.floor(score / 2));
};

const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证当前密码
    await new Promise((resolve) => setTimeout(resolve, 500));
    currentStep.value++;
  } else if (currentStep.value === 1 && strengthScore.value >= 2) {
    currentStep.value++;
  }
};

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    changing.value = true;

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ElMessage.success("Password changed successfully");
    showPasswordChange.value = false;
    currentStep.value = 0;
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    strengthScore.value = 0;
  } catch (error) {
    console.error(error);
  } finally {
    changing.value = false;
  }
};
</script>

<style scoped>
.profile-input :deep(.el-input__wrapper) {
  @apply !bg-surface-1 !bg-opacity-30 !backdrop-blur-xl !backdrop-saturate-150 !border-white/[0.03] !shadow-none transition-all duration-300 !rounded-xl;
  box-shadow: none !important;
}

.profile-input :deep(.el-input__wrapper:hover) {
  @apply !bg-surface-3 !bg-opacity-40;
}

.profile-input :deep(.el-textarea__inner) {
  @apply !bg-surface-1 !bg-opacity-30 !backdrop-blur-xl !backdrop-saturate-150 !border-white/[0.03] !shadow-none transition-all duration-300 !rounded-xl;
  box-shadow: none !important;
}

.profile-input :deep(.el-textarea__inner:hover) {
  @apply !bg-surface-3 !bg-opacity-40;
}

:deep(.el-form-item__label) {
  @apply !text-text !text-opacity-80 !text-sm !font-medium;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  @apply w-1.5;
}

::-webkit-scrollbar-track {
  @apply bg-surface-1 bg-opacity-50;
}

::-webkit-scrollbar-thumb {
  @apply bg-surface-3 bg-opacity-50 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-surface-3 bg-opacity-80;
}

/* 自定义标签页样式 */
:deep(.custom-tabs .el-tabs__header) {
  @apply m-0 border-b border-surface-1 bg-surface-1 bg-opacity-30;
}

:deep(.custom-tabs .el-tabs__nav-wrap::after) {
  @apply hidden;
}

:deep(.custom-tabs .el-tabs__item) {
  @apply text-secondary transition-all duration-300 !border-0 text-sm;
  padding: 1rem 1.5rem;
}

:deep(.custom-tabs .el-tabs__item.is-active) {
  @apply text-primary font-medium;
  box-shadow: inset 0 -2px 0 var(--el-color-primary);
}

:deep(.custom-tabs .el-tabs__item:hover) {
  @apply text-primary;
}

:deep(.custom-tabs .el-tabs__active-bar) {
  @apply hidden;
}

/* 背景噪点纹理 */
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* 缓慢旋转动画 */
@keyframes slow-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slow-spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-slow-spin {
  animation: slow-spin 30s linear infinite;
}

.animate-slow-spin-reverse {
  animation: slow-spin-reverse 25s linear infinite;
}

/* 磨砂玻璃卡片效果 */
.glass-card {
  @apply relative overflow-hidden;
  transform-style: preserve-3d;
}

.glass-card::before {
  @apply absolute inset-0 rounded-2xl;
  content: "";
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  transform: translateZ(-1px);
}

/* 入框样式 */
.profile-input :deep(.el-input__wrapper) {
  @apply !bg-surface-1 !bg-opacity-30 !backdrop-blur-xl !backdrop-saturate-150 !border-white/[0.03] !shadow-none transition-all duration-300 !rounded-xl;
  box-shadow: none !important;
}

.profile-input :deep(.el-input__wrapper:hover) {
  @apply !bg-surface-3 !bg-opacity-40;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -10px) rotate(2deg);
  }
  50% {
    transform: translate(0, -20px) rotate(0deg);
  }
  75% {
    transform: translate(-10px, -10px) rotate(-2deg);
  }
}

.animate-float {
  animation: float 20s infinite ease-in-out;
}

.animate-float-delay {
  animation: float 20s infinite ease-in-out reverse;
  animation-delay: -10s;
}

/* 波浪动画 */
.wave1 {
  color: var(--primary);
  animation: wave 8s ease-in-out infinite;
}

.wave2 {
  color: var(--success);
  animation: wave 8s ease-in-out infinite reverse;
  opacity: 0.5;
}

@keyframes wave {
  0%,
  100% {
    d: path("M0,50 Q25,45 50,50 T100,50 V100 H0 Z");
  }
  50% {
    d: path("M0,50 Q25,55 50,50 T100,50 V100 H0 Z");
  }
}

/* 统计项样式 */
.stat-item {
  @apply min-w-[120px];
}

.stat-trend {
  @apply text-xs px-2 py-0.5 rounded-full font-medium;
}

.stat-trend.success {
  color: var(--success);
  background-color: rgba(var(--success-rgb), 0.1);
}

.stat-trend.warning {
  color: var(--warning);
  background-color: rgba(var(--warning-rgb), 0.1);
}

/* 其他动画效果 */
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(5px, -5px) rotate(1deg);
  }
  50% {
    transform: translate(0, -10px) rotate(0deg);
  }
  75% {
    transform: translate(-5px, -5px) rotate(-1deg);
  }
}

.animate-float {
  animation: float 10s infinite ease-in-out;
}

/* 状网格背景 */
.bg-dot-pattern {
  background-image: radial-gradient(
      circle,
      currentColor 0.5px,
      transparent 0.5px
    ),
    radial-gradient(circle, currentColor 0.5px, transparent 0.5px);
  background-size: 24px 24px, 36px 36px;
  background-position: 0 0, 12px 12px;
}

/* 线条动画 */
@keyframes draw-line {
  from {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  to {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

.animate-draw-line {
  animation: draw-line 3s ease-out forwards;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-600 {
  animation-delay: 0.6s;
}

/* 波浪动画优化 */
.wave1 {
  color: var(--primary);
  animation: wave 8s ease-in-out infinite;
  opacity: 0.3;
}

.wave2 {
  color: var(--success);
  animation: wave 10s ease-in-out infinite reverse;
  opacity: 0.2;
}

.wave3 {
  color: var(--primary);
  animation: wave 12s ease-in-out infinite;
  opacity: 0.1;
}

@keyframes wave {
  0%,
  100% {
    d: path("M0,60 Q25,55 50,60 T100,60 V100 H0 Z");
    transform: translateX(0);
  }
  50% {
    d: path("M0,60 Q25,65 50,60 T100,60 V100 H0 Z");
    transform: translateX(-2%);
  }
}

/* 动态效果样式 */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.bg-gradient-radial {
  background-image: radial-gradient(
    circle,
    var(--tw-gradient-from) 0%,
    var(--tw-gradient-to) 70%
  );
}

/* 优化点状网格 */
.bg-dot-pattern {
  background-image: radial-gradient(
      circle,
      currentColor 0.5px,
      transparent 0.5px
    ),
    radial-gradient(circle, currentColor 0.5px, transparent 0.5px);
  background-size: 24px 24px, 36px 36px;
  background-position: 0 0, 12px 12px;
}

/* 光束动画 */
@keyframes slide-right {
  0%,
  100% {
    transform: translateX(-10%) rotate(12deg);
    opacity: 0.3;
  }
  50% {
    transform: translateX(0) rotate(12deg);
    opacity: 0.6;
  }
}

@keyframes slide-left {
  0%,
  100% {
    transform: translateX(10%) rotate(-12deg);
    opacity: 0.3;
  }
  50% {
    transform: translateX(0) rotate(-12deg);
    opacity: 0.6;
  }
}

.animate-slide-right {
  animation: slide-right 8s ease-in-out infinite;
}

.animate-slide-left {
  animation: slide-left 8s ease-in-out infinite;
  animation-delay: 1s;
}

/* 动态渐变动画 */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

/* 极光效果 */
@keyframes aurora {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-10%, -10%) scale(1.2);
    opacity: 0.5;
  }
}

.animate-aurora {
  animation: aurora 10s ease-in-out infinite;
}

.animate-aurora-reverse {
  animation: aurora 12s ease-in-out infinite reverse;
}

/* 流光动画 */
@keyframes flow {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-flow {
  animation: flow 4s ease-out infinite;
}

.animate-flow-reverse {
  animation: flow 5s ease-out infinite reverse;
}

/* 粒子效果 */
.particle-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: float-particle 15s infinite linear;
}

.particle:nth-child(1) {
  left: 10%;
  top: 20%;
  animation-delay: 0s;
}
.particle:nth-child(2) {
  left: 30%;
  top: 40%;
  animation-delay: -3s;
}
.particle:nth-child(3) {
  left: 50%;
  top: 60%;
  animation-delay: -6s;
}
.particle:nth-child(4) {
  left: 70%;
  top: 80%;
  animation-delay: -9s;
}
.particle:nth-child(5) {
  left: 90%;
  top: 30%;
  animation-delay: -12s;
}

@keyframes float-particle {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
    transform: translate(20px, -20px) rotate(90deg) scale(1.2);
  }
  80% {
    opacity: 0.6;
    transform: translate(60px, -60px) rotate(180deg) scale(0.8);
  }
  100% {
    transform: translate(100px, -100px) rotate(360deg) scale(0.2);
    opacity: 0;
  }
}

/* 光束动画 */
@keyframes beam {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-20%) rotate(var(--rotation));
  }
  50% {
    opacity: 0.5;
    transform: translateX(0) rotate(var(--rotation));
  }
}

.rotate-45 {
  --rotation: 45deg;
}

.-rotate-45 {
  --rotation: -45deg;
}

.animate-beam {
  animation: beam 8s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1s;
}

.delay-2000 {
  animation-delay: 2s;
}

/* 流光动画 */
@keyframes flow {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-flow {
  animation: flow 4s ease-out infinite;
}

.animate-flow-reverse {
  animation: flow 5s ease-out infinite reverse;
}

/* 粒子动画 */
@keyframes float-particle {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
    transform: translate(20px, -20px) rotate(90deg) scale(1.2);
  }
  80% {
    opacity: 0.6;
    transform: translate(60px, -60px) rotate(180deg) scale(0.8);
  }
  100% {
    transform: translate(100px, -100px) rotate(360deg) scale(0.2);
    opacity: 0;
  }
}
</style>
