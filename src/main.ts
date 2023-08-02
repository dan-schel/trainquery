import "./assets/main.scss";

// import { createApp } from "vue";
// import { createPinia } from "pinia";

import App from "./App.vue";
import routes from "./router/routes";
import viteSSR from "vite-ssr/vue";
import { createHead } from "@vueuse/head";

export default viteSSR(
  App,
  { routes },
  async ({ app, router, initialState, isClient, url }) => {
    const baseUrl = isClient ? "" : url.origin;

    if (initialState.props == null) {
      const res = await fetch(`${baseUrl}/api/ssrAppProps`);
      initialState.props = await res.json();
    }

    const head = createHead();
    app.use(head);

    router.beforeEach(async (to, _from, next) => {
      // Check if route props are already provided.
      if (!!to.meta.state && Object.keys(to.meta.state).length > 0) {
        return next();
      }

      const res = await fetch(
        `${baseUrl}/api/ssrRouteProps?page=${String(to.name)}`
      );
      to.meta.state = await res.json();
      next();
    });

    return { head };
  }
);

// const app = createApp(App);

// app.use(createPinia());
// app.use(router);

// app.mount("#app");
