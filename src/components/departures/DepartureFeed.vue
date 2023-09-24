<script setup lang="ts">
import type { Departure } from "shared/system/timetable/departure";
import LoadingSpinner from "../common/LoadingSpinner.vue";
import OneLineP from "../common/OneLineP.vue";
import SimpleButton from "../common/SimpleButton.vue";
import DepartureVue from "./Departure.vue";
import { RouterLink } from "vue-router";
import { getConfig } from "@/utils/get-config";
import {
  getServicePageRoute,
  getStopPageRoute,
  requireStop,
} from "shared/system/config-utils";
import Icon from "../icons/Icon.vue";
import type { DepartureFeed } from "shared/system/timetable/departure-feed";
import type { QUtcDateTime } from "shared/qtime/qdatetime";
import { computed } from "vue";
import { formatFilter } from "@/utils/format-filter";

const props = defineProps<{
  feed: DepartureFeed;
  departures: Departure[];
  loading: boolean;
  error: "unknown" | null;
  allowPinning: boolean;
  statePerspective: boolean;
  isDefaultFeeds: boolean;
  now: QUtcDateTime;
}>();

const title = computed(() => {
  if (props.statePerspective) {
    return {
      text: requireStop(getConfig(), props.feed.stop).name,
      to: getStopPageRoute(getConfig(), props.feed.stop),
    };
  }
  if (props.isDefaultFeeds) {
    return {
      text: formatFilter(props.feed.filter, props.feed.stop),
      to: "",
    };
  }
  return {
    text: "Filtered trains",
    to: "",
  };
});
const subtitle = computed(() => {
  if (!props.statePerspective && props.isDefaultFeeds) {
    return null;
  }

  return {
    text: formatFilter(props.feed.filter, props.feed.stop),
    to: "",
  };
});
</script>

<template>
  <div
    class="feed"
    :style="{
      '--count': feed.count,
    }"
  >
    <div class="header-row">
      <OneLineP class="header">
        <RouterLink class="link title" :to="title.to">{{
          title.text
        }}</RouterLink>
        <span class="dot" v-if="subtitle != null">•</span>
        <RouterLink
          class="link subtitle"
          :to="subtitle.to"
          v-if="subtitle != null"
          >{{ subtitle.text }}</RouterLink
        >
      </OneLineP>
      <SimpleButton
        v-if="allowPinning"
        :content="{ icon: 'majesticons:pin-line', altText: 'Pin widget' }"
      ></SimpleButton>
    </div>
    <div class="departures">
      <div class="error" v-if="error != null">
        <Icon id="uil:exclamation-circle"></Icon>
        <p>Something went wrong</p>
      </div>
      <LoadingSpinner
        class="spinner"
        v-if="loading && error == null"
      ></LoadingSpinner>
      <template v-if="!loading && error == null">
        <DepartureVue
          v-for="departure in departures"
          :continuations-enabled="false"
          :key="getServicePageRoute(getConfig(), departure)"
          :departure="departure"
          :perspective="feed.stop"
          :now="now"
        ></DepartureVue>
      </template>
      <div
        class="empty"
        v-if="!loading && error == null && departures.length == 0"
      >
        <Icon id="uil:calendar-slash"></Icon>
        <p>No trains scheduled</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.header-row {
  @include template.row;
  height: 2rem;
}
.header {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
}
.title {
  --color-accent: var(--color-ink-100);
  font-weight: bold;
  font-size: 1rem;
}
.dot {
  margin: 0rem 0.25rem;
}
.subtitle {
  --color-accent: var(--color-ink-80);
  font-size: 1rem;
}
.departures {
  display: grid;
  grid-template-rows: repeat(var(--count), 5.8rem);

  @include utils.raised-surface;
  border-radius: 0.75rem;
}
.departure {
  // For the divider.
  position: relative;

  // The divider
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 1rem;
    right: 1rem;
    border-bottom: 1px solid var(--color-ink-20);
  }
}
.spinner,
.error,
.empty {
  align-self: center;
  justify-self: center;
  grid-row: 1 / span var(--count);
}
.error,
.empty {
  align-items: center;
  padding: 1rem;
  .icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  p {
    text-align: center;
  }
}
.error * {
  color: var(--color-error);
}
</style>
