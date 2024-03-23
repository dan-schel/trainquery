<script setup lang="ts">
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import PageContent from "@/components/common/PageContent.vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";
import {
  DisruptionJson,
  type SerializedDisruption,
} from "shared/disruptions/serialized-disruption";
import { onMounted, ref } from "vue";
import { z } from "zod";
import Icon from "@/components/icons/Icon.vue";

const { callAdminApi } = useAdminAuth();

const currentDisruptions = ref<SerializedDisruption[]>([]);
const nonCurrentDisruptions = ref<SerializedDisruption[]>([]);
const state = ref<"loading" | "error" | "success">("loading");

async function handleMounted() {
  const schema = z.object({
    current: DisruptionJson.array(),
    nonCurrent: DisruptionJson.array(),
  });

  state.value = "loading";
  try {
    const response = await callAdminApi("/api/admin/disruptions", {});
    const data = await response.json();
    const parsed = schema.parse(data);
    currentDisruptions.value = parsed.current;
    nonCurrentDisruptions.value = parsed.nonCurrent;
    state.value = "success";
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
  <PageContent title="Disruptions" title-margin="2rem">
    <LoadingSpinner class="spinner" v-if="state === 'loading'" />
    <h2 v-if="currentDisruptions.length > 1">
      Current disruptions ({{ currentDisruptions.length }})
    </h2>
    <div class="disruptions" v-if="currentDisruptions.length > 1">
      <div
        v-for="(disruption, i) in currentDisruptions"
        :key="i"
        class="disruption"
      >
        <Icon id="uil:exclamation-circle"></Icon>
        <p>
          {{ disruption.message }}
        </p>
        <a
          v-if="disruption.url != null"
          class="disruption-url"
          title="Find out more"
          :href="disruption.url"
        >
          <Icon id="uil:external-link-alt"></Icon>
        </a>
      </div>
    </div>

    <h2 v-if="nonCurrentDisruptions.length > 1">
      Past/future disruptions ({{ nonCurrentDisruptions.length }})
    </h2>
    <div class="disruptions" v-if="nonCurrentDisruptions.length > 1">
      <div
        v-for="(disruption, i) in nonCurrentDisruptions"
        :key="i"
        class="disruption"
      >
        <Icon id="uil:exclamation-circle"></Icon>
        <p>
          {{ disruption.message }}
        </p>
        <a
          v-if="disruption.url != null"
          class="disruption-url"
          title="Find out more"
          :href="disruption.url"
        >
          <Icon id="uil:external-link-alt"></Icon>
        </a>
      </div>
    </div>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.disruptions {
  flex-grow: 1;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
h2 {
  @include utils.h2;
  margin-bottom: 1rem;
}
.spinner {
  margin: auto;
}
.disruption {
  @include utils.raised-surface;
  border-radius: 0.75rem;
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  grid-template-areas: "icon text link";
  align-items: center;
}
.disruption > .icon {
  color: var(--color-error);
  justify-self: center;
}
.icon {
  grid-area: icon;
  font-size: 1.2rem;
}
.disruption > p {
  grid-area: text;
  font-size: 0.8rem;
  margin: 0.75rem;
  margin-left: 0;
  font-stretch: semi-condensed;
}
.disruption-url {
  @include template.button-hover;
  @include template.content-text-icon;
  --button-rounding: 0;
  align-self: stretch;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  min-height: 2.5rem;
}
</style>
