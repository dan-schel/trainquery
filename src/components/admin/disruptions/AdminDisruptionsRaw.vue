<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";
import { z } from "zod";
import { parseMarkdown } from "@/utils/parse-markdown";

const { callAdminApi } = useAdminAuth();
const route = useRoute();

const encodedDisruptionID = route.params.id as string;
const disruption = ref<{
  markdown: string;
} | null>(null);
const state = ref<"loading" | "error" | "success" | "not-found">("loading");

const disruptionHtml = computed(() => {
  if (disruption.value == null) {
    return null;
  }
  return parseMarkdown(disruption.value.markdown, {
    useClassesOverSemanticHtml: true,
  });
});

async function handleMounted() {
  const schema = z.object({
    disruption: z
      .object({
        markdown: z.string(),
      })
      .nullable(),
  });
  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions/raw", {
      id: encodedDisruptionID,
    });
    const data = await response.json();
    const parsed = schema.parse(data);
    disruption.value = parsed.disruption;
    if (parsed.disruption == null) {
      state.value = "not-found";
    } else {
      state.value = "success";
    }
  } catch (e) {
    console.warn("Failed to fetch disruptions.", e);
    state.value = "error";
  }
}

onMounted(() => {
  handleMounted();
});
</script>

<template>
  <PageContent
    v-if="state === 'success'"
    title="Process disruption"
    title-margin="2rem"
    v-bind="$attrs"
  >
    <section class="markdown" v-html="disruptionHtml"></section>
  </PageContent>
  <AdminRequestState
    v-else
    title="Process disruption"
    :state="state"
    v-bind="$attrs"
  >
  </AdminRequestState>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.spinner {
  margin: auto;
}
.error {
  font-weight: bold;
  color: var(--color-error);
}

.markdown {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  padding: 1.25rem 1rem;
  gap: 1rem;

  :deep(.h1) {
    @include utils.h3;
  }
}
</style>
