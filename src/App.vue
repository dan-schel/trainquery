<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/header/Header.vue";
import Footer from "./components/Footer.vue";
import { useHead } from "@vueuse/head";
import { getConfig } from "./utils/get-config";
import { Settings, settingsInjectionKey } from "./settings/settings";
import { onMounted, provide, ref, onUnmounted } from "vue";
import { readSettings, writeSettings } from "./settings/persist-settings";
import {
  nowUTCLuxon,
  toLocalDateTimeLuxon,
} from "shared/qtime/luxon-conversions";
import { nowInjectionKey } from "./utils/now-provider";

const settings = ref<Settings | null>(null);
const nowUtc = ref(nowUTCLuxon().startOfMinute());
const nowLocal = ref(toLocalDateTimeLuxon(getConfig(), nowUtc.value));

let timeout: NodeJS.Timer;

function updateSettings(newSettings: Settings) {
  if (settings.value == null) {
    throw new Error("Cannot update settings during SSR.");
  }
  settings.value = newSettings;
  writeSettings(newSettings);
}

provide(settingsInjectionKey, {
  settings: settings,
  updateSettings: updateSettings,
});
provide(nowInjectionKey, {
  local: nowLocal,
  utc: nowUtc,
});

onMounted(() => {
  settings.value = readSettings().validateAgainstConfig((s) => console.warn(s));
  timeout = setInterval(() => {
    const utc = nowUTCLuxon().startOfMinute();
    if (!utc.equals(nowUtc.value)) {
      nowUtc.value = utc;
      nowLocal.value = toLocalDateTimeLuxon(getConfig(), utc);
    }
  }, 1000);
});
onUnmounted(() => {
  clearInterval(timeout);
  console.log(timeout);
});

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
