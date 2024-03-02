<script setup lang="ts">
import { useBanners } from "@/utils/banners-provider";
import { parseInlineMarkdown } from "@/utils/parse-markdown";
import { computed } from "vue";

const banners = useBanners();
const bannersHtml = computed(() => {
  return banners.value.map((b) => ({
    ...b,
    messageHtml: parseInlineMarkdown(b.messageMarkdown),
  }));
});
</script>

<template>
  <div class="banners">
    <div class="banner" v-for="(banner, i) in bannersHtml" :key="i">
      <div class="banner-content">
        <p v-html="banner.messageHtml"></p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.banners {
  padding-top: 3rem;
}
.banner {
  @include template.page-centerer;
  @include utils.shadow;
  background-color: var(--color-banner-bg);

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-ink-20);
  }

  .banner-content {
    padding: 0.5rem 1rem;
    p {
      color: var(--color-banner-text);
      :deep(a) {
        font-weight: bold;
        --color-accent: var(--color-banner-text);
      }
    }
  }
}
</style>
