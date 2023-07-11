<script setup lang="ts">
import SimpleButton from "../common/SimpleButton.vue";
</script>

<template>
  <nav>
    <div class="bg"></div>
    <div class="content-wrapper">
      <div class="content">
        <SimpleButton
          :content="{ icon: 'uil:info-circle', text: 'About' }"
        ></SimpleButton>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
nav {
  // Allow .bg to position itself.
  position: relative;
  z-index: 1;
}
.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;

  background-color: var(--color-paper-30);
  box-shadow: 0px 2px 4px var(--color-shadow-10);
  opacity: 100%;
  transition: opacity 0.25s;

  &.blend {
    opacity: 0%;
  }
}
.content-wrapper {
  @include template.page-centerer;
}
.content {
  @include template.row;
  height: 3rem;
  z-index: 1;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>
