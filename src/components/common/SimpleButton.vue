<script setup lang="ts">
import Icon, { type IconID } from "../icons/Icon.vue";
import { type RouteLocationRaw } from "vue-router";

export type ButtonContent =
  | { icon: IconID; text?: never; altText: string }
  | { icon: IconID; text: string; altText?: never }
  | { icon?: never; text: string; altText?: never };

defineProps<{ to?: RouteLocationRaw; content: ButtonContent }>();
defineEmits<{ (e: "click", payload: MouseEvent): void }>();
</script>

<template>
  <RouterLink
    v-if="to != null"
    :to="to"
    class="button"
    :class="{
      'with-icon': content.icon != null,
      'with-text': content.text != null,
    }"
  >
    <Icon v-if="content.icon != null" :id="content.icon"></Icon>
    <p v-if="content.text != null">{{ content.text }}</p>
  </RouterLink>
  <button
    v-else
    @click="(e) => $emit('click', e)"
    class="button"
    :class="{
      'with-icon': content.icon != null,
      'with-text': content.text != null,
    }"
  >
    <Icon v-if="content.icon != null" :id="content.icon"></Icon>
    <p v-if="content.text != null">{{ content.text }}</p>
  </button>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.button {
  @include template.button-hover;
  @include template.content-text-icon;
  @include template.row;
  justify-content: center;
  height: 2rem;

  .icon {
    font-size: 1.2rem;
  }

  &.with-icon p {
    margin-left: 0.5rem;
  }
  &.with-text {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  &:not(.with-text) {
    width: 2rem;
  }
}
</style>
