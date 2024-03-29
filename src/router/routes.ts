export default [
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },
  // {
  //   path: "/map",
  //   name: "map",
  //   component: () => import("../views/Map.vue"),
  // },
  {
    path: "/lines",
    name: "lines-overview",
    component: () => import("../views/LinesOverview.vue"),
  },
  {
    path: "/line/:id",
    name: "line",
    component: () => import("../views/Line.vue"),
  },
  {
    path: "/stop/:id",
    name: "stop",
    component: () => import("../views/Stop.vue"),
  },
  {
    path: "/train/:source/:id",
    name: "train",
    component: () => import("../views/Train.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/about/legal",
    name: "about-legal",
    component: () => import("../views/AboutLegal.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/Settings.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/Admin.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("../views/NotFound.vue"),
  },
];
