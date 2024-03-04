<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import { useNow } from "@/utils/now-provider";
import type { Departure } from "shared/system/service/departure";
import { KnownPerspectivePattern } from "shared/system/service/known-perspective-pattern";
import type { ServedStop } from "shared/system/service/served-stop";
import { computed } from "vue";
import { getDelayString } from "../departures/helpers/utils";

const { utc } = useNow();
const props = defineProps<{
  departure: Departure;
}>();

const delay = computed(() => {
  const pattern = props.departure.pattern;
  if (pattern instanceof KnownPerspectivePattern) {
    return null;
  }

  const nextStop = pattern.stops.find(
    (s): s is ServedStop =>
      !s.express && (s.liveTime ?? s.scheduledTime).isAfterOrEqual(utc.value),
  );
  if (nextStop == null || nextStop.liveTime == null) {
    return null;
  }

  const delay = getDelayString(nextStop.liveTime, nextStop.scheduledTime, {
    capitalize: false,
  });
  if (delay == null) {
    return null;
  }

  return {
    type: delay.type,
    text: delay.text,
    suffix: /[.?!]$/g.test(delay.text) ? "" : ".",
    priorToOrigin: utc.value.isBefore(pattern.origin.scheduledTime),
  };
});
</script>

<template>
  <div v-if="delay != null" class="container" :class="delay.type">
    <Icon v-if="delay.type === 'positive'" id="uil:check"></Icon>
    <Icon v-else-if="delay.type === 'medium'" id="uil:clock"></Icon>
    <Icon
      v-else-if="delay.type === 'negative'"
      id="uil:exclamation-circle"
    ></Icon>
    <Icon v-else id="uil:clock"></Icon>
    <p>
      {{
        delay.priorToOrigin ? "Currently estimated to run" : "Currently running"
      }}
      <b>{{ delay.text }}</b
      >{{ delay.suffix }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.container {
  border-radius: 0.75rem;
  border: 1px solid var(--color-ink-20);
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  grid-template-areas: "icon text";
  align-items: center;

  &.positive > .icon {
    color: var(--color-success);
  }
  &.medium > .icon {
    color: var(--color-warning);
  }
  &.negative > .icon {
    color: var(--color-error);
  }
}
.icon {
  grid-area: icon;
  font-size: 1.2rem;
  justify-self: center;
}
.container > p {
  grid-area: text;
  font-size: 0.8rem;
  margin: 0.75rem;
  margin-left: 0;
  font-stretch: semi-condensed;
}
</style>
