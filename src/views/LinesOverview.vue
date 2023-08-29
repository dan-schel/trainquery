<script setup lang="ts">
import { useHead } from "@vueuse/head";
import PageContent from "@/components/common/PageContent.vue";
import { getConfig } from "@/utils/get-config";
import { computed } from "vue";
import { getServiceTypeModeString } from "@/utils/mode-strings";
import { RouterLink } from "vue-router";
import { getLinePageRoute } from "shared/system/config-utils";

const modes = computed(() => {
  const c = getConfig().shared;

  return c.serviceTypes
    .map((s) => ({
      serviceType: s,
      lines: c.lines
        .filter((l) => l.serviceType == s.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.lines.length > 0);
});

useHead({
  title: "Lines",
});
</script>

<template>
  <PageContent title="Lines" title-margin="2rem">
    <template v-for="mode in modes" :key="mode">
      <h2>
        {{ getServiceTypeModeString(mode.serviceType.id, { plural: true }) }}
      </h2>
      <ul>
        <li v-for="line in mode.lines" :key="line.id">
          <p>
            <RouterLink
              class="link"
              :to="getLinePageRoute(getConfig(), line)"
              >{{ line.name }}</RouterLink
            >
            {{ line.specialEventsOnly ? " (special events only)" : "" }}
          </p>
        </li>
      </ul>
    </template>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

h2 {
  @include utils.h2;
  margin-bottom: 1rem;
}
ul {
  margin-bottom: 2rem;
}
li {
  margin-left: 1rem;
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
}
</style>
