<script setup lang="ts">
import { useHead } from "@vueuse/head";
import PageContent from "@/components/common/PageContent.vue";
import Picker from "@/components/common/Picker.vue";
import { onMounted, ref } from "vue";
import { getTheme, setTheme, type Theme } from "@/settings/theme";
import SimpleButton from "@/components/common/SimpleButton.vue";

useHead({
  title: "Settings",
  meta: [{ name: "robots", content: "noindex" }],
});

const theme = ref<Theme>();
onMounted(() => {
  theme.value = getTheme();
});

function handleThemeChange(newTheme: Theme) {
  setTheme(newTheme);
}
function handleReset() {
  if (confirm("This cannot be undone. Reset all settings?")) {
    localStorage.clear();
    location.reload();
  }
}
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
      <Picker
        group="theme"
        :options="[
          { theme: 'auto' as const, name: 'Auto' },
          { theme: 'light' as const, name: 'Light' },
          { theme: 'dark' as const, name: 'Dark' },
        ]"
        :keyify="(option) => option.theme"
        :modelValue="theme"
        @update:modelValue="handleThemeChange"
        class="theme-picker"
      >
        <template v-slot="slotProps">
          <p>{{ slotProps.data.name }}</p>
        </template>
      </Picker>
    </div>
    <div class="section">
      <h2>Reset</h2>
      <p>Reset all settings and clear the cached network data.</p>
      <SimpleButton
        class="reset-button"
        :content="{ icon: 'uil:redo', text: 'Reset' }"
        layout="traditional-wide"
        theme="filled"
        @click="handleReset"
      ></SimpleButton>
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

  &:last-child {
    margin-bottom: 2rem;
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
.reset-button {
  --color-accent: var(--color-error);
  align-self: flex-start;
}
</style>
