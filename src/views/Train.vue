<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { computed, ref, watch } from "vue";
import PageContent from "@/components/common/PageContent.vue";

const route = useRoute();
const params = ref(route.params);
watch(route, () => {
  // For some reason, this is called even when navigating away from the page!
  if (route.name == "train") {
    params.value = route.params;
  }
});

// const stop = computed(() =>
//   requireStopFromUrlName(getConfig(), params.value.id as string)
// );

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
  <PageContent title="Train" title-margin="0.5rem"> </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
