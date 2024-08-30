<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import { z } from "zod";
import { StopIDJson, type StopID } from "shared/system/ids";
import { getConfig } from "@/utils/get-config";
import { requireStop } from "shared/system/config-utils";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";

const { callAdminApiLegacy } = useAdminAuth();

const reportData = ref<{
  unsupportedGtfsStopIDs: number[];
  unsupportedRoutes: StopID[][];
} | null>(null);
const state = ref<"loading" | "error" | "success">("loading");

async function handleMounted() {
  const schema = z.union([
    z.object({
      hasData: z.literal(true),
      unsupportedGtfsStopIDs: z.number().array(),
      unsupportedRoutes: StopIDJson.array().array(),
    }),
    z.object({
      hasData: z.literal(false),
    }),
  ]);

  state.value = "loading";
  try {
    const response = await callAdminApiLegacy("/api/admin/gtfs", {});
    const data = await response.json();
    const parsed = schema.parse(data);
    if (parsed.hasData) {
      reportData.value = {
        unsupportedGtfsStopIDs: parsed.unsupportedGtfsStopIDs,
        unsupportedRoutes: parsed.unsupportedRoutes,
      };
    } else {
      reportData.value = null;
    }
    state.value = "success";
  } catch (e) {
    console.warn("Failed to fetch GTFS data.", e);
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
    title="GTFS parsing"
    title-margin="2rem"
    v-bind="$attrs"
  >
    <p
      class="status"
      v-if="
        reportData != null &&
        reportData.unsupportedGtfsStopIDs.length === 0 &&
        reportData.unsupportedRoutes.length === 0
      "
    >
      No unsupported stop IDs or routes! 🎉
    </p>

    <template
      v-if="reportData != null && reportData.unsupportedGtfsStopIDs.length > 0"
    >
      <h2>
        Unsupported GTFS stop IDs ({{
          reportData.unsupportedGtfsStopIDs.length
        }})
      </h2>
      <ul class="stop-ids">
        <li
          v-for="(gtfsStopID, i) in reportData.unsupportedGtfsStopIDs"
          :key="i"
          class="stop-id"
        >
          <p>
            {{ gtfsStopID }}
          </p>
        </li>
      </ul>
    </template>

    <template
      v-if="reportData != null && reportData.unsupportedRoutes.length > 0"
    >
      <h2>Unsupported routes ({{ reportData.unsupportedRoutes.length }})</h2>
      <ul class="routes">
        <li
          v-for="(gtfsStopID, i) in reportData.unsupportedRoutes"
          :key="i"
          class="stop-id"
        >
          <p>
            {{
              gtfsStopID
                .map((x) => requireStop(getConfig(), x).name)
                .join(" → ")
            }}
          </p>
        </li>
      </ul>
    </template>
  </PageContent>
  <AdminRequestState v-else title="Disruptions" :state="state" v-bind="$attrs">
  </AdminRequestState>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.status {
  margin-top: -1rem;
}
h2 {
  @include utils.h2;
  margin-bottom: 1rem;
}
.stop-ids,
.routes {
  margin-bottom: 2rem;
  li {
    margin-left: 1rem;
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
