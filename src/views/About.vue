<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import Icon from "@/components/icons/Icon.vue";
import { parseMarkdown } from "@/utils/parse-markdown";
import { useHead } from "@vueuse/head";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { z } from "zod";

const route = useRoute();

const innerHTML = computed(() => {
  const metaSchema = z.object({
    state: z.object({
      aboutMarkdown: z.string(),
    }),
  });
  const meta = metaSchema.parse(route.meta);
  return parseMarkdown(meta.state.aboutMarkdown);
});

useHead({
  title: "About",
});
</script>

<template>
  <PageContent :title="null">
    <div class="markdown" v-html="innerHTML"></div>
    <div class="see-also">
      <a href="https://github.com/schel-d/trainquery">
        <Icon id="uil:github"></Icon>
        <p>Check out TrainQuery on GitHub</p>
      </a>
      <RouterLink :to="{ name: 'about-legal' }">
        <Icon id="uil:info-circle"></Icon>
        <p>Licences and attribution</p>
      </RouterLink>
    </div>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.markdown :deep(h1) {
  @include utils.h1;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.markdown :deep(h2) {
  @include utils.h2;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.markdown :deep(p) {
  margin-bottom: 1rem;
}
.markdown {
  margin-bottom: 1rem;
}
.see-also {
  gap: 0.5rem;
  margin-bottom: 2rem;

  > * {
    @include template.button-outlined;
    @include template.row;
    --button-outline: 2px;
    height: 3rem;
    padding: 0 1rem;
    gap: 0.5rem;

    .icon {
      font-size: 1.2rem;
    }
  }
}
</style>
