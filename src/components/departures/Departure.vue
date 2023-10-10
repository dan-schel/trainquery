<script setup lang="ts">
import OneLineP from "@/components/common/OneLineP.vue";
import Icon from "../icons/Icon.vue";
import { RouterLink } from "vue-router";
import { Departure } from "shared/system/service/departure";
import { getServicePageRoute, requireLine } from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import { computed } from "vue";
import {
  getLinesString,
  getPlatformString,
  getTerminusString,
  getTimeString,
  getViaString,
} from "./helpers/utils";
import { getStoppingPatternString } from "./helpers/stopping-pattern";
import type { StopID } from "shared/system/ids";
import type { QUtcDateTime } from "shared/qtime/qdatetime";
import { continuify } from "./helpers/continuify";

const props = defineProps<{
  departure: Departure;
  continuationsEnabled: boolean;
  perspective: StopID;
  now: QUtcDateTime;
}>();

const detail = computed(() => {
  const patternList = continuify(props.departure);
  return {
    terminus: getTerminusString(props.departure, patternList),
    via: getViaString(props.departure, patternList),
    platform: getPlatformString(props.departure),
    stoppingPatternString: getStoppingPatternString(
      props.departure,
      patternList
    ),
    lineColor: requireLine(getConfig(), props.departure.line).color,
    timeString: getTimeString(props.departure, props.now),
    linesString: getLinesString(props.departure),
  };
});
</script>

<template>
  <RouterLink
    class="departure"
    :class="`accent-${detail.lineColor}`"
    :to="getServicePageRoute(departure, departure.perspectiveIndex)"
  >
    <div class="primary">
      <OneLineP class="terminus">{{ detail.terminus }}</OneLineP>
      <OneLineP class="via">{{ detail.via ?? "" }}</OneLineP>
      <OneLineP class="time">{{ detail.timeString }}</OneLineP>
    </div>
    <div class="details">
      <OneLineP>{{ detail.stoppingPatternString }}</OneLineP>

      <div class="extra">
        <OneLineP class="extra-text">{{ detail.linesString }}</OneLineP>
      </div>
      <!-- <div class="extra disruption">
        <Icon id="uil:exclamation-circle"></Icon>
        <OneLineP class="extra-text">
          Potentially replaced by buses after Westall
        </OneLineP>
      </div> -->
    </div>
    <div class="platform" v-if="detail.platform != null">
      <p>Platform</p>
      <p class="platform-number">{{ detail.platform }}</p>
    </div>
    <div class="arrow">
      <Icon id="uil:angle-right"></Icon>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/line-colors" as line-colors;
.departure {
  @include line-colors.accent-classes;
  @include template.button-hover;
  --button-rounding: 0;
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-template-rows: 1rem 2.3rem;
  grid-template-areas:
    "primary primary arrow"
    "details platform arrow";

  padding: 1rem;
  row-gap: 0.5rem;
}

.primary :deep(p) {
  color: var(--color-accent);
}
.terminus :deep(p),
.time :deep(p),
.platform-number {
  font-size: 1rem;
  font-weight: bold;
}
.via :deep(p),
.details :deep(p) {
  font-stretch: semi-condensed;
  font-size: 0.8rem;
}

.primary {
  grid-area: primary;
  flex-direction: row;
  align-items: baseline;
}
.via {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;

  margin-left: 0.25rem;
  margin-right: 1rem;
}
.terminus {
  min-width: 0;
  max-width: 10rem;
}
.time {
  min-width: 0;
  max-width: 10rem;
}
.details {
  grid-area: details;
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr 1rem;

  > * {
    min-width: 0;
  }
  .extra {
    @include template.row;
    grid-row: 3;
    gap: 0.25rem;

    .extra-text {
      min-width: 0;
      flex-shrink: 1;
    }

    &:deep(p),
    .icon {
      color: var(--color-accent);
    }

    &.disruption {
      &:deep(p),
      .icon {
        color: var(--color-error);
      }
      &:deep(p) {
        font-weight: bold;
      }
    }
  }
}

.platform {
  grid-area: platform;
  margin-left: 0.5rem;

  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 2.3rem;
  padding: 0.2rem 0.4rem;
  justify-items: center;

  border: 2px solid var(--color-ink-20);
  border-radius: 0.25rem;

  :nth-child(1) {
    font-size: 0.6rem;
    font-stretch: semi-condensed;
  }
  .platform-number {
    grid-row: 3;
  }
}
.arrow {
  grid-area: arrow;
  align-self: center;
  font-size: 1rem;
  margin-right: -0.5rem;
  margin-left: 0.5rem;
}
</style>
./helpers/continuify ./helpers/continuified-departure
