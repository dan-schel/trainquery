import "./assets/main.scss";

// import { createApp } from "vue";
// import { createPinia } from "pinia";

import App from "./App.vue";
import routes from "./router/routes";
import viteSSR from 'vite-ssr/vue';

export default viteSSR(App, { routes }, (context) => {
});

// const app = createApp(App);

// app.use(createPinia());
// app.use(router);

// app.mount("#app");
