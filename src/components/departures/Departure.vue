<script setup lang="ts">
import OneLineP from "@/components/common/OneLineP.vue";
</script>

<template>
  <div class="departure accent-purple">
    <div class="primary">
      <OneLineP class="terminus">Traralgon</OneLineP>
      <OneLineP class="via">via Pakenham</OneLineP>
      <OneLineP class="time">4:57pm Monday</OneLineP>
    </div>
    <div class="details">
      <OneLineP>
        Express Dandenong &gt; Garfield, also skipping Yarragon and Trafalgar
      </OneLineP>
      <OneLineP class="disruption">
        Potentially replaced by buses after Berwick
      </OneLineP>
    </div>
    <div class="platform">
      <p>Platform</p>
      <p class="platform-number">2</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/line-colors" as line-colors;
.departure {
  @include line-colors.accent-classes;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1rem 2.3rem;
  grid-template-areas:
    "primary primary"
    "details platform";

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

  justify-content: flex-end;
  gap: 0.6rem;

  > * {
    min-width: 0;
  }
  :nth-child(2) {
    grid-row: 3;
  }
  .disruption :deep(p) {
    font-weight: bold;
    color: var(--color-error);
  }
}

.platform {
  grid-area: platform;

  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 2.3rem;
  padding: 0.2rem 0.5rem;
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
</style>
