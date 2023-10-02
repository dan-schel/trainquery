<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { useHead } from "@vueuse/head";
import { computed } from "vue";

const packages = computed(() =>
  [
    {
      name: "Dialog Polyfill",
      url: "https://github.com/GoogleChrome/dialog-polyfill",
      licenseUrl:
        "https://github.com/GoogleChrome/dialog-polyfill/blob/master/LICENSE",
      copyright:
        "Copyright (c) 2013 The Chromium Authors. All rights reserved.",
    },
    {
      name: "Luxon",
      url: "https://moment.github.io/luxon/",
      licenseUrl: "https://github.com/moment/luxon/blob/master/LICENSE.md",
      copyright: "Copyright 2019 JS Foundation and other contributors",
    },
    {
      name: "Unicons",
      url: "https://iconscout.com/unicons",
      licenseUrl: "https://iconscout.com/licenses#simple_license",
      copyright: "Copyright © 2022 Design Barn Inc.",
    },
    {
      name: "uuid",
      url: "https://github.com/uuidjs/uuid",
      licenseUrl: "https://github.com/uuidjs/uuid/blob/main/LICENSE.md",
      copyright:
        "Copyright (c) 2010-2020 Robert Kieffer and other contributors",
    },
    {
      name: "Zod",
      url: "https://zod.dev/",
      licenseUrl: "https://github.com/colinhacks/zod/blob/master/LICENSE",
      copyright: "Copyright (c) 2020 Colin McDonnell",
    },
  ].sort((a, b) => a.name.localeCompare(b.name))
);

useHead({
  title: "Licences and attribution",
});
</script>

<template>
  <PageContent title="Licences and attribution">
    <h2>Third party packages</h2>
    <p>
      TrainQuery distributes portions of several third-party packages, which
      each have their own licences.
    </p>
    <div class="third-party" v-for="p in packages" :key="p.name">
      <h3>{{ p.name }}</h3>
      <p class="license">{{ p.copyright }}</p>
      <p>
        <a :href="p.url" class="link">Project website</a>
        <span class="dot">•</span>
        <a :href="p.licenseUrl" class="link">View licence</a>
      </p>
    </div>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
h2 {
  @include utils.h2;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
h3 {
  @include utils.h3;
  margin-bottom: 0.5rem;
}
p {
  margin-bottom: 1rem;
}
.third-party {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  &:last-child {
    margin-bottom: 1.5rem;
  }
}
.third-party p {
  margin-bottom: 0.5rem;
}
.license {
  font-style: italic;
}
.dot {
  @include template.no-select;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
</style>
