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
import PageContent from "@/components/common/PageContent.vue";

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
        "https://trainquery.com" + getStopPageRoute(getConfig(), stop.value),
    },
  ],
});
</script>

<template>
  <PageContent :title="`${stop.name} Station`" title-margin="2rem">
    <h1></h1>
    <DepartureGroup
      class="group"
      :allow-pinning="true"
      :count="4"
    ></DepartureGroup>
  </PageContent>
</template>

<style scoped lang="scss">
.group {
  margin-bottom: 2rem;
}
</style>
