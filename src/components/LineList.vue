<script setup lang="ts">
import { getLinePageRoute, requireLine } from "shared/system/config-utils";
import { computed } from "vue";
import { getConfig } from "@/utils/get-config";
import type { LineID } from "shared/system/ids";

const props = defineProps<{
  lines: LineID[];
}>();

const lines = computed(() => {
  const all = props.lines
    .map((l) => requireLine(getConfig(), l))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    all,
    last: all[all.length - 1],
  };
});
</script>

<template>
  <p class="lines">
    <template v-for="line in lines.all.slice(0, -1)" :key="line.id">
      <RouterLink
        :to="getLinePageRoute(getConfig(), line.id)"
        class="link-secret"
        :class="`accent-${line.color}`"
      >
        {{ line.name }}
      </RouterLink>
      <span v-if="lines.all.length > 2">, </span>
    </template>

    <span v-if="lines.all.length > 1"> and </span>
    <RouterLink
      :to="getLinePageRoute(getConfig(), lines.last.id)"
      class="link-secret"
      :class="`accent-${lines.last.color}`"
    >
      {{ lines.last.name }}
    </RouterLink>

    <span v-if="lines.all.length === 0">No lines</span>
    <span v-else-if="lines.all.length === 1"> Line</span>
    <span v-else> lines</span>
  </p>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/line-colors" as line-colors;
.lines {
  @include line-colors.accent-classes;
  font-size: 0.8rem;
  .link-secret {
    font-weight: bold;
  }
}
</style>
