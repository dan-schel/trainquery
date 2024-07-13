<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AdminRequestState from "@/components/admin/AdminRequestState.vue";
import { z } from "zod";
import { parseMarkdown } from "@/utils/parse-markdown";
import { getConfig } from "@/utils/get-config";
import { disruptionToMarkdown } from "./extract-summary";
import { ExternalDisruptionInInbox } from "shared/disruptions/external/external-disruption-in-inbox";
import SimpleButton from "@/components/common/SimpleButton.vue";
import OutgoingDisruption from "./OutgoingDisruption.vue";
import { Disruption } from "shared/disruptions/processed/disruption";
import { toDisruptionID, toLineID } from "shared/system/ids";
import { GenericLineDisruptionData } from "shared/disruptions/processed/types/generic-line";
import { QUtcDateTime } from "shared/qtime/qdatetime";
import UilAngleRight from "@/components/icons/UilAngleRight.vue";
import UilAngleDown from "@/components/icons/UilAngleDown.vue";

const { callAdminApi } = useAdminAuth();
const route = useRoute();

const encodedDisruptionID = route.params.id as string;
const disruption = ref<ExternalDisruptionInInbox | null>(null);
const state = ref<"loading" | "error" | "success" | "not-found">("loading");

const testOutgoingDisruption = new Disruption(
  toDisruptionID("id"),
  new GenericLineDisruptionData(
    "Buses replace trains between Westall and East Pakenham",
    [toLineID(5)],
    QUtcDateTime.parse("2024-07-13T00:00:00Z"),
    QUtcDateTime.parse("2024-07-13T10:00:00Z"),
  ),
  "provisional",
  [],
  [],
);
const testOutgoingDisruption2 = new Disruption(
  toDisruptionID("id"),
  new GenericLineDisruptionData(
    "Buses replace trains between Westall and East Pakenham",
    [toLineID(5)],
    QUtcDateTime.parse("2024-07-13T00:00:00Z"),
    QUtcDateTime.parse("2024-07-13T10:00:00Z"),
  ),
  "curated",
  [],
  [],
);

const disruptionHtml = computed(() => {
  if (disruption.value == null) {
    return null;
  }
  return parseMarkdown(
    disruptionToMarkdown(getConfig(), disruption.value.disruption),
    {
      useClassesOverSemanticHtml: true,
    },
  );
});

async function handleMounted() {
  const schema = z.object({
    disruption: ExternalDisruptionInInbox.json,
  });
  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions/inbox/single", {
      id: encodedDisruptionID,
    });
    const data = await response.json();
    const parsed = schema.parse(data);
    disruption.value = parsed.disruption;
    if (parsed.disruption == null) {
      state.value = "not-found";
    } else {
      state.value = "success";
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
  <PageContent
    v-if="state === 'success'"
    title="Process disruption"
    title-margin="2rem"
    v-bind="$attrs"
  >
    <div class="columns">
      <section class="incoming" v-html="disruptionHtml"></section>
      <div class="arrow-locator">
        <div class="arrow">
          <UilAngleDown class="down"></UilAngleDown>
          <UilAngleRight class="right"></UilAngleRight>
        </div>
      </div>
      <section class="outgoing">
        <div class="toolbar">
          <SimpleButton
            :content="{ icon: 'uil:plus', text: 'New' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:ban', text: 'Reject' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:paperclip', text: 'Attach' }"
            layout="tile-wide"
            theme="filled-neutral"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:redo', text: 'Reset' }"
            layout="tile-wide"
            theme="filled-neutral"
            disabled
          ></SimpleButton>
        </div>
        <div class="outgoing-list">
          <OutgoingDisruption
            :disruption="testOutgoingDisruption"
            :formerly-provisional="false"
          ></OutgoingDisruption>
          <OutgoingDisruption
            :disruption="testOutgoingDisruption2"
            :formerly-provisional="true"
          ></OutgoingDisruption>
          <OutgoingDisruption
            :disruption="testOutgoingDisruption2"
            :formerly-provisional="false"
          ></OutgoingDisruption>
        </div>
        <div class="bottom">
          <SimpleButton
            :content="{ icon: 'uil:check', text: 'Apply' }"
            layout="traditional-wide"
            theme="filled"
            disabled
          ></SimpleButton>
        </div>
      </section>
    </div>
  </PageContent>
  <AdminRequestState
    v-else
    title="Process disruption"
    :state="state"
    v-bind="$attrs"
  >
  </AdminRequestState>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.spinner {
  margin: auto;
}
.error {
  font-weight: bold;
  color: var(--color-error);
}

.columns {
  flex-grow: 1;
  margin-bottom: 2rem;
}
.incoming,
.outgoing {
  @include utils.raised-surface;
  border-radius: 0.75rem;
}
.incoming {
  padding: 1.25rem 1rem;
  gap: 1rem;

  :deep(.h1) {
    @include utils.h3;
  }
}
.outgoing {
  // For the arrow.
  position: relative;
}
.toolbar {
  @include template.row;
  gap: 0.5rem;
  margin: 1rem;
  margin-bottom: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-ink-20);
}
.outgoing-list {
  flex-grow: 1;
  padding: 1rem;
  gap: 0.5rem;
}
.bottom {
  @include template.row;
  gap: 0.5rem;
  margin: 1rem;
  margin-top: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-ink-20);
  justify-content: flex-end;
}
.arrow-locator {
  position: relative;
  width: 1rem;
  height: 1rem;
  align-self: center;
  justify-self: center;
  z-index: 99;
}
.arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @include utils.raised-surface;
  border-radius: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;

  align-items: center;
  justify-content: center;

  svg {
    font-size: 2rem;
  }
}

// Desktop layout.
@media screen and (min-width: 48rem) {
  .columns {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    height: 0;
  }
  .incoming {
    overflow-y: scroll;
  }
  .outgoing-list {
    overflow-y: scroll;
    height: 0;
  }
  .arrow .down {
    @include template.gone;
  }
}

// Mobile layout.
@media screen and (max-width: 47.999rem) {
  .arrow {
    left: 50%;
  }
  .arrow .right {
    @include template.gone;
  }
}
</style>
