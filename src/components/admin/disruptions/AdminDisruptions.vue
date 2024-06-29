<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { z } from "zod";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";
import { extractSummaryFromDisruption } from "@/components/admin/disruptions/extract-summary";
import { ExternalDisruptionInInbox } from "shared/disruptions/external/external-disruption-in-inbox";
import UilCheckCircle from "@/components/icons/UilCheckCircle.vue";

const { callAdminApi } = useAdminAuth();

const inbox = ref<ExternalDisruptionInInbox[]>([]);
const state = ref<"loading" | "error" | "success">("loading");

async function handleMounted() {
  const schema = z.object({
    inbox: ExternalDisruptionInInbox.json.array(),
  });

  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions", {});
    const data = await response.json();
    const parsed = schema.parse(data);
    inbox.value = parsed.inbox;
    state.value = "success";
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
    title="Disruptions"
    title-margin="2rem"
    v-bind="$attrs"
  >
    <h2>Inbox ({{ inbox.length }})</h2>
    <div class="disruptions">
      <RouterLink
        v-for="(disruption, i) in inbox"
        :key="i"
        class="disruption"
        :to="{
          name: 'admin-disruptions-raw',
          params: { id: disruption.id },
        }"
      >
        <p>
          {{ extractSummaryFromDisruption(disruption.disruption) }}
        </p>
      </RouterLink>

      <div class="empty" v-if="inbox.length === 0">
        <UilCheckCircle></UilCheckCircle>
        <p>No disruptions awaiting processing</p>
      </div>
    </div>
  </PageContent>
  <AdminRequestState v-else title="Disruptions" :state="state" v-bind="$attrs">
  </AdminRequestState>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

h2 {
  @include utils.h2;
  margin-bottom: 1rem;
}
.disruptions {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  flex-grow: 1;
  margin-bottom: 2rem;
}
.disruption {
  @include template.button-hover;
  --button-rounding: 0;

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
.disruption > p {
  font-size: 0.8rem;
  margin: 1rem 1rem;
  font-stretch: semi-condensed;
}
.empty {
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 1rem;
  .icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  p {
    text-align: center;
  }
}
</style>
