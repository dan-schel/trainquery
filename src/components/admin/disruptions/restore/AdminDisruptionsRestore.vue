<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { z } from "zod";
import { RejectedExternalDisruption } from "shared/disruptions/external/rejected-external-disruption";
import AsyncData, { type AsyncState } from "@/components/common/AsyncData.vue";
import Workspace from "./Workspace.vue";

const ResponseSchema = z.object({
  rejected: RejectedExternalDisruption.json,
});

const route = useRoute();
const encodedDisruptionID = route.params.id as string;

const { callAdminApiLegacy } = useAdminAuth();
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
    const response = await callAdminApiLegacy(
      "/api/admin/disruptions/rejected/single",
      {
        id: encodedDisruptionID,
      },
    );
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
  <PageContent title="Rejected disruption" title-margin="2rem" v-bind="$attrs">
    <AsyncData :state="state">
      <template #default="{ data }">
        <Workspace :rejected="data.rejected" />
      </template>
    </AsyncData>
  </PageContent>
</template>

<style scoped lang="scss"></style>
