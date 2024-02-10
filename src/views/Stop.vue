<script setup lang="ts">
import { useHead, type UseHeadInput } from "@vueuse/head";
import { useRoute, useRouter } from "vue-router";
import {
  getStopPageRoute,
  linesThatStopAt,
  getStopFromUrlName,
} from "shared/system/config-utils";
import { computed, ref, watch } from "vue";
import { getConfig } from "@/utils/get-config";
import DepartureGroup from "@/components/departures/DepartureGroup.vue";
import DepartureControls from "@/components/departures/DepartureControls.vue";
import PageContent from "@/components/common/PageContent.vue";
import LineList from "@/components/LineList.vue";
import { DepartureFeed } from "shared/system/timetable/departure-feed";
import { DepartureFilter } from "shared/system/timetable/departure-filter";
import { QLocalDateTime } from "shared/qtime/qdatetime";
import { requiredParam, unparam } from "@/utils/param-utils";
import { isValidFilter } from "@/components/departures/helpers/available-filters";
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import { nullableEquals, itsOk } from "@dan-schel/js-utils";
import { generatePageHead, generatePageHeadNotFound } from "@/utils/head";
import { useSettings } from "@/settings/settings";

const router = useRouter();
const route = useRoute();

function parseParams() {
  const stop = getStopFromUrlName(getConfig(), requiredParam(route.params.id));

  if (stop == null) {
    return {
      stop: null,
      filter: DepartureFilter.default,
      time: null,
    };
  }

  let filter = DepartureFilter.default;
  const filterString = unparam(route.query.filter);
  if (filterString != null) {
    const parsed = DepartureFilter.parse(filterString);
    if (parsed != null && isValidFilter(parsed, stop.id)) {
      filter = parsed;
    }
  }

  let time: QLocalDateTime | null = null;
  const timeString = unparam(route.query.time);
  if (timeString != null) {
    const parsed = QLocalDateTime.parse(timeString);
    if (parsed != null) {
      time = parsed;
    }
  }

  return {
    stop: stop,
    filter: filter,
    time: time,
  };
}

const parsed = parseParams();
const stop = ref(parsed.stop);
const filter = ref(parsed.filter);
const time = ref(parsed.time);

watch(route, () => {
  // For some reason, this is called even when navigating away from the page!
  if (route.name === "stop") {
    const parsed = parseParams();
    if (parsed.stop !== stop.value) {
      stop.value = parsed.stop;
    }
    if (!parsed.filter.equals(filter.value)) {
      filter.value = parsed.filter;
    }
    if (!nullableEquals(parsed.time, time.value, (a, b) => a.equals(b))) {
      time.value = parsed.time;
    }
  }
});

watch([stop], () => {
  filter.value = DepartureFilter.default;
  time.value = null;
});
watch([filter, time], () => {
  router.replace(
    getStopPageRoute(
      getConfig(),
      itsOk(stop.value).id,
      time.value,
      filter.value,
    ),
  );
});

const isDefaultFilter = computed(() =>
  filter.value.isDefault({
    ignoreArrivals: true,
    ignoreSetDownOnly: true,
  }),
);

const feeds = computed(() => {
  if (stop.value == null) {
    return [];
  }

  if (isDefaultFilter.value) {
    // Use the default feeds for this stop
    return getConfig().frontend.departureFeeds.getFeeds(stop.value.id, {
      arrivals: filter.value.arrivals,
      setDownOnly: filter.value.setDownOnly,
    });
  }
  return [new DepartureFeed(stop.value.id, 10, filter.value)];
});

const lines = computed(() => {
  if (stop.value == null) {
    return [];
  }

  return linesThatStopAt(getConfig(), stop.value.id, {
    ignoreSpecialEventsOnlyLines: true,
  }).map((l) => l.id);
});

const { settings } = useSettings();
const developerMode = computed(() => settings.value?.developerMode ?? false);

const head = computed(() => {
  if (stop.value == null) {
    return generatePageHeadNotFound("Stop not found");
  }
  return generatePageHead({
    title: stop.value.name,
    allowIndexing: filter.value.isDefault() && time.value == null,
    canonicalUrl: getStopPageRoute(getConfig(), stop.value.id, null, null),
  });
});
useHead(head as UseHeadInput<{}>);
</script>

<template>
  <PageContent
    :title="`${stop.name}`"
    title-margin="0.5rem"
    v-if="stop != null"
    v-bind="$attrs"
  >
    <template v-slot:title-inline v-if="developerMode">
      <p class="stop-id">
        <code>#{{ stop.id }}</code>
      </p>
    </template>

    <LineList :lines="lines"></LineList>
    <DepartureControls
      class="controls"
      :stop="stop.id"
      v-model:filter="filter"
      v-model:time="time"
      :is-default-filter="isDefaultFilter"
    ></DepartureControls>
    <DepartureGroup
      class="group"
      :feeds="feeds"
      :time="time"
      :allow-pinning="true"
      :state-perspective="false"
      :is-default-feeds="isDefaultFilter"
      :center-single="false"
      :preserve-time="true"
      :replace-on-navigate="true"
    ></DepartureGroup>
  </PageContent>

  <NotFoundLayout
    title="Stop not found"
    message="This stop doesn't exist, at least not anymore!"
    v-if="stop == null"
    v-bind="$attrs"
  ></NotFoundLayout>
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
.stop-id {
  margin-left: 0.5rem;
}
</style>
