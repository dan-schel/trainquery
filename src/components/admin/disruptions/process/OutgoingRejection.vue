<script setup lang="ts">
import Switch from "@/components/common/Switch.vue";
import UilBan from "@/components/icons/UilBan.vue";

defineProps<{
  resurfaceIfUpdated: boolean;
}>();
const emit = defineEmits<{
  (e: "update:resurfaceIfUpdated", newValue: boolean): void;
}>();
</script>

<template>
  <div class="card">
    <UilBan></UilBan>
    <p class="title">Disruption rejected</p>
    <Switch
      class="switch"
      :modelValue="resurfaceIfUpdated"
      @update:modelValue="emit('update:resurfaceIfUpdated', $event)"
    >
      <p>Resurface disruption if updated</p>
    </Switch>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.card {
  @include utils.disruption-card;
  padding: 1rem;
  gap: 0.5rem;
  align-items: center;
}
svg {
  font-size: 1.5rem;
}
.title {
  @include utils.h3;
  margin-bottom: 1rem;
}
.switch p {
  margin-left: 1rem;
}
</style>
