<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";
import { z } from "zod";
import { parseMarkdown } from "@/utils/parse-markdown";
import { getConfig } from "@/utils/get-config";
import { disruptionToMarkdown } from "./extract-summary";
import { ExternalDisruptionInInbox } from "shared/disruptions/external/external-disruption-in-inbox";
import SimpleButton from "@/components/common/SimpleButton.vue";

const { callAdminApi } = useAdminAuth();
const route = useRoute();

const encodedDisruptionID = route.params.id as string;
const disruption = ref<ExternalDisruptionInInbox | null>(null);
const state = ref<"loading" | "error" | "success" | "not-found">("loading");

const disruptionHtml = computed(() => {
  if (disruption.value == null) {
    return null;
  }
  return parseMarkdown(
    disruptionToMarkdown(getConfig(), disruption.value.disruption),
    {
      useClassesOverSemanticHtml: true,
    },
  );
});

async function handleMounted() {
  const schema = z.object({
    disruption: ExternalDisruptionInInbox.json,
  });
  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions/inbox/single", {
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
    <div class="columns">
      <section class="incoming" v-html="disruptionHtml"></section>
      <section class="outgoing">
        <div class="toolbar">
          <SimpleButton
            :content="{ icon: 'uil:plus', text: 'New' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:ban', text: 'Reject' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:paperclip', text: 'Attach' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:redo', text: 'Reset' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
        </div>
        <div class="outgoing-list"></div>
        <div class="bottom">
          <SimpleButton
            :content="{ icon: 'uil:check', text: 'Approve' }"
            layout="traditional-wide"
            theme="filled"
          ></SimpleButton>
        </div>
      </section>
    </div>
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

.columns {
  gap: 1rem;
  flex-grow: 1;
  margin-bottom: 2rem;
}
.incoming,
.outgoing {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  padding: 1.25rem 1rem;
}
.incoming {
  gap: 1rem;

  :deep(.h1) {
    @include utils.h3;
  }
}
.toolbar {
  @include template.row;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-ink-20);
}
.outgoing-list {
  flex-grow: 1;
}
.bottom {
  @include template.row;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-ink-20);
  justify-content: flex-end;
}
@media screen and (min-width: 48rem) {
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
