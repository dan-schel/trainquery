<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import Picker from "@/components/common/Picker.vue";
import { ref } from "vue";
import InboxFeed from "./InboxFeed.vue";

type Tab = "inbox" | "updated" | "curated" | "rejected";
const tabs: { value: Tab; name: string }[] = [
  { value: "inbox" as const, name: "Inbox" },
  { value: "updated" as const, name: "Updated" },
  { value: "curated" as const, name: "Curated" },
  { value: "rejected" as const, name: "Rejected" },
];
const tabCounts: Record<Tab, number> = {
  inbox: 0,
  updated: 0,
  curated: 0,
  rejected: 0,
};

const currentTab = ref<Tab>("inbox");
</script>

<template>
  <PageContent title="Disruptions" title-margin="1.5rem" v-bind="$attrs">
    <Picker
      group="tab"
      :options="tabs"
      :keyify="(option) => option.value"
      v-model="currentTab"
      theme="tabs"
      class="tabs"
    >
      <template v-slot="slotProps">
        <p>{{ slotProps.data.name }}</p>
        <p class="count" v-if="tabCounts[slotProps.data.value] !== 0">
          {{ tabCounts[slotProps.data.value] }}
        </p>
      </template>
    </Picker>

    <InboxFeed v-if="currentTab === 'inbox'" />
    <p v-if="currentTab === 'updated'" class="not-implemented">
      The updated feed is not implemented yet!
    </p>
    <p v-if="currentTab === 'curated'" class="not-implemented">
      The curated list is not implemented yet!
    </p>
    <p v-if="currentTab === 'rejected'" class="not-implemented">
      The rejection bin is not implemented yet!
    </p>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.tabs {
  align-self: flex-start;
  margin-bottom: 1rem;
  :deep(.content) {
    @include template.content-text;
    @include template.row;
    gap: 0.5rem;
    height: 2rem;
    padding: 0 0rem;

    .count {
      background-color: var(--color-accent);
      color: var(--color-on-accent);
      font-weight: bold;
      padding: 0.15rem 0.3rem;
      min-width: 1.25rem;
      text-align: center;
      border-radius: 1rem;
      font-size: 0.8rem;
    }
  }
}
.not-implemented {
  margin-top: 1rem;
}
</style>
