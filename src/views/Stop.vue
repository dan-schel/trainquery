<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import {
  getStopPageRoute,
  requireStopFromUrlName,
} from "shared/system/config-utils";
import { computed } from "vue";
import { getConfig } from "@/utils/get-config";
import DepartureFeed from "@/components/departures/DepartureFeed.vue";

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
  <main>
    <h1>{{ stop.name }} Station</h1>
    <DepartureFeed class="feed" :count="5"></DepartureFeed>
  </main>
</template>

<style scoped lang="scss">
main {
  align-items: center;
  padding: 2rem 1rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-ink-100);
  margin-bottom: 1rem;
}
.feed {
  max-width: 25rem;
  width: 100%;
}
</style>
