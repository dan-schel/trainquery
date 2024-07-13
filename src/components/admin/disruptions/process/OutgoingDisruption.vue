<script setup lang="ts">
import SimpleButton from "@/components/common/SimpleButton.vue";
import { Disruption } from "shared/disruptions/processed/disruption";
import { computed } from "vue";

const props = defineProps<{
  disruption: Disruption;
  formerlyProvisional: boolean;
}>();
defineEmits<{
  (e: "approve"): void;
  (e: "delete"): void;
}>();

const provisionality = computed(() => {
  if (props.disruption.state === "provisional") {
    return "currently";
  } else if (props.formerlyProvisional) {
    return "formerly";
  } else {
    return "not";
  }
});
</script>

<template>
  <div
    class="disruption"
    :class="{ provisional: provisionality === 'currently' }"
  >
    <h2>I'm a disruption!</h2>
    <p>
      This is some more detail about me. Hope it's enough to cause some text
      wrapping.
    </p>

    <div class="actions">
      <SimpleButton
        class="delete-button"
        :content="{
          icon: 'uil:times',
          text: disruption.state === 'provisional' ? 'Dismiss' : 'Remove',
        }"
        layout="traditional-wide"
        theme="filled-neutral"
        @click="() => $emit('delete')"
      ></SimpleButton>
      <SimpleButton
        class="approve-button"
        v-if="provisionality !== 'not'"
        :content="{
          icon: 'uil:check',
          text: disruption.state === 'provisional' ? 'Approve' : 'Approved',
        }"
        layout="traditional-wide"
        theme="filled"
        @click="() => $emit('approve')"
        :disabled="provisionality === 'formerly'"
      ></SimpleButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

h2 {
  @include utils.h3;
}
.disruption {
  @include utils.disruption-card;
  padding: 1rem;
  gap: 1rem;

  &.provisional {
    @include utils.disruption-card($dashed: true);
  }
}
.actions {
  @include template.row;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
