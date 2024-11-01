<script setup lang="ts">
import { computed, ref, watch } from "vue";
import NumberWheel from "../common/NumberWheel.vue";
import { hour12To24, hour24To12, posMod } from "@dan-schel/js-utils";
import Picker from "../common/Picker.vue";
import { QTime } from "shared/qtime/qtime";
import { TypeableTime } from "./helpers/typeable-time";
import TypeableTimeVue from "./TypeableTime.vue";
import UilTimes from "../icons/UilTimes.vue";
import UilCheck from "../icons/UilCheck.vue";

interface Props {
  modelValue: QTime;
  isShown?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  isShown: true,
});
const emit = defineEmits<{
  (e: "update:modelValue", newValue: QTime): void;
}>();

const typeable = ref(false);
const typeableTime = ref(TypeableTime.blank);
const typeableSubmitEnabled = computed(
  () => typeableTime.value.extractTime() != null,
);

const timeComponents = computed(() => {
  const hour12 = hour24To12(props.modelValue.hour);
  return {
    hours: hour12.hour,
    minutes: props.modelValue.minute,
    ampm: hour12.half,
  };
});
const hours = ref(timeComponents.value.hours);
const minutes = ref(timeComponents.value.minutes);
const ampm = ref(timeComponents.value.ampm);
watch(
  [() => props.isShown, () => props.modelValue],
  ([isShown, newTime], [wasShown, oldTime]) => {
    // Ensure the time is reset when the time controls are toggled open and
    // closed (or an outside change occurs to modelValue).
    if (!newTime.equals(oldTime) || (isShown && !wasShown)) {
      hours.value = timeComponents.value.hours;
      minutes.value = timeComponents.value.minutes;
      ampm.value = timeComponents.value.ampm;
      typeable.value = false;
    }
  },
);
watch([hours, minutes, ampm], ([newHour, newMinute, newAmpm]) => {
  // Ensure the model value is updated when the wheels are spun.
  const hour24 = hour12To24(newHour, newAmpm);
  const time = new QTime(hour24, newMinute, 0);
  if (!props.modelValue.equals(time)) {
    emit("update:modelValue", time);
  }
});

function handleTimeClicked() {
  typeable.value = true;
  typeableTime.value = TypeableTime.blank;
}
function handleSubmitTimeEditor(e: Event) {
  e.preventDefault();
  const newTime = typeableTime.value.extractTime();
  if (newTime != null) {
    emit("update:modelValue", newTime);
    typeable.value = false;
  }
}
function handleCloseTimeEditor() {
  typeable.value = false;
}
</script>

<template>
  <div>
    <div v-if="!typeable" class="time-wheels">
      <NumberWheel
        class="time-wheel"
        v-model="hours"
        :next="(c) => posMod(c, 12) + 1"
        :prev="(c) => posMod(c - 2, 12) + 1"
        :stringify="(c) => c.toFixed()"
        @number-clicked="handleTimeClicked"
      ></NumberWheel>
      <p class="time-colon">:</p>
      <NumberWheel
        class="time-wheel"
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
    <form v-if="typeable" class="time-editor" @submit="handleSubmitTimeEditor">
      <TypeableTimeVue
        class="typeable-time"
        v-model="typeableTime"
        :display-error="false"
      ></TypeableTimeVue>
      <button type="button" title="Cancel" @click="handleCloseTimeEditor">
        <UilTimes></UilTimes>
      </button>
      <button
        type="submit"
        title="Set time"
        :disabled="!typeableSubmitEnabled ? true : undefined"
      >
        <UilCheck></UilCheck>
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.time-wheels,
.time-editor {
  height: 8rem;
  border-top: 1px solid var(--color-soft-border);
  border-bottom: 1px solid var(--color-soft-border);
  margin-bottom: 0.5rem;
}
.time-wheels {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
}
.time-wheel {
  cursor: text;
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

  .typeable-time {
    grid-area: input;
  }

  button {
    @include template.content-text-icon;
    height: 2.5rem;
    width: 2.5rem;
    align-items: center;
    justify-content: center;
    svg {
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
</style>
