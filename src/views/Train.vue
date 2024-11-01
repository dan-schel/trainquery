<script setup lang="ts">
import { useHead, type UseHeadInput } from "@vueuse/head";
import { RouterLink, useRoute } from "vue-router";
import { computed } from "vue";
import PageContent from "@/components/common/PageContent.vue";
import { z } from "zod";
import LineList from "@/components/LineList.vue";
import { getDiagramForService } from "@/components/line-diagram/get-diagram-for-service";
import LineDiagram from "@/components/line-diagram/LineDiagram.vue";
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import { getConfig } from "@/utils/get-config";
import { formatRelativeTime, formatTime } from "shared/qtime/format";
import { getServicePageRoute, requireStop } from "shared/system/config-utils";
import TrainPageStop from "@/components/line-diagram/TrainPageStop.vue";
import { useNow } from "@/utils/now-provider";
import Disruptions from "@/components/disruptions/Disruptions.vue";
import { generatePageHead, generatePageHeadNotFound } from "@/utils/head";
import { useSettings } from "@/settings/settings";
import LiveStatus from "@/components/train/LiveStatus.vue";
import { DepartureWithDisruptions } from "shared/disruptions/departure-with-disruptions";

const { local } = useNow();

const route = useRoute();

const data = computed(() => {
  const metaSchema = z.object({
    state: z.object({
      route: z.object({
        departure: DepartureWithDisruptions.json.optional(),
      }),
    }),
  });
  const meta = metaSchema.parse(route.meta);
  const departureWithDisruptions = meta.state.route.departure;

  if (departureWithDisruptions != null) {
    const train = departureWithDisruptions.departure;

    const departureTime = toLocalDateTimeLuxon(
      getConfig(),
      train.perspective.scheduledTime,
    );
    const timeString = formatTime(departureTime.time);
    const relativeTimeString = formatRelativeTime(departureTime, local.value);

    const perspectiveName = requireStop(
      getConfig(),
      train.perspective.stop,
    ).name;
    const terminusName = requireStop(getConfig(), train.terminus.stop).name;

    const verb = train.isArrival()
      ? departureTime.isBefore(local.value)
        ? "Arrived at"
        : "Arrives at"
      : departureTime.isBefore(local.value)
      ? "Departed"
      : "Departs";
    const departureText = `${verb} ${perspectiveName} at ${relativeTimeString}`;

    return {
      title: {
        short: `${terminusName} train`,
        long: `${timeString} ${terminusName} train`,
      },
      departureText: departureText,
      lines: [train.line, ...train.associatedLines],
      disruptions: departureWithDisruptions.disruptions,
      diagram: getDiagramForService(train),
      departure: train,
    };
  } else {
    return null;
  }
});

const { settings } = useSettings();
const developerMode = computed(() => settings.value?.developerMode ?? false);

const head = computed(() => {
  if (data.value == null) {
    return generatePageHeadNotFound("Train not found");
  }
  return generatePageHead({
    title: data.value.title.long,
    allowIndexing: false,
    canonicalUrl: getServicePageRoute(data.value.departure),
  });
});
useHead(head as UseHeadInput<{}>);
</script>

<template>
  <PageContent
    v-if="data != null"
    :title="data.title.short"
    title-margin="0.5rem"
    v-bind="$attrs"
  >
    <p class="subtitle">{{ data.departureText }}</p>
    <LineList class="line-list" :lines="data.lines"></LineList>
    <LiveStatus
      class="live-data"
      :departure="data.departure"
      :class="{
        'above-disruptions': data.disruptions.length > 0,
      }"
    ></LiveStatus>
    <Disruptions
      class="disruptions"
      v-if="data.disruptions.length > 0"
      :disruptions="data.disruptions"
    ></Disruptions>
    <LineDiagram
      v-if="data.diagram != null"
      :diagram="data.diagram"
      class="diagram"
    >
      <template #stop="slotProps">
        <TrainPageStop :stop-data="slotProps.stopData" />
      </template>
    </LineDiagram>

    <div class="flex-grow"></div>
    <div
      class="dev-info"
      v-if="developerMode && Object.keys(data.departure.debugInfo).length > 0"
    >
      <h2>Developer info</h2>
      <p
        v-for="[key, value] in Object.entries(data.departure.debugInfo)"
        :key="key"
      >
        {{ key }}:
        <code>
          <RouterLink
            :to="value.replace(getConfig().shared.canonicalUrl, '')"
            class="link"
            v-if="value.startsWith(getConfig().shared.canonicalUrl)"
          >
            {{ value.replace(getConfig().shared.canonicalUrl, "") }}
          </RouterLink>
          <span v-else>{{ value }}</span>
        </code>
      </p>
    </div>
  </PageContent>

  <NotFoundLayout
    title="Train not found"
    message="This train can't be found right now. It might be from an old timetable, no longer running, or not stopping here anymore."
    v-if="data == null"
    v-bind="$attrs"
  ></NotFoundLayout>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.subtitle {
  margin-bottom: 1rem;
}
.line-list {
  margin-bottom: 1rem;
}
.live-data {
  margin-bottom: 1rem;
  &.above-disruptions {
    margin-bottom: 0.5rem;
  }
}
.disruptions {
  margin-bottom: 1rem;
}
.diagram {
  --stop-gap: 1.25rem;
  margin-bottom: 2rem;
  margin-top: 1rem;
}
.dev-info {
  border-top: 1px solid var(--color-soft-border);
  padding-top: 2rem;
  margin-bottom: 2rem;
  gap: 0.75rem;
  h2 {
    @include utils.h2;
  }
  span,
  code,
  a {
    word-break: break-all;
  }
}
.flex-grow {
  @include template.flex-grow;
}
</style>
