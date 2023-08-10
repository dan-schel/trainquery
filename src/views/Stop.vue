<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { requireStopFromUrlName } from "@/utils/config-utils";
import { computed, ref, watch } from "vue";

const route = useRoute();
const params = ref(route.params);
watch(
  () => route.params,
  () => {
    params.value = route.params;
  }
);

const stop = computed(() => requireStopFromUrlName(params.value.id as string));

useHead({
  title: stop.value.name,
});
</script>

<template>
  <main>
    <h1>{{ stop.name }} Station</h1>
  </main>
</template>

<style scoped lang="scss">
main {
  align-items: center;
  padding: 2rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-ink-100);
}
</style>
