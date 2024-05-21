<script setup lang="ts">
import DepartureGroup from "@/components/departures/DepartureGroup.vue";
import Icon from "@/components/icons/Icon.vue";
import { useHead } from "@vueuse/head";
import BigSearch from "@/components/BigSearch.vue";
import Wordmark from "@/components/Wordmark.vue";
import { getConfig } from "@/utils/get-config";
import { computed, onMounted, ref, watch } from "vue";
import { DepartureFeed } from "shared/system/timetable/departure-feed";
import { Settings, useSettings } from "@/settings/settings";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import { generatePageHead } from "@/utils/head";
import { parseMarkdown } from "@/utils/parse-markdown";
import SimpleButton from "@/components/common/SimpleButton.vue";
import {
  getNearbyStops,
  type NearbyStopData,
  formatDistance,
  maxDistance,
} from "@/utils/nearby-stops";
import { RouterLink } from "vue-router";

useHead(
  generatePageHead({
    title: "Home",
    allowIndexing: true,
    canonicalUrl: "/",
  }),
);

const { settings, updateSettings } = useSettings();

const pinnedWidgets = computed(() =>
  settings.value == null
    ? null
    : settings.value.pinnedWidgets.map(
        (w) => new DepartureFeed(w.stop, 3, w.filter),
      ),
);

const welcomeHtml = computed(() =>
  parseMarkdown(getConfig().frontend.welcomeMarkdown),
);

// Attempt to fetch the user's location when the page loads, the settings load,
// or the user clicks the "Enable location access" button, whichever happens
// first.
type LocationData = "not-ready" | "loading" | "disabled" | NearbyStopData[];
const nearbyStopsState = ref<LocationData>("not-ready");

watch(settings, () => {
  initLocation();
});
onMounted(() => {
  initLocation();
});
function handleEnableLocationAccess() {
  if (settings.value != null) {
    attemptToFetchLocation(settings.value);
  }
}

function initLocation() {
  if (nearbyStopsState.value !== "not-ready" || settings.value == null) {
    return;
  }

  if (!settings.value.enableNearbyStops) {
    nearbyStopsState.value = "disabled";
    return;
  }

  attemptToFetchLocation(settings.value);
}

function attemptToFetchLocation(settings: Settings) {
  nearbyStopsState.value = "loading";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      nearbyStopsState.value = getNearbyStops(
        position.coords.latitude,
        position.coords.longitude,
      );
      if (!settings.enableNearbyStops) {
        updateSettings(settings.with({ enableNearbyStops: true }));
      }
    },
    () => {
      console.warn("Location access appears to be denied.");
      nearbyStopsState.value = "disabled";
      if (settings.enableNearbyStops) {
        updateSettings(settings.with({ enableNearbyStops: false }));
      }
    },
    {
      maximumAge: 1000 * 30, // 30 seconds
    },
  );
}
</script>

<template>
  <main>
    <div>
      <div class="spacer"></div>
      <div class="hero">
        <Wordmark class="wordmark"></Wordmark>
        <p class="tagline">{{ getConfig().frontend.tagline }}</p>
        <BigSearch class="big-search"></BigSearch>
      </div>
      <div class="spacer"></div>
      <div class="sections">
        <div
          class="welcome"
          v-if="pinnedWidgets != null && pinnedWidgets.length == 0"
        >
          <div class="section-title">
            <Icon id="uil:star"></Icon>
            <p>Welcome to {{ getConfig().frontend.appName }}!</p>
          </div>
          <div class="markdown" v-html="welcomeHtml"></div>
          <p>
            <RouterLink :to="{ name: 'about' }" class="link"
              >About {{ getConfig().frontend.appName }}</RouterLink
            >
          </p>
        </div>
        <div class="nearby-stops">
          <div class="section-title">
            <Icon id="uil:map-marker"></Icon>
            <p>Nearby stops</p>
          </div>
          <LoadingSpinner
            v-if="
              nearbyStopsState === 'loading' || nearbyStopsState === 'not-ready'
            "
          ></LoadingSpinner>
          <template v-else-if="nearbyStopsState === 'disabled'">
            <p>
              Enable location access to show a list of nearby stops here. Your
              location will never be sent to any server as a result of enabling
              this feature, the calculations will be done on your device.
            </p>
            <SimpleButton
              class="reset-button"
              :content="{ text: 'Enable location access' }"
              layout="traditional-wide"
              theme="filled"
              @click="handleEnableLocationAccess"
            ></SimpleButton>
          </template>
          <div class="stops" v-else>
            <div
              class="stop"
              v-for="stop in nearbyStopsState"
              :key="stop.stop.id"
            >
              <RouterLink :to="stop.url">
                <Icon id="uil:map-marker"></Icon>
                <p>
                  <span class="stop-name">{{ stop.stop.name }}</span>
                  {{ formatDistance(stop.distance) }}
                </p>
              </RouterLink>
            </div>
            <p v-if="nearbyStopsState.length === 0">
              There don't appear to be any stops within
              {{ formatDistance(maxDistance) }} of you.
            </p>
          </div>
        </div>
        <div class="pinned-widgets">
          <div class="section-title">
            <Icon id="majesticons:pin-line"></Icon>
            <p>Pinned widgets</p>
          </div>
          <DepartureGroup
            v-if="pinnedWidgets != null && pinnedWidgets.length > 0"
            :feeds="pinnedWidgets"
            :time="null"
            :allow-pinning="false"
            :state-perspective="true"
            :is-default-feeds="false"
            :center-single="true"
            :preserve-time="false"
            :replace-on-navigate="false"
          ></DepartureGroup>
          <LoadingSpinner
            v-if="pinnedWidgets == null"
            class="loading"
          ></LoadingSpinner>
          <p
            class="empty"
            v-if="pinnedWidgets != null && pinnedWidgets.length === 0"
          >
            Click the pin button above a widget on a stop's page to show it
            here.
          </p>
        </div>
      </div>
      <div class="spacer small"></div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
main {
  @include template.page-centerer;
  flex-grow: 1;
  > * {
    flex-grow: 1;
  }
}
.hero {
  align-items: center;
  padding: 0rem 1rem;
}
.wordmark {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.tagline {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
}
.big-search {
  width: 100%;
  max-width: 36rem;
}
.sections {
  gap: 4rem;
}

.welcome {
  padding: 0rem 1rem;

  > p,
  .markdown :deep(p) {
    align-self: center;
    text-align: center;
    max-width: 80ch;
  }
  .markdown :deep(p) {
    margin-bottom: 1.5rem;
  }
}
.pinned-widgets {
  padding: 0rem 1rem;

  .loading {
    align-self: center;
  }
  .empty {
    align-self: center;
    text-align: center;
    max-width: 80ch;
    margin-bottom: 1.5rem;
  }
}
.nearby-stops {
  padding: 0rem 1rem;
  align-items: center;

  > p {
    align-self: center;
    text-align: center;
    max-width: 80ch;
    margin-bottom: 1.5rem;
  }
  .stops {
    @include template.row;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;

    .stop {
      @include utils.raised-surface;
      border-radius: 0.75rem;
      a {
        @include template.button-hover;
        @include template.content-text;
        @include template.row;
        height: 2rem;
        padding: 0 1rem;
        gap: 0.5rem;
        --button-rounding: 0;
      }
      .stop-name {
        font-weight: bold;
        color: var(--color-ink-100);
      }
    }
  }
}

.section-title {
  @include template.row;
  gap: 0.5rem;
  align-self: center;
  margin-bottom: 1rem;
  p {
    font-weight: bold;
    color: var(--color-ink-100);
    font-size: 1rem;
  }
  .icon {
    font-size: 1.2rem;
  }
}
.spacer {
  min-height: 5rem;
  flex-grow: 1;

  &.small {
    // For some reason setting this makes it start flex growing all the spacers
    // when it reaches a height of 5rem, which is exactly what I want, but I
    // have no idea why it works. Perhaps because "flex-grow: 1" wants to keep
    // all the spacers the same height, so it doesn't start growing until this
    // one is 5rem tall?
    min-height: 2rem;
  }
}
</style>
