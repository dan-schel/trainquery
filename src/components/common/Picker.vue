<script setup lang="ts" generic="T, K extends string">
export type PickerTheme = "cupertino" | "subtle" | "tabs";

export interface Props<T, K> {
  group: string;
  options: T[];
  keyify: (option: T) => K;
  modelValue?: K;
  contentClass?: string;
  theme?: PickerTheme;
}
const props = withDefaults(defineProps<Props<T, K>>(), {
  theme: "cupertino",
});

defineEmits<{
  (e: "update:modelValue", newValue: K): void;
}>();

const isSelected = (option: T) => {
  if (props.modelValue == null) {
    return false;
  }
  return props.keyify(option) === props.modelValue;
};
</script>

<template>
  <div
    :class="{
      'theme-cupertino': theme === 'cupertino',
      'theme-subtle': theme === 'subtle',
      'theme-tabs': theme === 'tabs',
    }"
  >
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
.theme-cupertino {
  @include template.picker-cupertino($content-class: "content");
}
.theme-subtle {
  @include template.picker-subtle($content-class: "content");
}
.theme-tabs {
  @include template.picker-tabs($content-class: "content");
}
</style>
