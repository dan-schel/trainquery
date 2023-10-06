<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import {
  getStopPageRoute,
  linesThatStopAt,
  requireStopFromUrlName,
} from "shared/system/config-utils";
import { computed, ref, watch } from "vue";
import { getConfig } from "@/utils/get-config";
import DepartureGroup from "@/components/departures/DepartureGroup.vue";
import DepartureControls from "@/components/departures/DepartureControls.vue";
import PageContent from "@/components/common/PageContent.vue";
import LineList from "@/components/LineList.vue";
import { DepartureFeed } from "shared/system/timetable/departure-feed";
import { DepartureFilter } from "shared/system/timetable/departure-filter";

const route = useRoute();
const params = ref(route.params);
watch(route, () => {
  // For some reason, this is called even when navigating away from the page!
  if (route.name == "stop") {
    params.value = route.params;
  }
});

const stop = computed(() =>
  requireStopFromUrlName(getConfig(), params.value.id as string)
);

const lines = computed(() =>
  linesThatStopAt(getConfig(), stop.value.id, {
    ignoreSpecialEventsOnlyLines: true,
  }).map((l) => l.id)
);

const filter = ref(DepartureFilter.default);
watch([stop], () => {
  filter.value = DepartureFilter.default;
});

const isDefaultFilter = computed(() =>
  filter.value.equals(DepartureFilter.default, {
    ignoreArrivals: true,
    ignoreSetDownOnly: true,
  })
);

const feeds = computed(() => {
  if (isDefaultFilter.value) {
    // Use the default feeds for this stop
    return getConfig().frontend.departureFeeds.getFeeds(stop.value.id, {
      arrivals: filter.value.arrivals,
      setDownOnly: filter.value.setDownOnly,
    });
  }
  return [new DepartureFeed(stop.value.id, 10, filter.value)];
});

const head = computed(() => ({
  title: stop.value.name,
  link: [
    {
      rel: "canonical",
      href:
        "https://trainquery.com" + getStopPageRoute(getConfig(), stop.value.id),
    },
  ],
}));
useHead(head);
</script>

<template>
  <PageContent :title="`${stop.name}`" title-margin="0.5rem">
    <LineList :lines="lines"></LineList>
    <DepartureControls
      class="controls"
      :stop="stop.id"
      v-model:filter="filter"
      :is-default-filter="isDefaultFilter"
    ></DepartureControls>
    <DepartureGroup
      class="group"
      :feeds="feeds"
      :allow-pinning="true"
      :state-perspective="false"
      :is-default-feeds="isDefaultFilter"
      :center-single="false"
    ></DepartureGroup>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.lines {
  margin-bottom: 1rem;
}
.controls {
  margin-bottom: 1.5rem;
}
.group {
  margin-bottom: 2rem;
}
</style>
