import "./assets/main.scss";

import App from "./App.vue";
import routes from "./router/routes";
import viteSSR from "vite-ssr/vue";
import { createHead } from "@vueuse/head";
import { getConfig, initConfig, provideConfig } from "./utils/get-config";
import {
  getLineFromUrlName,
  getStopFromUrlName,
} from "shared/system/config-utils";
import { FrontendConfig } from "shared/system/config/frontend-config";
import {
  finishedNavigating,
  provideNavigating,
  startedNavigating,
} from "./utils/navigating-provider";

export default viteSSR(
  App,
  {
    routes,
    routerOptions: {
      scrollBehavior: (_to, _from, _savedPosition) => ({ top: 0 }),
    },
  },
  async ({ app, router, initialState, isClient, url }) => {
    const baseUrl = isClient ? "" : url.origin;

    // Download app props during SSR. They will be already set if using the
    // prod server, so this is only really for dev mode.
    if (import.meta.env.SSR && initialState.app == null) {
      const res = await fetch(`${baseUrl}/api/ssrAppProps`);
      initialState.app = await res.json();
    }

    const head = createHead();
    app.use(head);

    provideNavigating(app);

    // Download route props when navigating pages (the first route's props are
    // downloaded with this code too, but on the server during SSR).
    router.beforeEach(async (to, _from, next) => {
      startedNavigating();

      // I get several of these calls when loading every page for some reason.
      if (to.name == "notfound") {
        return next();
      }

      // Check if route props are already provided.
      if (
        to.meta.state != null &&
        typeof to.meta.state == "object" &&
        "route" in to.meta.state
      ) {
        return next();
      }

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

    router.beforeEach(async (to, _from, next) => {
      if (
        to.name == "line" &&
        getLineFromUrlName(getConfig(), to.params.id as string) == null
      ) {
        await router.replace("/error/notfound");
      }
      if (
        to.name == "stop" &&
        getStopFromUrlName(getConfig(), to.params.id as string) == null
      ) {
        await router.replace("/error/notfound");
      }

      return next();
    });

    router.afterEach(() => {
      finishedNavigating();
    });

    if (import.meta.env.SSR) {
      const res = await fetch(`${baseUrl}/api/config`);
      const json = await res.json();
      provideConfig(FrontendConfig.json.parse(json));
    } else {
      await initConfig(initialState.app.configHash);
    }

    return { head };
  },
);
