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
    name: "lines-overview",
    component: () => import("../views/LinesOverview.vue"),
  },
  {
    path: "/lines/:id",
    name: "line",
    component: () => import("../views/Line.vue"),
  },
  {
    path: "/stops/:id",
    name: "stop",
    component: () => import("../views/Stop.vue"),
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
