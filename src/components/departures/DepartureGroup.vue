<script setup lang="ts">
import { ref } from "vue";
import DepartureFeedVue from "./DepartureFeed.vue";
import { Departure } from "shared/system/timetable/departure";
import { repeat } from "@schel-d/js-utils";
import { DepartureFeed } from "shared/system/timetable/departure-feed";
import { nowUTCLuxon } from "shared/qtime/luxon-conversions";
import { callAPI } from "@/utils/call-api";

const props = defineProps<{
  feeds: DepartureFeed[];
  allowPinning: boolean;
  statePerspective: boolean;
}>();

const loading = ref(true);
const error = ref<"unknown" | null>(null);
const departureLists = ref<Departure[][]>(
  repeat(null, props.feeds.length).map((_x) => [])
);

const now = nowUTCLuxon().startOfMinute();

async function init() {
  loading.value = true;
  error.value = null;

  try {
    departureLists.value = await callAPI(
      "departures",
      { feeds: DepartureFeed.encode(props.feeds), time: now.toISO() },
      Departure.json.array().array()
    );
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
      :now="now"
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
