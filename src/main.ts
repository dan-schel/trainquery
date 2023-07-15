import "./assets/main.scss";

// import { createApp } from "vue";
// import { createPinia } from "pinia";

import App from "./App.vue";
import routes from "./router/routes";
import viteSSR from "vite-ssr/vue";
import { createHead } from "@vueuse/head";

export default viteSSR(App, { routes }, ({ app }) => {
  const head = createHead();
  app.use(head);

  return { head };
});

// const app = createApp(App);

// app.use(createPinia());
// app.use(router);

// app.mount("#app");
