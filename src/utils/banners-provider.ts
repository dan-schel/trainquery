import type { Banner } from "shared/banner";
import { ref, type InjectionKey, inject, type Ref, type App } from "vue";

const banners = ref<Banner[]>([]);
const bannersInjectionKey = Symbol() as InjectionKey<Ref<Banner[]>>;

export function provideBanners(app: App<any>) {
  app.provide(bannersInjectionKey, banners);
}
export function useBanners() {
  return inject(bannersInjectionKey, banners);
}
export function setBanners(newBanners: Banner[]) {
  console.log(newBanners);
  banners.value = newBanners;
}
