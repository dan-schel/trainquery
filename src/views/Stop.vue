<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import {
  getStopPageRoute,
  requireStopFromUrlName,
} from "shared/system/config-utils";
import { computed } from "vue";
import { getConfig } from "@/utils/get-config";
import DepartureGroup from "@/components/departures/DepartureGroup.vue";
import DepartureControls from "@/components/departures/DepartureControls.vue";
import PageContent from "@/components/common/PageContent.vue";
import LineList from "@/components/LineList.vue";

const route = useRoute();
const params = computed(() => route.params);

const stop = computed(() =>
  requireStopFromUrlName(getConfig(), params.value.id as string)
);

useHead({
  title: stop.value.name,
  link: [
    {
      rel: "canonical",
      href:
        "https://trainquery.com" + getStopPageRoute(getConfig(), stop.value.id),
    },
  ],
});
</script>

<template>
  <PageContent :title="`${stop.name}`" title-margin="0.5rem">
    <LineList :stop="stop.id"></LineList>
    <DepartureControls class="controls"></DepartureControls>
    <DepartureGroup
      class="group"
      :allow-pinning="true"
      :count="4"
    ></DepartureGroup>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.lines {
  margin-bottom: 1rem;
}
.controls {
  margin-bottom: 1.5rem;
}
.group {
  margin-bottom: 2rem;
}
</style>
