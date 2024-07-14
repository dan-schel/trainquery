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
    component: () => import("../views/admin/Admin.vue"),
  },
  {
    path: "/admin/status",
    name: "admin-status",
    component: () => import("../views/admin/AdminStatus.vue"),
  },
  {
    path: "/admin/disruptions",
    name: "admin-disruptions",
    component: () => import("../views/admin/disruptions/AdminDisruptions.vue"),
  },
  {
    path: "/admin/disruptions/process/:id",
    name: "admin-disruptions-process",
    component: () =>
      import("../views/admin/disruptions/AdminDisruptionsProcess.vue"),
  },
  {
    path: "/admin/disruptions/restore/:id",
    name: "admin-disruptions-restore",
    component: () =>
      import("../views/admin/disruptions/AdminDisruptionsRestore.vue"),
  },
  {
    path: "/admin/gtfs",
    name: "admin-gtfs",
    component: () => import("../views/admin/AdminGtfs.vue"),
  },
  {
    path: "/admin/auditing",
    name: "admin-auditing",
    component: () => import("../views/admin/AdminAuditing.vue"),
  },
  {
    path: "/admin/logs",
    name: "admin-logs",
    component: () => import("../views/admin/AdminLogs.vue"),
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("../views/admin/AdminUsers.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("../views/NotFound.vue"),
  },
];
