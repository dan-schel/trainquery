<script setup lang="ts">
defineProps<{
  modelValue?: boolean;
}>();
defineEmits<{
  (e: "update:modelValue", newValue: boolean): void;
}>();
</script>

<template>
  <label class="switch">
    <input
      type="checkbox"
      autocomplete="off"
      :checked="modelValue"
      @change="
        (e) =>
          $emit('update:modelValue', (e.target as HTMLInputElement).checked)
      "
    />
    <div>
      <div class="switch-graphic"></div>
      <div class="switch-content">
        <slot></slot>
      </div>
    </div>
  </label>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.switch {
  @include template.checkbox-switch(
    $graphic-class: "switch-graphic",
    $content-class: "switch-content"
  );
  .switch-content {
    @include template.content-text;
  }
}
</style>
