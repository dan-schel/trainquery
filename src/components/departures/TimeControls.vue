<script setup lang="ts">
import { computed, ref, watch } from "vue";
import NumberWheel from "../common/NumberWheel.vue";
import { hour12To24, hour24To12, posMod } from "@schel-d/js-utils";
import Picker from "../common/Picker.vue";
import SimpleButton from "../common/SimpleButton.vue";
import { buildLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import { getConfig } from "@/utils/get-config";
import { formatDate } from "@/utils/format-qtime";
import { QLocalDateTime } from "shared/qtime/qdatetime";
import { QTime } from "shared/qtime/qtime";
import { useNow } from "@/utils/now-provider";
import Icon from "../icons/Icon.vue";
import { TypeableTime } from "./helpers/typeable-time";

const props = defineProps<{
  time: QLocalDateTime | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", newValue: QLocalDateTime | null): void;
}>();

const { local } = useNow();

const timeComponents = computed(() => {
  const time = props.time ?? local.value;
  const hour12 = hour24To12(time.time.hour);

  return {
    hours: hour12.hour,
    minutes: time.time.minute,
    date: time.date,
    ampm: hour12.half,
  };
});

const hours = ref(timeComponents.value.hours);
const minutes = ref(timeComponents.value.minutes);
const date = ref(timeComponents.value.date);
const ampm = ref(timeComponents.value.ampm);

const timeEditInput = ref<HTMLInputElement | null>(null);
const timeEditTime = ref(TypeableTime.blank);
const timeEditMode = ref(false);

watch([props], () => {
  hours.value = timeComponents.value.hours;
  minutes.value = timeComponents.value.minutes;
  date.value = timeComponents.value.date;
  ampm.value = timeComponents.value.ampm;
});

watch(
  () => props.isOpen,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      hours.value = timeComponents.value.hours;
      minutes.value = timeComponents.value.minutes;
      date.value = timeComponents.value.date;
      ampm.value = timeComponents.value.ampm;
    }
  }
);

function handleSubmitButton() {
  const time = new QTime(hour12To24(hours.value, ampm.value), minutes.value, 0);
  const datetime = buildLocalDateTimeLuxon(getConfig(), date.value, time);
  emit("submit", datetime);
}
function handleTimeClicked() {
  timeEditMode.value = true;
  timeEditTime.value = TypeableTime.blank;

  // Doesn't work without the delay for some reason :/
  setTimeout(() => timeEditInput.value?.focus(), 100);
}
function handleSubmitTimeEditor(e: Event) {
  e.preventDefault();
  timeEditMode.value = false;
}
function handleCloseTimeEditor() {
  timeEditMode.value = false;
}
function handleTimeInput(_e: Event) {
  const e = _e as InputEvent;
  if (e.inputType == "insertText") {
    timeEditTime.value = timeEditTime.value.type(e.data ?? "");
  } else if (e.inputType == "deleteContentBackward") {
    timeEditTime.value = timeEditTime.value.backspace();
  } else if (e.inputType == "deleteContentForward") {
    timeEditTime.value = timeEditTime.value.delete();
  }
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
    <div v-if="!timeEditMode" class="time-wheels">
      <NumberWheel
        v-model="hours"
        :next="(c) => posMod(c, 12) + 1"
        :prev="(c) => posMod(c - 2, 12) + 1"
        :stringify="(c) => c.toFixed()"
        @number-clicked="handleTimeClicked"
      ></NumberWheel>
      <p class="time-colon">:</p>
      <NumberWheel
        v-model="minutes"
        :next="(c) => posMod(c + 1, 60)"
        :prev="(c) => posMod(c - 1, 60)"
        :stringify="(c) => c.toFixed().padStart(2, '0')"
        @number-clicked="handleTimeClicked"
      ></NumberWheel>
      <Picker
        class="ampm-picker"
        group="ampm"
        :options="['am', 'pm']"
        :keyify="(x) => x"
        v-model="ampm"
        theme="subtle"
      >
        <template v-slot="slotProps">
          <p>{{ slotProps.data.toUpperCase() }}</p>
        </template>
      </Picker>
    </div>
    <form
      v-if="timeEditMode"
      class="time-editor"
      @submit="handleSubmitTimeEditor"
    >
      <input type="text" ref="timeEditInput" @beforeinput="handleTimeInput" />
      <button title="Cancel" @click="handleCloseTimeEditor">
        <Icon id="uil:map-marker"></Icon>
      </button>
      <button type="submit" title="Set time">
        <Icon id="uil:check"></Icon>
      </button>
    </form>
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
.time-wheels,
.time-editor {
  height: 8rem;
  border-top: 1px solid var(--color-ink-20);
  border-bottom: 1px solid var(--color-ink-20);
  margin-bottom: 0.5rem;
}
.time-wheels {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
}
.time-colon {
  align-self: center;
  font-size: 2.5rem;
  font-weight: bold;
  @include template.no-select;
}
.ampm-picker {
  align-self: center;
  :deep(.content) {
    @include template.content-text;
    padding: 0.5rem 1rem;
    p {
      font-weight: bold;
      font-size: 1rem;
    }
  }
}
.time-editor {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "input close"
    "input submit";
  row-gap: 0.5rem;

  input {
    grid-area: input;
  }

  button {
    @include template.content-text-icon;
    height: 2.5rem;
    width: 2.5rem;
    align-items: center;
    justify-content: center;
    .icon {
      font-size: 1.5rem;
    }

    &:not([type="submit"]) {
      @include template.button-hover;
      grid-area: close;
      align-self: end;
    }
    &[type="submit"] {
      @include template.button-filled;
      grid-area: submit;
    }
  }
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
