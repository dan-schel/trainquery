<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { z } from "zod";
import { ExternalDisruptionInInbox } from "shared/disruptions/external/external-disruption-in-inbox";
import { Disruption } from "shared/disruptions/processed/disruption";
import AsyncData, { type AsyncState } from "@/components/common/AsyncData.vue";
import Workspace from "./Workspace.vue";

const ResponseSchema = z.object({
  inbox: ExternalDisruptionInInbox.json,
  provisional: Disruption.json.array(),
});

const route = useRoute();
const encodedDisruptionID = route.params.id as string;

const { callAdminApi } = useAdminAuth();
const state = ref<AsyncState<z.infer<typeof ResponseSchema>>>("loading");

async function handleMounted() {
  const schema = z.union([
    ResponseSchema,
    z.object({
      notFound: z.literal(true),
    }),
  ]);
  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions/inbox/single", {
      id: encodedDisruptionID,
    });
    const raw = await response.json();
    const parsed = schema.parse(raw);
    if ("notFound" in parsed) {
      state.value = "not-found";
    } else {
      state.value = { data: parsed };
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
  <PageContent title="Process disruption" title-margin="2rem" v-bind="$attrs">
    <AsyncData :state="state">
      <template #default="{ data }">
        <Workspace :inbox="data.inbox" :provisional="data.provisional" />
      </template>
    </AsyncData>
  </PageContent>
</template>

<style scoped lang="scss"></style>
