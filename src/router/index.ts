import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
  RouteLocationNormalized,
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
