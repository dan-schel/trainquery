import type { QLocalDateTime, QUtcDateTime } from "shared/qtime/qdatetime";
import { inject, type InjectionKey, type Ref } from "vue";

export const nowInjectionKey = Symbol() as InjectionKey<{
  local: Ref<QLocalDateTime>;
  utc: Ref<QUtcDateTime>;
}>;

export function useNow() {
  return inject(
    nowInjectionKey,
    {} as {
      local: Ref<QLocalDateTime>;
      utc: Ref<QUtcDateTime>;
    },
  );
}
