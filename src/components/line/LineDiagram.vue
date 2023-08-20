<script setup lang="ts">
import { type LineDiagramData } from "../../../shared/system/routes/line-routes";

defineProps<{
  diagram: LineDiagramData;
}>();
</script>

<template>
  <div class="diagram">
    <div class="stop" v-for="stop of diagram.loop" :key="stop">
      <slot name="stop" :stop="stop"></slot>
    </div>
    <div class="stop" v-for="stop of diagram.stops" :key="stop">
      <slot name="stop" :stop="stop"></slot>
    </div>
    <div class="stop" v-for="stop of diagram.firstBranch" :key="stop">
      <slot name="stop" :stop="stop"></slot>
    </div>
    <div class="stop" v-for="stop of diagram.secondBranch" :key="stop">
      <slot name="stop" :stop="stop"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.diagram {
  padding: 1rem 0rem;
}
.stop:not(:last-child) {
  margin-bottom: 0.5rem;
}
</style>
