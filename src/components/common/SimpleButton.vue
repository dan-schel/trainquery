<script setup lang="ts">
import Icon, { type IconID } from "../icons/Icon.vue";
import { type RouteLocationRaw } from "vue-router";

export type ButtonContent =
  | { icon: IconID; text?: never; altText: string }
  | { icon: IconID; text: string; altText?: never }
  | { icon?: never; text: string; altText?: never };
export type ButtonLayout = "traditional" | "tile";
export type ButtonTheme = "hover" | "filled" | "filled-neutral";
export type ButtonPadding = "normal" | "wider";

export interface Props {
  to?: RouteLocationRaw;
  content: ButtonContent;
  layout?: ButtonLayout;
  theme?: ButtonTheme;
  padding?: ButtonPadding;
}
withDefaults(defineProps<Props>(), {
  layout: "traditional",
  theme: "hover",
  padding: "normal",
});

defineEmits<{ (e: "click", payload: MouseEvent): void }>();
</script>

<template>
  <RouterLink
    v-if="to != null"
    :to="to"
    :class="{
      'with-icon': content.icon != null,
      'with-text': content.text != null,
      button: layout == 'traditional',
      tile: layout == 'tile',
      'theme-hover': theme == 'hover',
      'theme-filled': theme == 'filled',
      'theme-filled-neutral': theme == 'filled-neutral',
      wider: padding == 'wider',
    }"
    :title="content.altText"
  >
    <Icon v-if="content.icon != null" :id="content.icon"></Icon>
    <p v-if="content.text != null">{{ content.text }}</p>
  </RouterLink>
  <button
    v-else
    @click="(e) => $emit('click', e)"
    :class="{
      'with-icon': content.icon != null,
      'with-text': content.text != null,
      button: layout == 'traditional',
      tile: layout == 'tile',
      'theme-hover': theme == 'hover',
      'theme-filled': theme == 'filled',
      'theme-filled-neutral': theme == 'filled-neutral',
      wider: padding == 'wider',
    }"
    :title="content.altText"
  >
    <Icon v-if="content.icon != null" :id="content.icon"></Icon>
    <p v-if="content.text != null">{{ content.text }}</p>
  </button>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.button {
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
    &.wider {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
  &:not(.with-text) {
    width: 2rem;
  }
}
.tile {
  @include template.content-text-icon;
  height: 4rem;
  align-items: center;
  justify-content: center;
  padding: 0rem 0.5rem;

  .icon {
    font-size: 1.2rem;
  }
  p {
    margin-top: 0.25rem;
  }
}
.theme-hover {
  @include template.button-hover;
}
.theme-filled {
  @include template.button-filled;
}
.theme-filled-neutral {
  @include template.button-filled-neutral;
}
</style>
