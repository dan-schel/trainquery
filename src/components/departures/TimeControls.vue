<script setup lang="ts">
import { ref, watch } from "vue";
import NumberWheel from "../common/NumberWheel.vue";
import SimpleButton from "../common/SimpleButton.vue";
import { buildLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import { getConfig } from "@/utils/get-config";
import { formatDate } from "@/utils/format-qtime";
import { QLocalDateTime } from "shared/qtime/qdatetime";
import { useNow } from "@/utils/now-provider";
import TimeInput from "./TimeInput.vue";
import { nullableEquals } from "@/utils/param-utils";

const props = defineProps<{
  time: QLocalDateTime | null;
  isShown: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", newValue: QLocalDateTime | null): void;
}>();

const { local } = useNow();

const time = ref((props.time ?? local.value).time);
const date = ref((props.time ?? local.value).date);
watch(
  [() => props.isShown, () => props.time],
  ([isShown, newTime], [wasShown, oldTime]) => {
    if (!nullableEquals(newTime, oldTime) || (isShown && !wasShown)) {
      time.value = (props.time ?? local.value).time;
      date.value = (props.time ?? local.value).date;
    }
  },
);

function handleSubmitButton() {
  emit("submit", buildLocalDateTimeLuxon(getConfig(), date.value, time.value));
}
</script>

<template>
  <div class="time-controls">
    <h5>Set departure time</h5>
    <SimpleButton
      :content="{ text: 'Now', icon: 'uil:clock' }"
      theme="filled-neutral"
      class="now"
      layout="traditional-wide"
      @click="$emit('submit', null)"
    ></SimpleButton>
    <TimeInput v-model="time" :is-shown="isShown"></TimeInput>
    <NumberWheel
      class="date-wheel"
      v-model="date"
      :next="(c) => date.tomorrow()"
      :prev="(c) => date.yesterday()"
      :stringify="(c) => formatDate(c)"
      :horizontal="true"
    ></NumberWheel>
    <SimpleButton
      :content="{ text: 'Set', icon: 'uil:check' }"
      theme="filled"
      class="submit"
      layout="traditional-wide"
      @click="handleSubmitButton"
    ></SimpleButton>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.time-controls {
  padding: 1rem;
}
h5,
h6 {
  font-weight: bold;
  color: var(--color-ink-100);
}
h5 {
  font-size: 1rem;
  margin-bottom: 1rem;
}
h6 {
  margin-bottom: 0.5rem;
}
.now {
  align-self: flex-start;
  margin-bottom: 1rem;
}
.submit {
  align-self: flex-end;
}
.date-wheel {
  --wheel-text-size: 1.25rem;
  --scroll-offset: 120;
  height: 3rem;
  margin-bottom: 0.5rem;
}
</style>
