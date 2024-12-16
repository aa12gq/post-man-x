import {
  createRouter,
  createWebHashHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
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
