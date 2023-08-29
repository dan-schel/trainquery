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

const route = useRoute();
const params = computed(() => route.params);

const line = computed(() =>
  requireLineFromUrlName(getConfig(), params.value.id as string)
);
const diagram = computed(() => getRouteDiagram(line.value));

useHead({
  title: `${line.value.name} Line`,
  link: [
    {
      rel: "canonical",
      href:
        "https://trainquery.com" + getLinePageRoute(getConfig(), line.value),
    },
  ],
});
</script>

<template>
  <PageContent :title="line.name + ' Line'" title-margin="1rem">
    <LineDiagram :diagram="diagram" class="diagram">
      <template #stop="slotProps">
        <LinePageStop :stop="slotProps.stop" :express="slotProps.express" />
      </template>
    </LineDiagram>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.diagram {
  --stop-gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0rem;
}
</style>
