<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import DepartureFeedVue from "./DepartureFeed.vue";
import { repeat } from "@dan-schel/js-utils";
import { DepartureFeed } from "shared/system/timetable/departure-feed";
import { useNow } from "@/utils/now-provider";
import type { QLocalDateTime } from "shared/qtime/qdatetime";
import { DepartureWithDisruptions } from "shared/disruptions/departure-with-disruptions";
import { callApi } from "@/utils/call-api-new";
import { departuresApi } from "shared/api/departures-api";

const props = defineProps<{
  feeds: DepartureFeed[];
  time: QLocalDateTime | null;
  allowPinning: boolean;
  statePerspective: boolean;
  isDefaultFeeds: boolean;
  centerSingle: boolean;
  preserveTime: boolean;
  replaceOnNavigate: boolean;
}>();

const loading = ref(true);
const error = ref<"unknown" | null>(null);
const departureLists = ref<DepartureWithDisruptions[][]>(
  repeat(null, props.feeds.length).map((_x) => []),
);

const { utc } = useNow();

async function init(reset: boolean) {
  loading.value = true;
  error.value = null;

  if (reset) {
    departureLists.value = repeat(null, props.feeds.length).map((_x) => []);
  }

  if (props.feeds.length > 0) {
    const response = await callApi(departuresApi, {
      feeds: props.feeds,
      time: props.time?.toUTC() ?? utc.value,
    });

    if (response.type === "success") {
      departureLists.value = response.data;
    } else if (response.type === "error") {
      console.warn(response.error);
      error.value = "unknown";
      departureLists.value = repeat(null, props.feeds.length).map((_x) => []);
    }
  }

  loading.value = false;
}

onMounted(() => {
  init(true);
});
watch(
  () => ({ feeds: props.feeds, time: props.time }),
  () => {
    init(true);
  },
);
watch(utc, () => {
  if (props.time == null) {
    init(false);
  }
});
</script>

<template>
  <div class="group" :class="{ center: centerSingle }">
    <DepartureFeedVue
      v-for="(feed, i) of feeds"
      class="feed"
      :key="feed.asString()"
      :feed="feed"
      :departures="departureLists[i]"
      :loading="loading"
      :error="error"
      :allow-pinning="allowPinning"
      :state-perspective="statePerspective"
      :is-default-feeds="isDefaultFeeds"
      :time="time"
      :preserve-time="preserveTime"
      :replace-on-navigate="replaceOnNavigate"
    ></DepartureFeedVue>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.group {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 1.5rem;
  column-gap: 1.5rem;

  &.center .feed {
    margin: auto;
    width: 100%;
  }
}
.feed {
  max-width: 36rem;
  min-width: 0;
}
@media screen and (min-width: 48rem) {
  .group {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  }
}
</style>
