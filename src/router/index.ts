import {
  createRouter,
  createWebHashHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import Home from '../views/Home.vue';
import BackgroundTest from '../views/BackgroundTest.vue';

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Home",
    },
  },
  {
    path: "/request",
    name: "Request",
    component: () => import("../components/RequestPanel.vue"),
    meta: {
      title: "Request",
    },
  },
  {
    path: "/workspace-setup",
    name: "WorkspaceSetup",
    component: () => import("../components/WorkspaceSetup.vue"),
    meta: {
      title: "WorkspaceSetup",
    },
  },
  {
    path: '/background-test',
    name: 'BackgroundTest',
    component: BackgroundTest,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由标题
router.beforeEach(
  (to: RouteLocationNormalized, _from: any, next: () => void) => {
    document.title = `${to.meta?.title || "RPC Master"} - RPC Master`;
    next();
  }
);

export default router;
