<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { RejectedExternalDisruption } from "shared/disruptions/external/rejected-external-disruption";
import AsyncData, { type AsyncState } from "@/components/common/AsyncData.vue";
import Workspace from "./Workspace.vue";
import { disruptionRejectedSingleApi } from "shared/api/admin/disruptions-api";
import { toExternalDisruptionID } from "shared/system/ids";

const route = useRoute();
const disruptionID = route.params.id as string;

const { callAdminApi } = useAdminAuth();
const state = ref<
  AsyncState<{
    rejected: RejectedExternalDisruption;
  }>
>("loading");

async function handleMounted() {
  state.value = "loading";

  const response = await callAdminApi(disruptionRejectedSingleApi, {
    id: toExternalDisruptionID(disruptionID),
  });

  if (response.type === "success") {
    if ("notFound" in response.data) {
      state.value = "not-found";
    } else {
      state.value = { data: response.data };
    }
  } else if (response.type === "error") {
    console.warn("Failed to fetch disruptions.", response.error);
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
