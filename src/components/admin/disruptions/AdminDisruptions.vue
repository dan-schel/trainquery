<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import Picker from "@/components/common/Picker.vue";
import { ref } from "vue";
import InboxFeed from "./InboxFeed.vue";

type Tab = "inbox" | "updated" | "curation" | "handled";
const tabs = [
  { value: "inbox" as const, name: "Inbox" },
  { value: "updated" as const, name: "Updated" },
  { value: "curation" as const, name: "Curation" },
  { value: "handled" as const, name: "Handled" },
];

const currentTab = ref<Tab>("inbox");
</script>

<template>
  <PageContent title="Disruptions" title-margin="2rem" v-bind="$attrs">
    <Picker
      group="tab"
      :options="tabs"
      :keyify="(option) => option.value"
      v-model="currentTab"
      class="tabs"
    >
      <template v-slot="slotProps">
        <p>{{ slotProps.data.name }}</p>
      </template>
    </Picker>

    <InboxFeed v-if="currentTab === 'inbox'" />
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
    height: 2rem;
    padding: 0 1.5rem;
  }
}
</style>
