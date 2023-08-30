<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import {
  getLinePageRoute,
  requireLineFromUrlName,
} from "shared/system/config-utils";
import { computed } from "vue";
import { getConfig } from "@/utils/get-config";
import PageContent from "@/components/common/PageContent.vue";
import LineDiagram from "@/components/line/LineDiagram.vue";
import { getRouteDiagram } from "shared/system/routes/line-routes";
import LinePageStop from "@/components/line/LinePageStop.vue";
import { getServiceTypeModeString } from "@/utils/mode-strings";

const route = useRoute();
const params = computed(() => route.params);

const line = computed(() =>
  requireLineFromUrlName(getConfig(), params.value.id as string)
);
const diagram = computed(() => getRouteDiagram(line.value));
const modeString = computed(() =>
  getServiceTypeModeString(line.value.serviceType)
);

useHead({
  title: `${line.value.name} Line`,
  link: [
    {
      rel: "canonical",
      href:
        "https://trainquery.com" + getLinePageRoute(getConfig(), line.value.id),
    },
  ],
});
</script>

<template>
  <PageContent :title="line.name + ' Line'" title-margin="0.5rem">
    <p class="subtitle">{{ modeString }}</p>
    <h2>Stops</h2>
    <LineDiagram :diagram="diagram" class="diagram">
      <template #stop="slotProps">
        <LinePageStop :stop="slotProps.stop" :express="slotProps.express" />
      </template>
    </LineDiagram>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.subtitle {
  margin-bottom: 2rem;
}
h2 {
  @include utils.h2;
  margin-bottom: 1rem;
}
.diagram {
  --stop-gap: 1rem;
  margin-bottom: 2rem;
}
</style>
