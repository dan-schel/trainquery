import "./assets/main.scss";

import App from "./App.vue";
import routes from "./router/routes";
import viteSSR from "vite-ssr/vue";
import { createHead } from "@vueuse/head";
import { initConfig, provideConfig } from "./utils/get-config";
import {
  finishedNavigating,
  provideNavigating,
  startedNavigating,
} from "./utils/navigating-provider";
import { provideBanners, setBanners } from "./utils/banners-provider";
import { Banner } from "shared/banner";
import { callApi } from "./utils/call-api";
import { configApi } from "shared/api/config-api";

export default viteSSR(
  App,
  {
    routes,
    routerOptions: {
      scrollBehavior: (_to, _from, savedPosition) =>
        savedPosition ?? { top: 0 },
    },
  },
  async ({ app, router, initialState, isClient, url }) => {
    const baseUrl = isClient ? "" : url.origin;

    console.log("MAIN.TS?");

    // Download app props during SSR. They will be already set if using the
    // prod server, so this is only really for dev mode.
    if (import.meta.env.SSR && initialState.app == null) {
      // Keep this as a fetch, don't use callApi(), because we don't need/want
      // the parsing from JSON logic. THe serialized JSON goes straight into the
      // HTML.
      const res = await fetch(`${baseUrl}/api/ssrAppProps`);
      initialState.app = await res.json();
    }

    console.log("2");

    const head = createHead();
    app.use(head);

    console.log("2-1");

    if (import.meta.env.SSR) {
      console.log("2-2");
      const response = await callApi(configApi, null, {
        baseUrl,
        resilient: false,
      });
      console.log("2-3");
      if (response.type === "success") {
        console.log("2-4");
        provideConfig(response.data);
      } else if (response.type === "error") {
        console.log("2-5");
        throw response.error;
      }
      console.log("2-6");
    } else {
      console.log("2-7");
      await initConfig(initialState.app.configHash);
    }

    console.log("3");

    provideNavigating(app);
    provideBanners(app);
    setBanners(
      initialState.app.banners.map((x: unknown) => Banner.json.parse(x)),
    );

    console.log("4");

    // Download route props when navigating pages (the first route's props are
    // downloaded with this code too, but on the server during SSR).
    router.beforeEach(async (to, from, next) => {
      console.log("BEFORE");
      // When applying a filter on the stop page, a full page reload is not
      // required, but I still want to change the URL, ok?
      if (to.name === "stop" && to.path === from.path) {
        console.log("BEFORE END");
        return next();
      }

      startedNavigating();

      // I get several of these calls when loading every page for some reason.
      if (to.name === "notfound") {
        console.log("BEFORE END");
        return next();
      }

      // Check if route props are already provided.
      if (
        to.meta.state != null &&
        typeof to.meta.state === "object" &&
        "route" in to.meta.state
      ) {
        console.log("BEFORE END");
        return next();
      }

      // Keep this as a fetch. See comment on the api/ssrAppProps fetch above.
      const res = await fetch(
        `${baseUrl}/api/ssrRouteProps?page=${String(
          to.name,
        )}&path=${encodeURIComponent(to.fullPath)}`,
      );

      to.meta.state = {
        ...(to.meta.state ?? {}),
        route: await res.json(),
      };
      console.log("BEFORE END");
      next();
    });

    console.log("5");

    router.afterEach(() => {
      console.log("AFTER");
      finishedNavigating();
      console.log("AFTER END");
    });

    console.log("END OF MAIN.TS?");

    return { head };
  },
);
