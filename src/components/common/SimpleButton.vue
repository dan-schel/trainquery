<script setup lang="ts">
import Icon, { type IconID } from "../icons/Icon.vue";
import { type RouteLocationRaw } from "vue-router";
import LoadingSpinner from "./LoadingSpinner.vue";

export type ButtonContent =
  | { icon: IconID; text?: never; altText: string }
  | { icon: IconID; text: string; altText?: never }
  | { icon?: never; text: string; altText?: never };
export type ButtonLayout =
  | "traditional"
  | "tile"
  | "traditional-wide"
  | "tile-wide";
export type ButtonTheme = "hover" | "filled" | "filled-neutral";

export interface Props {
  to?: RouteLocationRaw;
  content: ButtonContent;
  layout?: ButtonLayout;
  theme?: ButtonTheme;
  disabled?: boolean;
  submit?: boolean;
  loading?: boolean;
}
withDefaults(defineProps<Props>(), {
  layout: "traditional",
  theme: "hover",
  disabled: false,
  submit: false,
});

defineEmits<{ (e: "click", payload: MouseEvent): void }>();
</script>

<template>
  <RouterLink
    v-if="to != null"
    :to="to"
    @click="(e: MouseEvent) => $emit('click', e)"
    :class="{
      'with-icon': content.icon != null,
      'with-text': content.text != null,
      button: layout === 'traditional',
      'button-wide': layout === 'traditional-wide',
      tile: layout === 'tile',
      'tile-wide': layout === 'tile-wide',
      'theme-hover': theme === 'hover',
      'theme-filled': theme === 'filled',
      'theme-filled-neutral': theme === 'filled-neutral',
      loading: loading === true,
    }"
    :title="content.altText"
    :disabled="disabled || loading ? true : undefined"
  >
    <Icon v-if="content.icon != null" :id="content.icon"></Icon>
    <p v-if="content.text != null">{{ content.text }}</p>
    <LoadingSpinner class="spinner" v-if="loading === true"></LoadingSpinner>
  </RouterLink>
  <button
    v-else
    @click="(e) => $emit('click', e)"
    :class="{
      'with-icon': content.icon != null,
      'with-text': content.text != null,
      button: layout === 'traditional',
      'button-wide': layout === 'traditional-wide',
      tile: layout === 'tile',
      'tile-wide': layout === 'tile-wide',
      'theme-hover': theme === 'hover',
      'theme-filled': theme === 'filled',
      'theme-filled-neutral': theme === 'filled-neutral',
      loading: loading === true,
    }"
    :title="content.altText"
    :disabled="disabled || loading ? true : undefined"
    :type="submit ? 'submit' : undefined"
  >
    <Icon v-if="content.icon != null" :id="content.icon"></Icon>
    <p v-if="content.text != null">{{ content.text }}</p>
    <LoadingSpinner class="spinner" v-if="loading === true"></LoadingSpinner>
  </button>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.button,
.button-wide {
  @include template.content-text-icon;
  @include template.row;
  justify-content: center;
  height: 2rem;

  svg {
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
.button-wide.with-text {
  padding-left: 1rem;
  padding-right: 1rem;
}
.tile,
.tile-wide {
  @include template.content-text-icon;
  height: 4rem;
  align-items: center;
  justify-content: center;
  padding: 0rem 0.5rem;

  svg {
    font-size: 1.2rem;
  }
  p {
    margin-top: 0.25rem;
  }
}
.tile-wide {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
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
.loading {
  position: relative;
  > :not(.spinner) {
    visibility: hidden;
  }
  .spinner {
    position: absolute;
    left: calc(50% - 0.5em);
    top: calc(50% - 0.5em);
    font-size: 1.5rem;
    color: var(--content-color);
  }
}
</style>
