<script setup lang="ts">
import SimpleButton from "../common/SimpleButton.vue";
import Switch from "../common/Switch.vue";
</script>

<template>
  <div class="filter-controls">
    <h5>Filter trains</h5>
    <div class="scrollable">
      <h6>By line</h6>
      <div class="filter-row">
        <button class="filter-button"><p>Cranbourne Line</p></button>
        <button class="filter-button"><p>Gippsland Line</p></button>
        <button class="filter-button"><p>Pakenham Line</p></button>
      </div>
      <h6>By direction</h6>
      <div class="filter-row">
        <button class="filter-button"><p>Citybound</p></button>
        <button class="filter-button"><p>Outbound</p></button>
      </div>
      <h6>By platform</h6>
      <div class="filter-row">
        <button class="filter-button platform"><p>1</p></button>
        <button class="filter-button platform"><p>2</p></button>
        <button class="filter-button platform"><p>15A</p></button>
      </div>
    </div>
    <Switch class="switch"><p>Show arrivals</p></Switch>
    <Switch class="switch"><p>Show set down only trains</p></Switch>
    <SimpleButton
      class="submit"
      to=""
      :content="{ icon: 'uil:check', text: 'Set' }"
      layout="traditional-wide"
      theme="filled"
    ></SimpleButton>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.filter-controls {
  padding: 1rem;
  display: grid;
  grid-template-rows: auto 1fr auto auto auto;
  row-gap: 0.5rem;
}
h5,
h6 {
  font-weight: bold;
  color: var(--color-ink-100);
}
h5 {
  font-size: 1rem;
}
.scrollable {
  border-top: 1px solid var(--color-ink-20);
  border-bottom: 1px solid var(--color-ink-20);
  padding-top: 1rem;
  max-height: 20rem;
  overflow-y: scroll;
  margin-bottom: 0.5rem;
}
h6 {
  margin-bottom: 0.5rem;
}
.filter-row {
  @include template.row;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}
.filter-button {
  @include template.button-filled-neutral;
  @include template.row;
  @include template.content-text;
  height: 1.5rem;
  padding: 0 0.5rem;
  --button-rounding: 0.75rem;
  p {
    font-size: 0.8rem;
  }

  &.platform {
    height: 2rem;
    min-width: 2rem;
    padding: 0 0.75rem;
    justify-content: center;
    p {
      font-size: 1rem;
    }
  }
}
.switch p {
  margin-left: 1rem;
}
.submit {
  justify-self: flex-end;
}
</style>
