<script setup lang="ts" generic="T, K extends string">
const props = defineProps<{
  group: string;
  options: T[];
  keyify: (option: T) => K;
  modelValue?: K;
  contentClass?: string;
}>();

defineEmits<{
  (e: "update:modelValue", newValue: K): void;
}>();

const isSelected = (option: T) => {
  if (props.modelValue == null) {
    return false;
  }
  return props.keyify(option) == props.modelValue;
};
</script>

<template>
  <div class="group">
    <label v-for="option in options" :key="keyify(option)">
      <input
        type="radio"
        :name="group"
        autocomplete="off"
        :checked="isSelected(option)"
        @change="() => $emit('update:modelValue', keyify(option))"
      />
      <div class="content" :class="contentClass">
        <slot :data="option"></slot>
      </div>
    </label>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.group {
  @include template.picker-cupertino($content-class: "content");
}
</style>
