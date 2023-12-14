<script setup lang="ts">
import { useHead, type UseHeadInput } from "@vueuse/head";
import { useRoute } from "vue-router";
import {
  getLinePageRoute,
  getLineFromUrlName,
} from "shared/system/config-utils";
import { computed, ref, watch } from "vue";
import { getConfig } from "@/utils/get-config";
import PageContent from "@/components/common/PageContent.vue";
import LineDiagram from "@/components/line-diagram/LineDiagram.vue";
import { getRouteDiagram } from "shared/system/routes/line-routes";
import LinePageStop from "@/components/line-diagram/LinePageStop.vue";
import { formatMode } from "@/utils/format-mode";
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import { generatePageHead, generatePageHeadNotFound } from "@/utils/head";
import { useSettings } from "@/settings/settings";

const route = useRoute();
const params = ref(route.params);
watch(route, () => {
  // For some reason, this is called even when navigating away from the page!
  if (route.name == "line") {
    params.value = route.params;
  }
});

const line = computed(() =>
  getLineFromUrlName(getConfig(), params.value.id as string),
);
const diagram = computed(() =>
  line.value == null ? null : getRouteDiagram(line.value),
);
const modeString = computed(() =>
  line.value == null
    ? ""
    : formatMode(line.value.serviceType, { capital: true, line: true }),
);

const { settings } = useSettings();
const developerMode = computed(() => settings.value?.developerMode ?? false);

const head = computed(() => {
  if (line.value == null) {
    return generatePageHeadNotFound("Line not found");
  }
  return generatePageHead({
    title: `${line.value.name} Line`,
    allowIndexing: true,
    canonicalUrl: getLinePageRoute(getConfig(), line.value.id),
  });
});
useHead(head as UseHeadInput<{}>);
</script>

<template>
  <PageContent
    :title="line.name + ' Line'"
    title-margin="0.5rem"
    v-if="line != null"
    v-bind="$attrs"
  >
    <template v-slot:title-inline v-if="developerMode">
      <p class="line-id">
        <code>#{{ line.id }}</code>
      </p>
    </template>

    <p class="subtitle">{{ modeString }}</p>
    <h2>Stops</h2>
    <LineDiagram v-if="diagram != null" :diagram="diagram" class="diagram">
      <template #stop="slotProps">
        <LinePageStop :stop-data="slotProps.stopData" />
      </template>
    </LineDiagram>
  </PageContent>

  <NotFoundLayout
    title="Line not found"
    message="This line doesn't exist, at least not anymore!"
    v-if="line == null"
    v-bind="$attrs"
  ></NotFoundLayout>
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
  --stop-gap: 1.25rem;
  margin-bottom: 2rem;
}
.line-id {
  margin-left: 0.5rem;
}
</style>
