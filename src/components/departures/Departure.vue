<script setup lang="ts">
import OneLineP from "@/components/common/OneLineP.vue";
import { RouterLink } from "vue-router";
import { getServicePageRoute, requireLine } from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import { computed } from "vue";
import {
  getDeparturePlatformString,
  getDisruptionsString,
  getLinesString,
  getTerminusString,
  getTimeStrings,
  getViaString,
} from "./helpers/utils";
import { getStoppingPatternString } from "./helpers/stopping-pattern";
import type { StopID } from "shared/system/ids";
import { continuify } from "./helpers/continuify";
import { useNow } from "@/utils/now-provider";
import LiveIcon from "./LiveIcon.vue";
import type { DepartureWithDisruptions } from "shared/disruptions/departure-with-disruptions";
import UilExclamationCircle from "../icons/UilExclamationCircle.vue";
import UilAngleRight from "../icons/UilAngleRight.vue";

const props = defineProps<{
  departure: DepartureWithDisruptions;
  continuationsEnabled: boolean;
  perspective: StopID;
}>();

const { utc } = useNow();

const detail = computed(() => {
  const patternList = continuify(props.departure.departure);
  const timeStrings = getTimeStrings(props.departure.departure, utc.value);
  return {
    terminus: getTerminusString(props.departure.departure, patternList),
    via: getViaString(props.departure.departure, patternList),
    platform: getDeparturePlatformString(props.departure.departure),
    stoppingPatternString: getStoppingPatternString(
      props.departure.departure,
      patternList,
    ),
    lineColor: requireLine(getConfig(), props.departure.departure.line).color,
    primaryTimeString: timeStrings.primary,
    struckoutTimeString: timeStrings.struckout,
    scheduleTimeString: timeStrings.schedule,
    delayTimeString: timeStrings.delay?.text,
    delayTimeType: timeStrings.delay?.type ?? "neutral",
    linesString: getLinesString(props.departure.departure),
    disruptionsString: getDisruptionsString(props.departure.disruptions),
  };
});
</script>

<template>
  <RouterLink
    class="departure"
    :class="`accent-${detail.lineColor}`"
    :to="
      getServicePageRoute(
        departure.departure,
        departure.departure.perspectiveIndex,
      )
    "
  >
    <div class="primary">
      <OneLineP class="terminus">{{ detail.terminus }}</OneLineP>
      <OneLineP class="via">{{ detail.via ?? "" }}</OneLineP>
      <div class="time">
        <OneLineP
          class="struckout-time"
          v-if="detail.struckoutTimeString != null"
          >{{ detail.struckoutTimeString }}</OneLineP
        >
        <OneLineP class="primary-time">{{ detail.primaryTimeString }}</OneLineP>
        <LiveIcon
          class="live-icon"
          v-if="detail.delayTimeString != null"
        ></LiveIcon>
      </div>
    </div>
    <div class="details">
      <OneLineP>{{ detail.stoppingPatternString }}</OneLineP>

      <div v-if="detail.disruptionsString != null" class="extra disruption">
        <UilExclamationCircle></UilExclamationCircle>
        <OneLineP class="extra-text">
          {{ detail.disruptionsString }}
        </OneLineP>
      </div>
      <div
        v-else-if="
          detail.scheduleTimeString != null && detail.delayTimeString != null
        "
        class="extra"
      >
        <OneLineP
          class="extra-text delay"
          :class="{
            positive: detail.delayTimeType === 'positive',
            medium: detail.delayTimeType === 'medium',
            negative: detail.delayTimeType === 'negative',
          }"
        >
          {{ detail.delayTimeString }}
        </OneLineP>
        <p>•</p>
        <OneLineP class="extra-text">
          {{ detail.scheduleTimeString }}
        </OneLineP>
      </div>
      <div v-else-if="detail.scheduleTimeString != null" class="extra">
        <OneLineP class="extra-text">
          {{ detail.scheduleTimeString }}
        </OneLineP>
      </div>
      <div v-else class="extra line">
        <OneLineP class="extra-text">{{ detail.linesString }}</OneLineP>
      </div>
    </div>
    <div class="platform" v-if="detail.platform != null">
      <p>Platform</p>
      <p class="platform-number">{{ detail.platform }}</p>
    </div>
    <div class="arrow">
      <UilAngleRight></UilAngleRight>
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

.terminus :deep(p),
.primary-time :deep(p),
.platform-number {
  font-size: 1rem;
  font-weight: bold;
}

.struckout-time :deep(p) {
  font-size: 1rem;
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
    flex-direction: row;
    align-items: baseline;
    gap: 0.25rem;

    // For the "live" icon.
    position: relative;

    .struckout-time :deep(p) {
      text-decoration: line-through;
      color: var(--color-text-weak-on-raised-surface);
    }
    .struckout-time,
    .primary-time {
      min-width: 0;
      flex-shrink: 1;
    }

    .live-icon {
      position: absolute;
      right: -0.5rem;
      top: -0.2rem;
      font-size: 0.6rem;
    }
  }

  .terminus :deep(p),
  .primary-time :deep(p),
  .via :deep(p),
  .live-icon {
    color: var(--color-accent);
  }
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

    .extra-text.delay {
      font-weight: bold;
      &.positive :deep(p) {
        color: var(--color-success);
      }
      &.medium :deep(p) {
        color: var(--color-warning);
      }
      &.negative :deep(p) {
        color: var(--color-error);
      }
    }

    &.line :deep(p),
    &.line svg {
      color: var(--color-accent);
    }

    &.disruption {
      &:deep(p),
      svg {
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
  padding: 0.25rem 0.4rem 0.15rem 0.4rem;
  justify-items: center;

  border: 2px solid var(--color-soft-border);
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
