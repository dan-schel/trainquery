import "./assets/main.scss";

import App from "./App.vue";
import routes from "./router/routes";
import viteSSR from "vite-ssr/vue";
import { createHead } from "@vueuse/head";
import { initConfig, provideConfig } from "./utils/cached-config";
import { FrontendConfig } from "../shared/system/config";
import { getLineFromUrlName, getStopFromUrlName } from "./utils/config-utils";

export default viteSSR(
  App,
  { routes },
  async ({ app, router, initialState, isClient, url }) => {
    const baseUrl = isClient ? "" : url.origin;

    // Download app props during SSR. They will be already set if using the
    // prod server, so this is only really for dev mode.
    if (import.meta.env.SSR && initialState.props == null) {
      const res = await fetch(`${baseUrl}/api/ssrAppProps`);
      initialState.props = await res.json();
    }

    const head = createHead();
    app.use(head);

    // Download route props when navigating pages (the first route's props are
    // downloaded with this code too, but on the server during SSR).
    router.beforeEach(async (to, _from, next) => {
      // Check if route props are already provided.
      if (to.meta.state != null) {
        return next();
      }

      const res = await fetch(
        `${baseUrl}/api/ssrRouteProps?page=${String(to.name)}`
      );
      to.meta.state = await res.json();
      next();
    });

    router.beforeEach(async (to, _from, next) => {
      if (
        to.name == "line" &&
        getLineFromUrlName(to.params.id as string) == null
      ) {
        await router.replace("/error/notfound");
      }
      if (
        to.name == "stop" &&
        getStopFromUrlName(to.params.id as string) == null
      ) {
        await router.replace("/error/notfound");
      }

      return next();
    });

    if (import.meta.env.SSR) {
      const res = await fetch(`${baseUrl}/api/config`);
      const json = await res.json();
      provideConfig(FrontendConfig.json.parse(json));
    } else {
      await initConfig(initialState.props.configHash);
    }

    return { head };
  }
);
