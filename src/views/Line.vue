<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { RouterLink, useRoute } from "vue-router";
import {
  getLinePageRoute,
  getStopPageRoute,
  requireLineFromUrlName,
  requireStop,
} from "../../shared/system/config-utils";
import { computed } from "vue";
import { getConfig } from "@/utils/get-config";
import PageContent from "@/components/common/PageContent.vue";
import LineDiagram from "@/components/line/LineDiagram.vue";
import { getRouteDiagram } from "../../shared/system/routes/line-routes";

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
  <PageContent :title="line.name + ' Line'">
    <LineDiagram :diagram="diagram" class="diagram">
      <template #stop="slotProps">
        <p>
          <RouterLink
            class="link"
            :class="{ express: slotProps.express }"
            :to="
              getStopPageRoute(
                getConfig(),
                requireStop(getConfig(), slotProps.stop)
              )
            "
            >{{ slotProps.express ? "Skips " : ""
            }}{{ requireStop(getConfig(), slotProps.stop).name }}</RouterLink
          >
        </p>
      </template>
      <!-- <template #stop-extra="slotProps">
        <p class="extra" v-if="!slotProps.express">
          Change here for hopes and dreams
        </p>
      </template> -->
    </LineDiagram>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.diagram {
  --stop-gap: 1rem;
}
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
.extra {
  margin-top: 0.25rem;
  font-size: 0.8rem;
}
</style>
