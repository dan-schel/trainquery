<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/header/Header.vue";
import Footer from "./components/Footer.vue";
import { useHead } from "@vueuse/head";
import { getConfig } from "./utils/get-config";
import { Settings, settingsInjectionKey } from "./settings/settings";
import { onMounted, provide, ref, onUnmounted, computed } from "vue";
import { readSettings, writeSettings } from "./settings/persist-settings";
import {
  nowUTCLuxon,
  toLocalDateTimeLuxon,
} from "shared/qtime/luxon-conversions";
import { nowInjectionKey } from "./utils/now-provider";
import LoadingSpinner from "./components/common/LoadingSpinner.vue";
import { useNavigating } from "./utils/navigating-provider";
// import { parseInlineMarkdown } from "./utils/parse-markdown";

const navigating = useNavigating();

// TODO: Extract to its own component.
const bannerHtml = computed(() => {
  return null;

  // // TODO: This shouldn't be hardcoded!
  // return parseInlineMarkdown(
  //   "**Warning:** TrainQuery is currently having issues accessing the PTV API. Visit [ptv.vic.gov.au](https://www.ptv.vic.gov.au/) to check if your train line is impacted by a disruption.",
  // );
});

const settings = ref<Settings | null>(null);
const nowUtc = ref(nowUTCLuxon().startOfMinute());
const nowLocal = ref(toLocalDateTimeLuxon(getConfig(), nowUtc.value));

// setInterval thinks its a NodeJS.Timer, but vue-tsc thinks it shouldn't be...
let timeout: NodeJS.Timeout;

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
});

useHead({
  title: "🚨 [TODO] Set document head correctly 🚨",
});
</script>

<template>
  <a href="#content" class="skip">
    <p>Skip to content</p>
  </a>
  <Header></Header>

  <!-- TODO: Extract to its own component. -->
  <div class="banner" v-if="bannerHtml != null">
    <div class="banner-content">
      <p v-html="bannerHtml"></p>
    </div>
  </div>

  <div
    class="page"
    id="content"
    :class="{ navigating: navigating, 'no-banner': bannerHtml == null }"
  >
    <RouterView />
  </div>
  <Footer :class="{ navigating: navigating }"></Footer>
  <LoadingSpinner class="spinner" v-if="navigating"></LoadingSpinner>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

// TODO: Extract to its own component.
.banner {
  @include template.page-centerer;
  @include utils.shadow;
  background-color: var(--color-banner-bg);
  padding-top: 3rem;
  .banner-content {
    padding: 0.5rem 1rem;
    p {
      color: var(--color-banner-text);
      :deep(a) {
        font-weight: bold;
        --color-accent: var(--color-banner-text);
      }
    }
  }
}

.page {
  flex-grow: 1;
  &.no-banner {
    margin-top: 3rem;
  }
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
.navigating {
  opacity: 50%;
  pointer-events: none;
}
.spinner {
  position: fixed;
  top: calc(50% - 1rem);
  left: calc(50% - 1rem);
}
</style>
