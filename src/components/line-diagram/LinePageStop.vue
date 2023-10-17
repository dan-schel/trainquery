<script setup lang="ts">
import { getConfig } from "@/utils/get-config";
import { requireStop } from "shared/system/config-utils";
import { computed } from "vue";
import { getStopPageRoute } from "shared/system/config-utils";
import type { LineDiagramStop } from "shared/system/routes/line-routes";

const props = defineProps<{
  stopData: LineDiagramStop<null, null>;
}>();

const stop = computed(() => requireStop(getConfig(), props.stopData.stop));
</script>

<template>
  <p>
    <RouterLink
      class="link"
      :class="{ express: stopData.express }"
      :to="getStopPageRoute(getConfig(), stop.id, null, null)"
      >{{ stopData.express ? "Skips " : "" }}{{ stop.name }}</RouterLink
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
