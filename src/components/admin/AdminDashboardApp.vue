<script setup lang="ts">
import Icon, { type IconID } from "@/components/icons/Icon.vue";

defineProps<{
  to: string;
  icon: IconID;
  title: string;
  description: string;
  color:
    | "red"
    | "yellow"
    | "green"
    | "cyan"
    | "blue"
    | "purple"
    | "pink"
    | "default";
}>();
</script>

<template>
  <RouterLink
    class="app"
    :class="{ [color]: color !== 'default' }"
    :to="{ name: to }"
  >
    <div class="icon-box">
      <Icon :id="icon"></Icon>
    </div>
    <p class="title">{{ title }}</p>
    <p class="description">{{ description }}</p>
  </RouterLink>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.app {
  @include template.button-hover;
  align-items: center;
  padding: 1.5rem 1rem;
  gap: 0.5rem;

  &.red {
    --color-accent: var(--color-accent-red);
  }
  &.yellow {
    --color-accent: var(--color-accent-yellow);
  }
  &.green {
    --color-accent: var(--color-accent-green);
  }
  &.cyan {
    --color-accent: var(--color-accent-cyan);
  }
  &.blue {
    --color-accent: var(--color-accent-blue);
  }
  &.purple {
    --color-accent: var(--color-accent-purple);
  }
  &.pink {
    --color-accent: var(--color-accent-pink);
  }
}
.icon-box {
  @include utils.shadow;
  height: 5rem;
  width: 5rem;
  align-items: center;
  justify-content: center;
  background-color: var(--color-accent);
  margin-bottom: 1rem;
  border-radius: 1rem;
  svg {
    font-size: 3.5rem;
    color: var(--color-on-accent);
  }
}
.title {
  font-weight: bold;
  color: var(--color-text-strong);
}
.description {
  font-stretch: semi-condensed;
  font-size: 0.8rem;
}
p {
  text-align: center;
}
</style>
