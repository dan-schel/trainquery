<script setup lang="ts">
import { type SerializedDisruption } from "../../../shared/disruptions/serialized-disruption";
import Icon from "../icons/Icon.vue";

defineProps<{
  disruptions: SerializedDisruption[];
}>();
</script>

<template>
  <div class="disruptions">
    <div v-for="(disruption, i) in disruptions" :key="i" class="disruption">
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
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.disruptions {
  gap: 0.5rem;
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
