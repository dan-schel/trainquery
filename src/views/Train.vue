<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import PageContent from "@/components/common/PageContent.vue";
import { z } from "zod";
import LineList from "@/components/LineList.vue";
import { getDiagramForService } from "@/components/line/get-diagram-for-service";
import LineDiagram from "@/components/line/LineDiagram.vue";
import LinePageStop from "@/components/line/LinePageStop.vue";
import { Departure } from "shared/system/service/departure";
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import {
  nowLocalLuxon,
  toLocalDateTimeLuxon,
} from "shared/qtime/luxon-conversions";
import { getConfig } from "@/utils/get-config";
import { formatRelativeTime, formatTime } from "@/utils/format-qtime";
import { requireStop } from "shared/system/config-utils";

const now = ref(nowLocalLuxon(getConfig()));

const route = useRoute();

const train = computed(() => {
  const metaSchema = z.object({
    state: z.object({
      departure: Departure.json.optional(),
    }),
  });
  const meta = metaSchema.parse(route.meta);
  return meta.state.departure;
});

const diagram = computed(() =>
  train.value != null ? getDiagramForService(train.value) : null
);

const title = computed(() => {
  if (train.value == null) {
    return {
      short: "Train not found",
      long: "Train not found",
    };
  }

  const perspective = train.value.perspective;
  const timeString = formatTime(
    toLocalDateTimeLuxon(getConfig(), perspective.scheduledTime).time
  );
  const terminus = requireStop(getConfig(), train.value.terminus.stop).name;
  return {
    short: `${terminus} train`,
    long: `${timeString} ${terminus} train`,
  };
});

const departureText = computed(() => {
  if (train.value == null) {
    return "";
  }

  const name = requireStop(getConfig(), train.value.perspective.stop).name;
  const time = toLocalDateTimeLuxon(
    getConfig(),
    train.value.perspective.scheduledTime
  );
  const timeString = formatRelativeTime(time, now.value);
  const verb = time.isBefore(now.value) ? "Departed" : "Departs";
  return `${verb} ${name} at ${timeString}`;
});

const head = computed(() => ({
  title: title.value.long,
  meta: [{ name: "robots", content: "noindex" }],
}));
useHead(head);
</script>

<template>
  <PageContent
    :title="title.short"
    title-margin="0.5rem"
    v-if="train != null"
    v-bind="$attrs"
  >
    <p class="subtitle">{{ departureText }}</p>
    <LineList
      class="line-list"
      :lines="[train.line, ...train.associatedLines]"
    ></LineList>
    <LineDiagram v-if="diagram != null" :diagram="diagram" class="diagram">
      <template #stop="slotProps">
        <!-- TODO: this is the wrong component! -->
        <LinePageStop :stop="slotProps.stop" :express="slotProps.express" />
      </template>
    </LineDiagram>
  </PageContent>

  <NotFoundLayout
    :title="title.short"
    message="That train can't be found anymore. It might be from an old timetable, no longer running, or not stopping here anymore."
    v-if="train == null"
  ></NotFoundLayout>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.line-list {
  margin-bottom: 2rem;
}
.subtitle {
  margin-bottom: 1rem;
}
.diagram {
  --stop-gap: 1rem;
  margin-bottom: 2rem;
}
</style>
@/components/departures/helpers/continuify
