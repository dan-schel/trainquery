import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";

declare module "vue-router" {
  interface RouteMeta {
    title: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
