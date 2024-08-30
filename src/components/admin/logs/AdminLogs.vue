<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { z } from "zod";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";
import { AdminLog, AdminLogWindow } from "shared/admin/logs";
import { formatDateTime } from "shared/qtime/format";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import { getConfig } from "@/utils/get-config";

const { callAdminApiLegacy } = useAdminAuth();

// TODO: Implement scrolling to load more logs, a refresh button, filtering
// by service, and viewing the logs of other instances.

const logs = ref<AdminLog[]>([]);
const state = ref<"loading" | "error" | "success">("loading");

async function handleMounted() {
  const schema = z.object({
    logWindow: AdminLogWindow.json,
    availableInstances: z.string().array(),
  });

  state.value = "loading";
  try {
    const response = await callAdminApiLegacy("/api/admin/logs", {
      count: "100",
    });
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
    <div class="logs">
      <div class="flex-grow"></div>
      <div v-for="log in logs" :key="log.sequence" class="log">
        <p class="main">
          {{ log.message }}
        </p>
        <p class="metadata">
          <template v-if="log.service != null"
            ><b>{{ log.service }}</b
            >&ensp;•&ensp;</template
          >{{
            formatDateTime(toLocalDateTimeLuxon(getConfig(), log.timestamp), {
              includeSeconds: true,
            })
          }}
        </p>
      </div>
    </div>
  </PageContent>
  <AdminRequestState v-else title="Logs" :state="state" v-bind="$attrs">
  </AdminRequestState>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.logs {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  flex-grow: 1;
  margin-bottom: 2rem;
  --line-spacing: 0.5em;
  overflow: scroll;
  height: 20rem;

  .flex-grow {
    @include template.flex-grow;
  }
  .log {
    padding: 0.75rem 1rem;
    .main {
      font-family: "Fira Code", monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      margin-bottom: 0.5rem;
    }
    .metadata {
      font-size: 0.6rem;
      color: var(--color-ink-50);
    }
    &:nth-child(2n) {
      background-color: var(--color-paper-30);
    }
  }
}
</style>
