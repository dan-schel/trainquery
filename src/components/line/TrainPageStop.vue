<script setup lang="ts">
import { getConfig } from "@/utils/get-config";
import { requireStop } from "shared/system/config-utils";
import { computed } from "vue";
import { getStopPageRoute } from "shared/system/config-utils";
import type { AdditionalServedData } from "./get-diagram-for-service";
import { type LineDiagramStop } from "shared/system/routes/line-routes";
import { formatRelativeTime } from "@/utils/format-qtime";
import type { QLocalDateTime } from "shared/qtime/qdatetime";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import OneLineP from "../common/OneLineP.vue";
import { getPlatformString } from "../departures/helpers/utils";

const props = defineProps<{
  stopData: LineDiagramStop<AdditionalServedData, null>;
  now: QLocalDateTime;
}>();
const stop = computed(() => requireStop(getConfig(), props.stopData.stop));
const timeString = computed(() => {
  if (props.stopData.express || props.stopData.data.scheduledTime == null) {
    return null;
  }
  const local = toLocalDateTimeLuxon(
    getConfig(),
    props.stopData.data.scheduledTime
  );
  return formatRelativeTime(local, props.now, { suppressEarlierToday: true });
});
const platformString = computed(() => {
  if (props.stopData.express || props.stopData.data.platform == null) {
    return null;
  }
  return getPlatformString(props.stopData.data.platform, props.stopData.stop);
});
</script>

<template>
  <div class="row">
    <OneLineP>
      <RouterLink
        class="link"
        :class="{ express: stopData.express }"
        :to="getStopPageRoute(getConfig(), stop.id)"
        >{{ stopData.express ? "Skips " : "" }}{{ stop.name }}</RouterLink
      >
    </OneLineP>
    <p v-if="timeString != null" class="dot">•</p>
    <OneLineP v-if="timeString != null" class="time">{{ timeString }}</OneLineP>
    <p v-if="platformString != null" class="dot">•</p>
    <OneLineP v-if="platformString != null" class="platform"
      >Plat. {{ platformString }}</OneLineP
    >
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.link {
  --color-accent: var(--color-ink-100);
  font-weight: bold;

  &.express {
    --color-accent: var(--color-ink-80);
    font-weight: normal;
    font-size: 0.8rem;
    font-style: italic;
  }
}
.dot {
  margin: 0 0.4rem;
}
.time {
  min-width: 0;
  flex-shrink: 1;
}
.row {
  @include template.row;
}
.flex-grow {
  @include template.flex-grow;
}
</style>
