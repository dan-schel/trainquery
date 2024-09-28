<script setup lang="ts">
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { z } from "zod";
import { extractSummaryFromDisruption } from "@/components/admin/disruptions/extract-summary";
import UilCheckCircle from "@/components/icons/UilCheckCircle.vue";
import AsyncData from "@/components/common/AsyncData.vue";
import { RejectedExternalDisruption } from "shared/disruptions/external/rejected-external-disruption";

const { callAdminApi } = useAdminAuth();

const emit = defineEmits<{
  (e: "updateCounts", newCounts: { inbox: number; updated: number }): void;
}>();

const state = ref<"loading" | "error" | { data: RejectedExternalDisruption[] }>(
  "loading",
);

async function handleMounted() {
  const schema = z.object({
    rejected: RejectedExternalDisruption.json.array(),
    counts: z.object({
      inbox: z.number(),
      updated: z.number(),
    }),
  });

  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions/rejected", {});
    const data = await response.json();
    const parsed = schema.parse(data);
    state.value = { data: parsed.rejected };
    emit("updateCounts", parsed.counts);
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
  <div class="disruptions">
    <AsyncData :state="state">
      <template #default="{ data }">
        <RouterLink
          v-for="(disruption, i) in data"
          :key="i"
          class="disruption"
          :class="{ delete: disruption.deleteAt != null }"
          :to="{
            name: 'admin-disruptions-restore',
            params: { id: disruption.id },
          }"
        >
          <p class="disruption-message">
            {{ extractSummaryFromDisruption(disruption.disruption) }}
          </p>
          <p class="delete-badge" v-if="disruption.deleteAt != null">
            Awaiting deletion
          </p>
        </RouterLink>

        <div class="empty" v-if="data.length === 0">
          <UilCheckCircle></UilCheckCircle>
          <p>No rejected disruptions</p>
        </div>
      </template>
    </AsyncData>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.disruptions {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  flex-grow: 1;
  margin-bottom: 2rem;
}
.disruption {
  @include template.button-hover;
  --button-rounding: 0;

  padding: 1rem;
  gap: 0.5rem;

  // For the divider.
  position: relative;

  // The divider
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 1rem;
    right: 1rem;
    border-bottom: 1px solid var(--color-ink-20);
  }
}
.disruption-message {
  font-size: 0.8rem;
  font-stretch: semi-condensed;
}
.disruption.delete .disruption-message {
  text-decoration: line-through;
}
.delete-badge {
  background-color: var(--color-ink-60);
  color: var(--color-on-accent);
  align-self: flex-start;
  padding: 0.15rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
}
.empty {
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 1rem;
  svg {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  p {
    text-align: center;
  }
}
</style>
