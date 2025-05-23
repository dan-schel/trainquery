<script setup lang="ts">
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
import type { DepartureFeed } from "shared/system/timetable/departure-feed";
import { computed } from "vue";
import { formatFilter } from "@/utils/format-filter";
import {
  togglePinnedWidget,
  isPinned,
  canPin,
} from "@/settings/pinned-widgets";
import { useSettings } from "@/settings/settings";
import type { QLocalDateTime } from "shared/qtime/qdatetime";
import type { DepartureWithDisruptions } from "shared/disruptions/departure-with-disruptions";
import UilExclamationCircle from "../icons/UilExclamationCircle.vue";
import UilCalendarSlash from "../icons/UilCalendarSlash.vue";

const props = defineProps<{
  feed: DepartureFeed;
  departures: DepartureWithDisruptions[];
  loading: boolean;
  error: "unknown" | null;
  allowPinning: boolean;
  statePerspective: boolean;
  isDefaultFeeds: boolean;
  time: QLocalDateTime | null;
  preserveTime: boolean;
  replaceOnNavigate: boolean;
}>();

const header = computed(() => {
  if (props.statePerspective) {
    return {
      title: {
        text: requireStop(getConfig(), props.feed.stop).name,
        to: getStopPageRoute(
          getConfig(),
          props.feed.stop,
          props.preserveTime ? props.time : null,
          null,
        ),
      },
      subtitle: {
        text: formatFilter(props.feed.filter, props.feed.stop),
        to: getStopPageRoute(
          getConfig(),
          props.feed.stop,
          props.preserveTime ? props.time : null,
          props.feed.filter,
        ),
      },
    };
  }
  if (props.isDefaultFeeds) {
    return {
      title: {
        text: formatFilter(props.feed.filter, props.feed.stop),
        to: getStopPageRoute(
          getConfig(),
          props.feed.stop,
          props.preserveTime ? props.time : null,
          props.feed.filter,
        ),
      },
      subtitle: null,
    };
  }
  return {
    title: {
      text: "Filtered trains",
      to: null,
    },
    subtitle: {
      text: formatFilter(props.feed.filter, props.feed.stop),
      to: null,
    },
  };
});

const { settings, updateSettings } = useSettings();
const pinned = computed(() =>
  settings.value == null
    ? false
    : isPinned(settings.value, props.feed.stop, props.feed.filter),
);
const pinnable = computed(() =>
  settings.value == null ? false : canPin(settings.value),
);
function handlePin() {
  if (settings.value != null) {
    updateSettings(
      togglePinnedWidget(settings.value, props.feed.stop, props.feed.filter),
    );
  }
}
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
        <RouterLink
          v-if="header.title.to != null"
          class="link-ghost title"
          :to="header.title.to"
          :replace="replaceOnNavigate"
          >{{ header.title.text }}</RouterLink
        >
        <span v-if="header.title.to == null" class="title">
          {{ header.title.text }}
        </span>

        <span class="dot" v-if="header.subtitle != null">&ensp;•&ensp;</span>

        <RouterLink
          v-if="header.subtitle != null && header.subtitle.to != null"
          class="link-ghost subtitle"
          :to="header.subtitle.to"
          :replace="replaceOnNavigate"
          >{{ header.subtitle.text }}</RouterLink
        >
        <span
          v-if="header.subtitle != null && header.subtitle.to == null"
          class="subtitle"
        >
          {{ header.subtitle.text }}
        </span>
      </OneLineP>
      <SimpleButton
        v-if="allowPinning"
        class="pin-button"
        :class="{ pinned: pinned }"
        :content="{
          icon: pinned ? 'majesticons:pin' : 'majesticons:pin-line',
          altText: pinned ? 'Unpin widget' : 'Pin widget',
        }"
        @click="handlePin"
        :disabled="!pinned && !pinnable"
      ></SimpleButton>
    </div>
    <div class="departures">
      <div class="error" v-if="error != null">
        <UilExclamationCircle></UilExclamationCircle>
        <p>Something went wrong</p>
      </div>

      <div
        class="empty"
        v-if="!loading && error == null && departures.length === 0"
      >
        <UilCalendarSlash></UilCalendarSlash>
        <p>No trains scheduled</p>
      </div>

      <template v-if="error == null">
        <DepartureVue
          :class="{ loading: loading }"
          v-for="departure in departures"
          :continuations-enabled="false"
          :key="getServicePageRoute(departure.departure)"
          :departure="departure"
          :perspective="feed.stop"
        ></DepartureVue>
      </template>

      <!-- May appear while departures are still shown underneath. -->
      <LoadingSpinner
        class="spinner"
        v-if="loading && error == null"
      ></LoadingSpinner>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.header-row {
  @include template.row;
  height: 2rem;
  gap: 0.5rem;
}
.header {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
}
.title {
  --color-accent: var(--color-text-strong);
  font-weight: bold;
  font-size: 1rem;

  // For when it's not a link.
  color: var(--color-text-strong);
}
.dot {
  @include template.no-select;
}
.subtitle {
  --color-accent: var(--color-text);
  font-size: 1rem;

  // For when it's not a link.
  color: var(--color-text);
}
.pin-button.pinned {
  :deep(svg) {
    color: var(--color-accent);
  }
}
.departures {
  display: grid;
  grid-template-rows: repeat(var(--count), 5.8rem);

  @include utils.raised-surface;
  border-radius: 0.75rem;

  // For the loading spinner (which can appear over departures).
  position: relative;
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
    border-bottom: 1px solid var(--color-soft-border);
  }
  &.loading {
    opacity: 50%;
    pointer-events: none;
  }
}
.spinner {
  position: absolute;
  left: calc(50% - 0.5em);
  top: calc(50% - 0.5em);
}
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
  svg {
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
