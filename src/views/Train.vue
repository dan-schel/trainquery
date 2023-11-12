<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { computed } from "vue";
import PageContent from "@/components/common/PageContent.vue";
import { z } from "zod";
import LineList from "@/components/LineList.vue";
import { getDiagramForService } from "@/components/line-diagram/get-diagram-for-service";
import LineDiagram from "@/components/line-diagram/LineDiagram.vue";
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import { getConfig } from "@/utils/get-config";
import { formatRelativeTime, formatTime } from "@/utils/format-qtime";
import { requireStop } from "shared/system/config-utils";
import TrainPageStop from "@/components/line-diagram/TrainPageStop.vue";
import { useNow } from "@/utils/now-provider";
import Disruptions from "@/components/train/Disruptions.vue";
import { DepartureWithDisruptions } from "../../shared/disruptions/departure-with-disruptions";

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
    };
  } else {
    return null;
  }
});

const head = computed(() => ({
  title: data.value != null ? data.value.title.long : "Train not found",
  meta: [{ name: "robots", content: "noindex" }],
}));
useHead(head);
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
.line-list {
  margin-bottom: 1rem;
}
.subtitle {
  margin-bottom: 1rem;
}
.disruptions {
  margin-bottom: 1rem;
}
.diagram {
  --stop-gap: 1.25rem;
  margin-bottom: 2rem;
  margin-top: 1rem;
}
</style>
