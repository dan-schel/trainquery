export default [
  {
    path: "/",
    name: "home",
    meta: {
      title: "Home | TrainQuery",
    },
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/map",
    name: "map",
    meta: {
      title: "Map | TrainQuery",
    },
    component: () => import("../views/Map.vue"),
  },
  {
    path: "/lines",
    name: "lines",
    meta: {
      title: "Lines | TrainQuery",
    },
    component: () => import("../views/Lines.vue"),
  },
  {
    path: "/about",
    name: "about",
    meta: {
      title: "About | TrainQuery",
    },
    component: () => import("../views/About.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    meta: {
      title: "Settings | TrainQuery",
    },
    component: () => import("../views/Settings.vue"),
  },

  // Catch-all
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    meta: {
      title: "Not found | TrainQuery",
    },
    component: () => import("../views/NotFound.vue"),
  },
];
