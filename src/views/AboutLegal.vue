<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { getConfig } from "@/utils/get-config";
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import { LegalConfig } from "shared/system/config/legal-config";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { z } from "zod";

const route = useRoute();

const additionalMessages = computed(() => {
  const metaSchema = z.object({
    state: z.object({
      route: z.object({
        additionalMessages: LegalConfig.json,
      }),
    }),
  });

  const meta = metaSchema.parse(route.meta);
  return meta.state.route.additionalMessages;
});

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
    {
      name: "Vue.js",
      url: "https://vuejs.org/",
      licenseUrl: "https://github.com/vuejs/core/blob/main/LICENSE",
      copyright: "Copyright (c) 2018-present, Yuxi (Evan) You",
    },
    {
      name: "Vite SSR",
      url: "https://github.com/frandiox/vite-ssr",
      licenseUrl: "https://github.com/frandiox/vite-ssr/blob/master/LICENSE",
      copyright: "Copyright (c) 2020-present, Fran Dios",
    },
    {
      name: "Vue Router",
      url: "https://router.vuejs.org/",
      licenseUrl: "https://github.com/vuejs/router/blob/main/LICENSE",
      copyright: "Copyright (c) 2019-present Eduardo San Martin Morote",
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
);

useHead(
  generatePageHead({
    title: "Licences and attribution",
    allowIndexing: true,
    canonicalUrl: "/about/legal",
  }),
);
</script>

<template>
  <PageContent title="Licences and attribution" title-margin="1rem">
    <template v-if="additionalMessages.timetableData.length !== 0">
      <h2>Timetable data</h2>
      <p>
        The timetable data used by {{ getConfig().frontend.appName }} is
        provided by:
      </p>
      <div
        class="license-attribution"
        v-for="m in additionalMessages.timetableData"
        :key="m.title"
      >
        <h3>{{ m.title }}</h3>
        <p class="license">
          {{ m.message }}
        </p>
        <p>
          <template v-for="(l, i) in m.links" :key="l.url">
            <span class="dot" v-if="i !== 0">&ensp;•&ensp;</span>
            <a :href="l.url" class="link">{{ l.text }}</a>
          </template>
        </p>
      </div>
    </template>
    <h2>Third party packages</h2>
    <p>
      {{ getConfig().frontend.appName }} distributes portions of several
      third-party packages, under the following licences:
    </p>
    <div class="license-attribution" v-for="p in packages" :key="p.name">
      <h3>{{ p.name }}</h3>
      <p class="license">{{ p.copyright }}</p>
      <p>
        <a :href="p.url" class="link">Project website</a>
        <span class="dot">&ensp;•&ensp;</span>
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
.license-attribution {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  &:last-child {
    margin-bottom: 1.5rem;
  }
}
.license-attribution p {
  margin-bottom: 0.5rem;
}
.license {
  font-style: italic;
}
.dot {
  @include template.no-select;
}
</style>
