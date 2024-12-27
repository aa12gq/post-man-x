<template>
  <div class="h-screen w-screen flex">
    <!-- 左侧轮播 -->
    <div class="flex-1 overflow-hidden relative h-screen bg-red-400">
      <el-carousel :autoplay="true" type="fade" height="100%">
        <el-carousel-item v-for="(slide, index) in slides" :key="index">
          <div class="flex justify-center items-center h-full">
            <img :src="slide.image" alt="" class="w-[70%] h-full object-cover" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 右侧登录表单 -->
    <div class="bg-white flex-1 flex flex-col justify-center items-center p-4 text-black">
      <h1 class="text-4xl mb-4 font-bold">登录</h1>
      <p class="text-gray-700 mb-4">
        没有账号？
        <router-link to="/register" class="underline text-blue-500 hover:text-blue-700"
          >注册</router-link
        >
      </p>
      <el-form :model="store.loginForm" label-position="top" class="w-[300px]">
        <!-- 登录方式选择 -->
        <div class="mb-4 flex justify-center">
          <el-button-group>
            <el-button
              type="default"
              :class="loginType === 'username' ? 'active-login-button' : 'inactive-login-button'"
              @click="loginType = 'username'"
            >
              账号
            </el-button>
            <el-button
              type="default"
              :class="loginType === 'email' ? 'active-login-button' : 'inactive-login-button'"
              @click="loginType = 'email'"
            >
              邮箱
            </el-button>
            <el-button
              type="default"
              :class="loginType === 'phone' ? 'active-login-button' : 'inactive-login-button'"
              @click="loginType = 'phone'"
            >
              手机
            </el-button>
          </el-button-group>
        </div>

        <!-- 动态显示不同的输入框 -->
        <el-form-item v-if="loginType === 'username'" label="账号">
          <el-input v-model="store.loginForm.username">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="loginType === 'email'" label="邮箱">
          <el-input v-model="store.loginForm.email">
            <template #prefix>
              <i class="iconfont icon-email text-sm"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="loginType === 'username'" label="密码">
          <el-input v-model="store.loginForm.password" type="password">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="loginType === 'email'" label="验证码">
          <el-row gutter="10">
            <el-col :span="16">
              <el-input v-model="store.loginForm.captcha">
                <template #prefix>
                  <i class="iconfont icon-yanzhengma text-sm" />
                </template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-button
                type="primary"
                :disabled="sendingCaptcha"
                @click="sendCaptcha"
                class="w-full"
              >
                {{ sendingCaptcha ? '发送中...' : '发送验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="loginType === 'phone'" label="手机号">
          <el-input v-model="store.loginForm.phone">
            <template #prefix>
              <el-icon><Cellphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="loginType === 'phone'" label="验证码">
          <el-row gutter="10">
            <el-col :span="16">
              <el-input v-model="store.loginForm.phoneCaptcha">
                <template #prefix>
                  <i class="iconfont icon-yanzhengma text-sm" />
                </template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-button
                type="primary"
                :disabled="sendingCaptcha"
                @click="sendCaptcha"
                class="w-full"
              >
                {{ sendingCaptcha ? '发送中...' : '发送验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="w-full">登录</el-button>
        </el-form-item>
        <div class="flex items-center my-4">
          <div class="flex-grow border-t border-gray-300"></div>
          <span class="mx-4 text-gray-500">其他登录方式</span>
          <div class="flex-grow border-t border-gray-300"></div>
        </div>
        <!-- 第三方登录 -->
        <div class="mt-4 flex justify-center gap-4">
          <i
            class="iconfont icon-github text-2xl cursor-pointer"
            @click="thirdPartyLogin('github')"
          ></i>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { User, Lock, Cellphone } from '@element-plus/icons-vue'

const store = useUserStore()
const loginType = ref('username')
const sendingCaptcha = ref(false)

const slides = [
  { image: 'https://via.placeholder.com/800x600?text=Slide+1' },
  { image: 'https://via.placeholder.com/800x600?text=Slide+2' },
  { image: 'https://via.placeholder.com/800x600?text=Slide+3' },
  { image: 'https://via.placeholder.com/800x600?text=Slide+4' },
  { image: 'https://via.placeholder.com/800x600?text=Slide+5' },
]

const handleLogin = () => {
  store.handleLogin()
}

const sendCaptcha = () => {
  sendingCaptcha.value = true
  // 模拟发送验证码
  setTimeout(() => {
    sendingCaptcha.value = false
  }, 2000)
}

const thirdPartyLogin = (provider: string) => {
  switch (provider) {
    case 'github':
      store.GithubLogin()
      break
    default:
      console.log('不支持的登录方式')
  }
}
</script>

<style scoped>
.active-login-button {
  background-color: #409eff !important;
  color: white !important;
}

.inactive-login-button {
  background-color: white !important;
  color: black !important;
}
</style>
