import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '../api/fetch'
import { $t } from '../locales'
import router from '../router'
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/user'
import { displayNotification } from '../utils/message'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const registerForm = ref<RegisterRequest>({
      username: '',
      password: '',
    })
    const loginForm = ref<LoginRequest>({
      username: '',
      email: '',
      password: '',
      captcha: '',
      phone: '',
    })

    const handleRegister = async () => {
      try {
        const resp = await post<RegisterResponse>('/user/register', {
          username: registerForm.value.username,
          password: registerForm.value.password,
        })
        if (resp.success) {
          displayNotification($t('auth.register.success'), 'success')
        }
      } catch (error) {
        displayNotification($t('auth.register.failure'), 'error')
        console.log(error)
      }
    }

    const handleLogin = async () => {
      try {
        const resp = await post<LoginResponse>('/user/login', {
          username: loginForm.value.username,
          password: loginForm.value.password,
        })
        if (resp.success) {
          token.value = resp.data.token
          router.push({ name: 'Request' })
          displayNotification($t('auth.login.success'), 'success')
        }
      } catch (error) {
        displayNotification($t('auth.login.failure'), 'error')
      }
    }

    return {
      token,
      registerForm,
      loginForm,
      handleRegister,
      handleLogin,
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'token',
          storage: localStorage,
          paths: ['token'],
        },
      ],
    },
  },
)
