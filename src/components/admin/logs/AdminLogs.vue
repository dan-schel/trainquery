<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { z } from "zod";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";
import { AdminLog, AdminLogWindow } from "shared/admin/logs";

const { callAdminApi } = useAdminAuth();

const logs = ref<AdminLog[]>([]);
const state = ref<"loading" | "error" | "success">("loading");

async function handleMounted() {
  const schema = z.object({
    logWindow: AdminLogWindow.json,
    availableInstances: z.string().array(),
  });

  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/logs", {});
    const data = await response.json();
    const parsed = schema.parse(data);
    logs.value = parsed.logWindow.logs;
    state.value = "success";
  } catch (e) {
    console.warn("Failed to fetch logs.", e);
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
    title="Logs"
    title-margin="1rem"
    v-bind="$attrs"
  >
    <p>Logs viewer is not implemented yet!</p>
  </PageContent>
  <AdminRequestState v-else title="Logs" :state="state" v-bind="$attrs">
  </AdminRequestState>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
