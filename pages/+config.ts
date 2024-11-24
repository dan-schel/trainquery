import vikeVue from "vike-vue/config";
import type { Config } from "vike/types";
import LayoutDefault from "../layouts/LayoutDefault.vue";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout: LayoutDefault,

  // https://vike.dev/head-tags
  title: "My Vike App",
  description: "Demo showcasing Vike",

  extends: vikeVue as typeof vikeVue,
} satisfies Config;
