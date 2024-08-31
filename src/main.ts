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
import { callApi } from "./utils/call-api-new";
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

    // Download app props during SSR. They will be already set if using the
    // prod server, so this is only really for dev mode.
    if (import.meta.env.SSR && initialState.app == null) {
      // Keep this as a fetch, don't use callApi(), because we don't need/want
      // the parsing from JSON logic. THe serialized JSON goes straight into the
      // HTML.
      const res = await fetch(`${baseUrl}/api/ssrAppProps`);
      initialState.app = await res.json();
    }

    const head = createHead();
    app.use(head);

    if (import.meta.env.SSR) {
      const response = await callApi(configApi, null, {
        baseUrl,
        resilient: false,
      });
      if (response.type === "success") {
        provideConfig(response.data);
      } else if (response.type === "error") {
        throw response.error;
      }
    } else {
      await initConfig(initialState.app.configHash);
    }

    provideNavigating(app);
    provideBanners(app);
    setBanners(
      initialState.app.banners.map((x: unknown) => Banner.json.parse(x)),
    );

    // Download route props when navigating pages (the first route's props are
    // downloaded with this code too, but on the server during SSR).
    router.beforeEach(async (to, from, next) => {
      // When applying a filter on the stop page, a full page reload is not
      // required, but I still want to change the URL, ok?
      if (to.name === "stop" && to.path === from.path) {
        return next();
      }

      startedNavigating();

      // I get several of these calls when loading every page for some reason.
      if (to.name === "notfound") {
        return next();
      }

      // Check if route props are already provided.
      if (
        to.meta.state != null &&
        typeof to.meta.state === "object" &&
        "route" in to.meta.state
      ) {
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
      next();
    });

    router.afterEach(() => {
      finishedNavigating();
    });

    return { head };
  },
);
