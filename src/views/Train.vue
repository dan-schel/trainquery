<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { computed, ref, watch } from "vue";
import PageContent from "@/components/common/PageContent.vue";
import { Service } from "shared/system/timetable/service";
import { z } from "zod";
import LineList from "@/components/LineList.vue";
import { getDiagramForService } from "@/components/line/get-diagram-for-service";
import LineDiagram from "@/components/line/LineDiagram.vue";
import LinePageStop from "@/components/line/LinePageStop.vue";

const route = useRoute();
const params = ref(route.params);
watch(route, () => {
  // For some reason, this is called even when navigating away from the page!
  if (route.name == "train") {
    params.value = route.params;
  }
});

const train = computed(() => {
  const metaSchema = z.object({
    state: z.object({
      service: Service.json,
    }),
  });
  const meta = metaSchema.parse(route.meta);
  return meta.state.service;
});

const diagram = computed(() => getDiagramForService(train.value));

const head = computed(() => ({
  // TODO: Real title.
  title: "Train",
  link: [
    {
      rel: "canonical",
      href:
        // TODO: Real link.
        "https://trainquery.com/train",
    },
  ],
}));
useHead(head);
</script>

<template>
  <PageContent title="Train" title-margin="0.5rem">
    <LineList :lines="[train.line, ...train.associatedLines]"></LineList>
    <LineDiagram v-if="diagram != null" :diagram="diagram" class="diagram">
      <template #stop="slotProps">
        <!-- TODO: this is the wrong component! -->
        <LinePageStop :stop="slotProps.stop" :express="slotProps.express" />
      </template>
    </LineDiagram>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.diagram {
  --stop-gap: 1rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
