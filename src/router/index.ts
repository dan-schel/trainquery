import { createRouter, createWebHistory } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      meta: {
        title: "Home | TrainQuery"
      },
      component: () => import("../views/Home.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      meta: {
        title: "Not found | TrainQuery"
      },
      component: () => import("../views/NotFound.vue"),
    },
    {
      path: "/about",
      name: "about",
      meta: {
        title: "About | TrainQuery"
      },
      component: () => import("../views/About.vue"),
    },
  ],
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
