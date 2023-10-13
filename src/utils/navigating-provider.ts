import { ref, type InjectionKey, inject, type Ref, type App } from "vue";

const navigating = ref(false);
const navigatingInjectionKey = Symbol() as InjectionKey<Ref<boolean>>;

export function provideNavigating(app: App<any>) {
  app.provide(navigatingInjectionKey, navigating);
}
export function useNavigating() {
  return inject(navigatingInjectionKey, navigating);
}
export function startedNavigating() {
  navigating.value = true;
}
export function finishedNavigating() {
  navigating.value = false;
}
