<script setup lang="ts">
import { computed } from "vue";
import Icon from "../icons/Icon.vue";
import { search, searchOptionsWholeSite } from "./search";
import { useSettings } from "@/settings/settings";

const props = defineProps<{
  query: string;
  mode: "all" | "stops-only";
}>();
const emits = defineEmits<{
  (e: "topResultChange", payload: { url: string }): void;
  (e: "resultClick"): void;
}>();

const { settings } = useSettings();
const developerMode = computed(() => settings.value?.developerMode ?? false);

const results = computed(() => {
  const results = search(
    props.query,
    searchOptionsWholeSite(developerMode.value),
  );
  emits("topResultChange", { url: results[0]?.url });
  return results;
});
</script>

<template>
  <div class="results">
    <p v-if="query.length === 0" class="message">Results will appear here.</p>
    <p v-else-if="results.length === 0" class="message">No results.</p>

    <RouterLink
      v-for="result in results"
      :key="result.url"
      :to="result.url"
      class="result"
      @click="() => $emit('resultClick')"
    >
      <Icon :id="result.icon"></Icon>
      <div class="column">
        <p class="title">{{ result.title }}</p>
        <p class="subtitle" v-if="result.subtitle != null">
          {{ result.subtitle }}
          <template
            v-if="
              developerMode &&
              result.data != null &&
              typeof result.data === 'object' &&
              'line' in result.data &&
              typeof result.data.line === 'number'
            "
          >
            &nbsp;•&nbsp;&nbsp;Line #{{ result.data.line }}
          </template>
          <template
            v-if="
              developerMode &&
              result.data != null &&
              typeof result.data === 'object' &&
              'stop' in result.data &&
              typeof result.data.stop === 'number'
            "
          >
            &nbsp;•&nbsp;&nbsp;Stop #{{ result.data.stop }}
          </template>
        </p>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.result {
  @include template.button-hover;
  @include template.row;
  --button-rounding: 0;

  padding: 0.75rem 1rem;
}
.icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}
.column {
  justify-content: center;

  flex-shrink: 1;
  min-width: 0;
}
.title {
  color: var(--color-ink-100);
  font-weight: bold;
}
.subtitle {
  color: var(--color-ink-80);
  font-size: 0.75rem;
  margin-top: 0.5rem;
}
.message {
  margin: 2rem 1rem;
}
</style>
