<script setup lang="ts">
import type { Disruption } from "shared/disruptions/processed/disruption";
import { computed } from "vue";
import {
  extractSummaryFromDisruption,
  extractUrlForDisruption,
} from "./extract-summary";
import UilExclamationCircle from "../icons/UilExclamationCircle.vue";
import UilExternalLinkAlt from "../icons/UilExternalLinkAlt.vue";

const props = defineProps<{
  disruptions: Disruption[];
}>();

const displayData = computed(() => {
  return props.disruptions.map((x) => ({
    summary: extractSummaryFromDisruption(x),

    // TODO: This is obviously temporary!
    url: extractUrlForDisruption(x),
  }));
});
</script>

<template>
  <div class="disruptions">
    <div v-for="(disruption, i) in displayData" :key="i" class="disruption">
      <UilExclamationCircle></UilExclamationCircle>
      <p>
        {{ disruption.summary }}
      </p>
      <a
        v-if="disruption.url != null"
        class="disruption-url"
        title="Find out more"
        :href="disruption.url"
      >
        <UilExternalLinkAlt></UilExternalLinkAlt>
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.disruptions {
  gap: 0.5rem;
}
.disruption {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  grid-template-areas: "icon text link";
  align-items: center;
}
.disruption > svg {
  color: var(--color-error);
  justify-self: center;
}
svg {
  grid-area: icon;
  font-size: 1.2rem;
}
.disruption > p {
  grid-area: text;
  font-size: 0.8rem;
  margin: 0.75rem;
  margin-left: 0;
  font-stretch: semi-condensed;
}
.disruption-url {
  @include template.button-hover;
  @include template.content-text-icon;
  --button-rounding: 0;
  align-self: stretch;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  min-height: 2.5rem;
}
</style>
