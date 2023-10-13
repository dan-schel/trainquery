<script setup lang="ts"></script>

<template>
  <div class="one-line">
    <p><slot></slot></p>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.one-line {
  @include template.one-line;
}
</style>
