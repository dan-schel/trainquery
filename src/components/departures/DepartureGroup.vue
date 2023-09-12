<script setup lang="ts">
import { ref } from "vue";
import DepartureFeed from "./DepartureFeed.vue";
import { Departure } from "shared/system/timetable/departure";
import { repeat } from "@schel-d/js-utils";
import { toStopID, type StopID } from "shared/system/ids";

type DepartureFeedData = {
  index: number;
  departures: Departure[];
  perspective: StopID;
};

const props = defineProps<{
  allowPinning: boolean;

  // <TEMP>
  feedCount: number;
  // </TEMP>
}>();

// <TEMP>
const departureCount = 3;
// </TEMP>

const loading = ref(true);
const error = ref<"unknown" | null>(null);
const departureFeeds = ref<DepartureFeedData[]>(
  repeat(null, props.feedCount).map((_x, i) => ({
    index: i,
    departures: [],
    perspective: toStopID(212),
  }))
);

async function init() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/departures?count=${departureCount}`);
    const json = await response.json();
    const data = Departure.json.array().array().parse(json);
    departureFeeds.value = data.map((x, i) => ({
      index: i,
      departures: x,
      perspective: toStopID(212),
    }));
    loading.value = false;
  } catch (err) {
    console.warn(err);
    error.value = "unknown";
  }
}

if (!import.meta.env.SSR) {
  init();
}
</script>

<template>
  <div class="group">
    <DepartureFeed
      v-for="feed of departureFeeds"
      :key="feed.index"
      class="feed"
      :count="departureCount"
      :allow-pinning="allowPinning"
      :departures="feed.departures"
      :perspective="feed.perspective"
      :loading="loading"
      :error="error"
    ></DepartureFeed>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.group {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 1.5rem;
  column-gap: 1.5rem;
}
.feed {
  max-width: 40rem;
}
@media screen and (min-width: 48rem) {
  .group {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  }
}
</style>
