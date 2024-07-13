<script setup lang="ts">
import { ExternalDisruptionInInbox } from "shared/disruptions/external/external-disruption-in-inbox";
import { Disruption } from "shared/disruptions/processed/disruption";
import { computed, ref } from "vue";
import { disruptionToMarkdown } from "../extract-summary";
import { getConfig } from "@/utils/get-config";
import { parseMarkdown } from "@/utils/parse-markdown";
import UilAngleDown from "@/components/icons/UilAngleDown.vue";
import UilAngleRight from "@/components/icons/UilAngleRight.vue";
import SimpleButton from "@/components/common/SimpleButton.vue";
import OutgoingDisruption from "./OutgoingDisruption.vue";
import OutgoingRejection from "./OutgoingRejection.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { useRouter } from "vue-router";

const { callAdminApi } = useAdminAuth();
const router = useRouter();

const props = defineProps<{
  inbox: ExternalDisruptionInInbox;
  provisional: Disruption[];
}>();

const disruptionHtml = computed(() => {
  return parseMarkdown(
    disruptionToMarkdown(getConfig(), props.inbox.disruption),
    {
      useClassesOverSemanticHtml: true,
    },
  );
});

const isRejected = ref<boolean>(false);
const resurfaceIfUpdated = ref<boolean>(true);
const submitting = ref<boolean>(false);

function handleReject() {
  isRejected.value = true;
}

function handleReset() {
  isRejected.value = false;
  resurfaceIfUpdated.value = true;
}

async function handleApply() {
  submitting.value = true;
  try {
    await callAdminApi(
      "/api/admin/disruptions/inbox/process",
      {
        action: JSON.stringify({
          reject: {
            disruption: props.inbox.disruption,
            resurfaceIfUpdated: resurfaceIfUpdated.value,
          },
        }),
      },
      true,
    );
    router.push({ name: "admin-disruptions" });
  } catch (err) {
    console.warn("Failed to process disruption.", err);
  }
  submitting.value = false;
}
</script>

<template>
  <div class="workspace">
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
          layout="traditional-wide"
          theme="filled"
          disabled
        ></SimpleButton>
        <SimpleButton
          :content="{ icon: 'uil:ban', text: 'Reject' }"
          @click="handleReject"
        ></SimpleButton>
        <SimpleButton
          :content="{
            icon: 'material-symbols:call-merge-rounded',
            text: 'Merge',
          }"
          disabled
        ></SimpleButton>
        <div class="flex-grow"></div>
        <SimpleButton
          :content="{ icon: 'uil:redo', altText: 'Reset' }"
          @click="handleReset"
        ></SimpleButton>
      </div>
      <div class="outgoing-list">
        <OutgoingRejection
          v-if="isRejected"
          v-model:resurface-if-updated="resurfaceIfUpdated"
        ></OutgoingRejection>
        <template v-else>
          <OutgoingDisruption
            v-for="d in provisional"
            :key="d.id"
            :disruption="d"
            :formerly-provisional="false"
          ></OutgoingDisruption>
          <p v-if="provisional.length == 0" class="empty">
            No provisional disruptions are in effect.
          </p>
        </template>
      </div>
      <div class="bottom">
        <SimpleButton
          :content="{ icon: 'uil:check', text: 'Apply' }"
          layout="traditional-wide"
          theme="filled"
          :loading="submitting"
          :disabled="!isRejected"
          @click="handleApply"
        ></SimpleButton>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.workspace {
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
  margin: 1rem;
  margin-bottom: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-ink-20);

  > :first-child {
    margin-right: 0.5rem;
  }
  .flex-grow {
    @include template.flex-grow;
  }
}
.outgoing-list {
  flex-grow: 1;
  padding: 1rem;
  gap: 0.5rem;
}
.empty {
  margin: 1rem 0;
  text-align: center;
  font-style: italic;
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
  .workspace {
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
