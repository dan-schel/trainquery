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
      <svg
        class="switch-graphic"
        viewBox="0 0 32 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="a">
            <rect width="32" height="20" rx="10" />
          </clipPath>
        </defs>
        <rect
          width="32"
          height="20"
          rx="10"
          stroke-width="4"
          clip-path="url(#a)"
        />
        <circle r="1" />
      </svg>
      <div class="switch-content">
        <slot></slot>
      </div>
    </div>
  </label>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.switch {
  @include template.checkbox-switch-svg(
    $graphic-class: "switch-graphic",
    $content-class: "switch-content"
  );
  .switch-content {
    @include template.content-text;
  }
}
</style>
