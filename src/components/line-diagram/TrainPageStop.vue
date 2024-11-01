<script setup lang="ts">
import { getConfig } from "@/utils/get-config";
import { requireStop } from "shared/system/config-utils";
import { computed } from "vue";
import { getStopPageRoute } from "shared/system/config-utils";
import type { AdditionalServedData } from "./get-diagram-for-service";
import { type LineDiagramStop } from "shared/system/routes/line-routes";
import { formatRelativeTime } from "shared/qtime/format";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import OneLineP from "../common/OneLineP.vue";
import { getPlatformString } from "../departures/helpers/utils";
import { useNow } from "@/utils/now-provider";

const props = defineProps<{
  stopData: LineDiagramStop<AdditionalServedData, null>;
}>();

const now = useNow().local;

const stop = computed(() => requireStop(getConfig(), props.stopData.stop));
const time = computed(() => {
  if (props.stopData.express || props.stopData.data.scheduledTime == null) {
    return null;
  }
  return toLocalDateTimeLuxon(getConfig(), props.stopData.data.scheduledTime);
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
    <OneLineP class="stop-name" :class="{ express: stopData.express }">
      <RouterLink
        class="link-secret"
        :to="getStopPageRoute(getConfig(), stop.id, null, null)"
        >{{ stopData.express ? "Skips " : "" }}{{ stop.name }}</RouterLink
      >
    </OneLineP>
    <div class="platform" v-if="platformString != null">
      <p class="platform-number">{{ platformString }}</p>
    </div>
    <p v-if="time != null">&ensp;•&ensp;</p>
    <OneLineP v-if="time != null" class="time">
      <RouterLink
        class="link-secret"
        :to="getStopPageRoute(getConfig(), stop.id, time, null)"
        >{{
          formatRelativeTime(time, now, { suppressEarlierToday: true })
        }}</RouterLink
      >
    </OneLineP>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.stop-name {
  --color-accent: var(--color-text-strong);
  font-weight: bold;

  &.express {
    --color-accent: var(--color-text);
    font-weight: normal;
    font-style: italic;
    :deep(p) {
      font-size: 0.8rem;
    }
  }
}
.time {
  --color-accent: var(--color-text);
  min-width: 0;
  flex-shrink: 1;
}
.row {
  @include template.row;
}
.flex-grow {
  @include template.flex-grow;
}
.platform {
  flex-direction: row;
  align-items: center;
  justify-content: center;

  margin-left: 0.5rem;
  height: 1.2rem;
  min-width: 1.2rem;

  // Slightly arbitrary, but this is just to stop platform labels impacting the
  // height of the row.
  margin-top: -0.5rem;
  margin-bottom: -0.5rem;
  padding: 0 0.2rem;

  border: 2px solid var(--color-soft-border);
  border-radius: 0.25rem;

  p {
    font-size: 0.8rem;
    font-weight: bold;
    text-align: center;
  }
}
</style>
