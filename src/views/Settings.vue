<script setup lang="ts">
import { useHead } from "@vueuse/head";
import PageContent from "@/components/common/PageContent.vue";
import CupertinoPicker from "@/components/common/CupertinoPicker.vue";
import { onMounted, ref } from "vue";
import { getTheme, setTheme, type Theme } from "@/settings/theme";

useHead({
  title: "Settings",
});

const theme = ref<Theme>();
onMounted(() => {
  theme.value = getTheme();
});

const onThemeChanged = (newTheme: Theme) => {
  setTheme(newTheme);
};
</script>

<template>
  <PageContent title="Settings" title-margin="1rem">
    <p>Your settings are saved to your browser's local storage.</p>
    <div class="section">
      <h2>Theme</h2>
      <p>
        "Auto" means the colour theme should follow your device's/browser's
        settings.
      </p>
      <CupertinoPicker
        group="theme"
        :options="[
          { theme: 'auto' as const, name: 'Auto' },
          { theme: 'light' as const, name: 'Light' },
          { theme: 'dark' as const, name: 'Dark' },
        ]"
        :keyify="(option) => option.theme"
        :modelValue="theme"
        @update:modelValue="onThemeChanged"
        class="theme-picker"
      >
        <template v-slot="slotProps">
          <p>{{ slotProps.data.name }}</p>
        </template>
      </CupertinoPicker>
    </div>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.section {
  margin-top: 2rem;

  > h2 {
    color: var(--color-ink-100);
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  > p {
    margin-bottom: 1rem;
  }
}

.theme-picker {
  align-self: flex-start;
  :deep(.content) {
    @include template.content-text;
    height: 2rem;
    padding: 0 1.5rem;
  }
}
</style>
