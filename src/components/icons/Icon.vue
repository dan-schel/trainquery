<script setup lang="ts">
import UilInfoCircle from "./UilInfoCircle.vue";
export type IconID = "uil:info-circle";
defineProps<{
  id: IconID;
}>();
</script>

<template>
  <UilInfoCircle v-if="id == 'uil:info-circle'" class="icon"></UilInfoCircle>
</template>
