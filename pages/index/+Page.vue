<script setup lang="ts">
import { useData } from "vike-vue/useData";
import type { Data } from "./+data";

const data = useData<Data>();
const favStopName = data.favStopName;
</script>

<template>
  <h1>My Vike app</h1>
  <p>My favourite stop is: {{ favStopName }}.</p>
</template>
