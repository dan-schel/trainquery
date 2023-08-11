<script setup lang="ts">
import { computed } from "vue";
import Icon from "../icons/Icon.vue";
import { search, searchOptionsWholeSite } from "./search";

const props = defineProps<{
  query: string;
  mode: "all" | "stops-only";
}>();
const emits = defineEmits<{
  (e: "topResultChange", payload: { url: string }): void;
}>();

const results = computed(() => {
  const results = search(props.query, searchOptionsWholeSite());
  emits("topResultChange", { url: results[0]?.url });
  return results;
});
</script>

<template>
  <p v-if="query.length == 0" class="message">Results will appear here.</p>
  <p v-else-if="results.length == 0" class="message">No results.</p>

  <RouterLink
    v-for="result in results"
    :key="result.url"
    :to="result.url"
    class="result"
  >
    <Icon :id="result.icon"></Icon>
    <div class="column">
      <p class="title">{{ result.title }}</p>
      <p class="subtitle" v-if="result.subtitle != null">
        {{ result.subtitle }}
      </p>
    </div>
  </RouterLink>
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
