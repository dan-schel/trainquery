<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import DepartureFeedVue from "./DepartureFeed.vue";
import { Departure } from "shared/system/service/departure";
import { repeat } from "@schel-d/js-utils";
import { DepartureFeed } from "shared/system/timetable/departure-feed";
import { callAPI } from "@/utils/call-api";
import { useNow } from "@/utils/now-provider";
import type { QLocalDateTime } from "shared/qtime/qdatetime";

const props = defineProps<{
  feeds: DepartureFeed[];
  time: QLocalDateTime | null;
  allowPinning: boolean;
  statePerspective: boolean;
  isDefaultFeeds: boolean;
  centerSingle: boolean;
}>();

const loading = ref(true);
const error = ref<"unknown" | null>(null);
const departureLists = ref<Departure[][]>(
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
    try {
      departureLists.value = await callAPI(
        "departures",
        {
          feeds: DepartureFeed.encode(props.feeds),
          time: (props.time?.toUTC() ?? utc.value).toISO(),
        },
        Departure.json.array().array(),
      );
    } catch (err) {
      console.warn(err);
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
      :key="feed.toString()"
      :feed="feed"
      :departures="departureLists[i]"
      :loading="loading"
      :error="error"
      :allow-pinning="allowPinning"
      :state-perspective="statePerspective"
      :is-default-feeds="isDefaultFeeds"
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
