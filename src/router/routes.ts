export default [
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/map",
    name: "map",
    component: () => import("../views/Map.vue"),
  },
  {
    path: "/lines",
    name: "lines",
    component: () => import("../views/Lines.vue"),
  },
  {
    path: "/lines/:id(\\d+)",
    name: "line",
    component: () => import("../views/Line.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/Settings.vue"),
  },
  {
    path: "/error/notfound",
    name: "notfound",
    component: () => import("../views/NotFound.vue"),
  },

  // Catch-all
  {
    path: "/:pathMatch(.*)*",
    redirect: "/error/notfound",
  },
];
