<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/header/Header.vue";
import Footer from "./components/Footer.vue";
import { useHead } from "@vueuse/head";
import { getConfig } from "./utils/get-config";
import { Settings, settingsInjectionKey } from "./settings/settings";
import { provide, ref } from "vue";
import { readSettings, writeSettings } from "./settings/persist-settings";

if (import.meta.env.SSR) {
  provide(settingsInjectionKey, {
    settings: null,
    updateSettings: () => {
      throw new Error("Cannot update settings during SSR.");
    },
  });
} else {
  const settings = ref<Settings | null>(readSettings());
  provide(settingsInjectionKey, {
    settings: settings.value,
    updateSettings: (newSettings: Settings) => {
      settings.value = newSettings;
      writeSettings(newSettings);
    },
  });
}

useHead({
  titleTemplate: (title?: string) =>
    `${title ?? "Page"} | ${getConfig().frontend.appName}`,
  meta: [
    { name: "description", content: getConfig().frontend.metaDescription },
  ],
});
</script>

<template>
  <a href="#content" class="skip">
    <p>Skip to content</p>
  </a>
  <Header></Header>
  <div class="page" id="content">
    <RouterView />
  </div>
  <Footer></Footer>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.page {
  flex-grow: 1;
  margin-top: 3rem;
}
.skip {
  // Navbar is 9999 ;)
  z-index: 10000;

  position: fixed;
  left: 1rem;
  top: -4rem;
  transition: top 0.1s;

  @include template.button-filled;
  @include template.content-text;
  @include utils.shadow;
  padding: 0 1rem;
  width: fit-content;
  height: 2rem;
  margin-bottom: -2rem;
  justify-content: center;

  &:active,
  &:focus,
  &:hover {
    top: 0.5rem;
  }
}
</style>
