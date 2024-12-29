import {
  createRouter,
  createWebHashHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router'
import { useUserStore } from '../stores/user' // 假设你有一个用户 store
import BackgroundTest from '../views/BackgroundTest.vue'
import Home from '../views/Home.vue'
import ThemeTest from '../views/ThemeTest.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Home',
      requiresAuth: false,
      showHeader: false,
    },
  },
  {
    path: '/request',
    name: 'Request',
    component: () => import('../components/RequestPanel.vue'),
    meta: {
      title: 'Request',
      requiresAuth: true,
      showHeader: true,
    },
  },
  {
    path: '/workspace-setup',
    name: 'WorkspaceSetup',
    component: () => import('../components/WorkspaceSetup.vue'),
    meta: {
      title: 'WorkspaceSetup',
      requiresAuth: true,
      showHeader: true,
    },
  },
  {
    path: '/workspace-manage',
    name: 'WorkspaceManage',
    component: () => import('../views/WorkspaceManage/index.vue'),
    meta: {
      title: 'WorkspaceManagement',
      requiresAuth: true,
      showHeader: true,
    },
  },
  {
    path: '/background-test',
    name: 'BackgroundTest',
    component: BackgroundTest,
    meta: {
      requiresAuth: true,
      showHeader: false,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Login',
      requiresAuth: false,
      showHeader: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: 'Register',
      requiresAuth: false,
      showHeader: false,  
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: 'Profile',
      requiresAuth: true,
      showHeader: true,
    },
  },
  {
    path: '/theme-test',
    name: 'ThemeTest',
    component: ThemeTest,
    meta: {
      showHeader: true,
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由鉴权和标题设置
router.beforeEach(
  (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: (to?: string | false | { name: string }) => void,
  ) => {
    const userStore = useUserStore()
    const isAuthenticated = !!userStore.token

    if (to.meta.requiresAuth && !isAuthenticated) {
      // 如果路由需要登录且用户未登录，则重定向到登录页面
      next({ name: 'Login' })
    } else {
      // 设置页面标题
      document.title = `${to.meta?.title || 'RPC Master'} - RPC Master`
      next()
    }
  },
)

export default router
