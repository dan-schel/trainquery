<script setup lang="ts">
import { computed, ref } from "vue";
import { disruptionToMarkdown } from "../extract-summary";
import { getConfig } from "@/utils/get-config";
import { parseMarkdown } from "@/utils/parse-markdown";
import type { RejectedExternalDisruption } from "shared/disruptions/external/rejected-external-disruption";
import SimpleButton from "@/components/common/SimpleButton.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { useRouter } from "vue-router";
import { formatDateTime } from "shared/qtime/format";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";

const { callAdminApi } = useAdminAuth();
const router = useRouter();

const props = defineProps<{
  rejected: RejectedExternalDisruption;
}>();

const disruptionHtml = computed(() => {
  return parseMarkdown(
    disruptionToMarkdown(getConfig(), props.rejected.disruption),
    {
      useClassesOverSemanticHtml: true,
    },
  );
});

const deleteDate = computed(() => {
  return props.rejected.deleteAt != null
    ? toLocalDateTimeLuxon(getConfig(), props.rejected.deleteAt)
    : null;
});

const resurfaceText = computed(() => {
  return props.rejected.resurfaceIfUpdated
    ? "This disruption will return to the inbox if it's content changes."
    : "This disruption is rejected permanently.";
});

const restoring = ref<boolean>(false);

async function handleRestore() {
  restoring.value = true;
  try {
    await callAdminApi(
      "/api/admin/disruptions/rejected/restore",
      {
        action: JSON.stringify({
          restore: props.rejected.id,
        }),
      },
      true,
    );

    // Now that it's restored, the admin can start processing right away.
    // Use "replace" so that the back button doesn't lead back to this page
    // (whichwould just give a not found error).
    router.replace({
      name: "admin-disruptions-process",
      params: { id: props.rejected.id },
    });
  } catch (err) {
    // TODO: A toast notification?
    console.warn("Failed to restore disruption.", err);
  }
  restoring.value = false;
}
</script>

<template>
  <div class="workspace">
    <section class="incoming" v-html="disruptionHtml"></section>
    <div class="notice delete-notice" v-if="deleteDate != null">
      <p>
        {{ getConfig().frontend.appName }}'s disruption sources no longer list
        this disruption. Unless it reappears, it will be deleted from the
        rejection list on {{ formatDateTime(deleteDate) }}.
      </p>
      <p>
        {{ resurfaceText }}
      </p>
    </div>
    <div class="notice restore-notice" v-else>
      <p>
        {{ resurfaceText }}
      </p>
      <div class="flex-grow"></div>
      <SimpleButton
        class="restore-button"
        :content="{
          icon: 'uil:redo',
          text: rejected.resurfaceIfUpdated ? 'Restore now' : 'Restore',
        }"
        theme="filled"
        layout="traditional-wide"
        :loading="restoring"
        @click="handleRestore"
      ></SimpleButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.workspace {
  flex-grow: 1;
  margin-bottom: 2rem;
  gap: 1rem;
}
.incoming {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  padding: 1.25rem 1rem;
  gap: 1rem;

  :deep(.h1) {
    @include utils.h3;
  }
}
.notice {
  @include utils.raised-surface;

  border-radius: 0.75rem;
  padding: 1rem 1rem;

  p {
    flex-shrink: 1;
  }
}
.delete-notice {
  gap: 1rem;
}
.flex-grow {
  @include template.flex-grow;
  height: 1rem;
  width: 1rem;
}

// Desktop layout.
@media screen and (min-width: 48rem) {
  .restore-notice {
    @include template.row;
  }
}
// Mobile layout.
@media screen and (max-width: 47.999rem) {
  .restore-button {
    align-self: flex-start;
  }
}
</style>
