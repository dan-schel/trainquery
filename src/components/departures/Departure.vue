<script setup lang="ts">
import OneLineP from "@/components/common/OneLineP.vue";
import Icon from "../icons/Icon.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <RouterLink class="departure accent-cyan" to="">
    <div class="primary">
      <OneLineP class="terminus">Flinders Street</OneLineP>
      <OneLineP class="via">via City Loop</OneLineP>
      <OneLineP class="time">2 mins</OneLineP>
    </div>
    <div class="details">
      <OneLineP>Express Malvern → South Yarra</OneLineP>
      <div class="disruption">
        <Icon id="uil:exclamation-circle"></Icon>
        <OneLineP class="disruption-text">
          Potentially replaced by buses after Westall
        </OneLineP>
      </div>
    </div>
    <div class="platform">
      <p>Platform</p>
      <p class="platform-number">2</p>
    </div>
    <div class="arrow">
      <Icon id="uil:angle-right"></Icon>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/line-colors" as line-colors;
.departure {
  @include line-colors.accent-classes;
  @include template.button-hover;
  --button-rounding: 0;
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-template-rows: 1rem 2.3rem;
  grid-template-areas:
    "primary primary arrow"
    "details platform arrow";

  padding: 1rem;
  row-gap: 0.5rem;
  column-gap: 0.5rem;
}

.primary :deep(p) {
  color: var(--color-accent);
}
.terminus :deep(p),
.time :deep(p),
.platform-number {
  font-size: 1rem;
  font-weight: bold;
}
.via :deep(p),
.details :deep(p) {
  font-stretch: semi-condensed;
  font-size: 0.8rem;
}

.primary {
  grid-area: primary;
  flex-direction: row;
  align-items: baseline;
}
.via {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;

  margin-left: 0.25rem;
  margin-right: 1rem;
}
.terminus {
  min-width: 0;
  max-width: 10rem;
}
.time {
  min-width: 0;
  max-width: 10rem;
}
.details {
  grid-area: details;
  min-width: 0;
  display: grid;
  grid-template-columns: auto 1fr 1rem;
  justify-content: flex-end;

  > * {
    min-width: 0;
  }
  .disruption {
    @include template.row;
    grid-row: 3;
    gap: 0.25rem;

    .disruption-text {
      min-width: 0;
      flex-shrink: 1;
    }
    &:deep(p) {
      font-weight: bold;
    }
    &:deep(p),
    .icon {
      color: var(--color-error);
    }
  }
}

.platform {
  grid-area: platform;

  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 2.3rem;
  padding: 0.2rem 0.4rem;
  justify-items: center;

  border: 2px solid var(--color-ink-20);
  border-radius: 0.25rem;

  :nth-child(1) {
    font-size: 0.6rem;
    font-stretch: semi-condensed;
  }
  .platform-number {
    grid-row: 3;
  }
}
.arrow {
  grid-area: arrow;
  align-self: center;
  font-size: 1rem;
  margin-right: -0.5rem;
}
</style>