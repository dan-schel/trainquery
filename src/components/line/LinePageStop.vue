<script setup lang="ts">
import { getConfig } from "@/utils/get-config";
import { requireStop } from "shared/system/config-utils";
import type { StopID } from "shared/system/ids";
import { computed } from "vue";
import { getStopPageRoute } from "shared/system/config-utils";

const props = defineProps<{
  stop: StopID;
  express: boolean;
}>();

const stopData = computed(() => requireStop(getConfig(), props.stop));
</script>

<template>
  <p>
    <RouterLink
      class="link"
      :class="{ express: express }"
      :to="getStopPageRoute(getConfig(), stopData.id)"
      >{{ express ? "Skips " : "" }}{{ stopData.name }}</RouterLink
    >
  </p>
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
</style>
