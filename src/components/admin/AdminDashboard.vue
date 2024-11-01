<script setup lang="ts">
import { useAdminAuth } from "@/utils/admin-auth-provider";
import SimpleButton from "@/components/common/SimpleButton.vue";
import PageContent from "@/components/common/PageContent.vue";
import { listifyAnd } from "@dan-schel/js-utils";
import AdminDashboardApp from "@/components/admin/AdminDashboardApp.vue";
import Switch from "@/components/common/Switch.vue";
import { Settings, useSettings } from "@/settings/settings";

const { logout, requireSession } = useAdminAuth();
const { settings, updateSettings } = useSettings();

async function handleLogout() {
  await logout();
}

function handleSettingsChange(newSettings: Settings | undefined) {
  if (newSettings != null) {
    updateSettings(newSettings);
  }
}
</script>

<template>
  <PageContent title="Admin dashboard" title-margin="1rem">
    <p>
      Logged in as <b>{{ requireSession().username }}</b> ({{
        listifyAnd(requireSession().roles)
      }}).
    </p>
    <SimpleButton
      :content="{ text: 'Logout' }"
      theme="filled"
      layout="traditional-wide"
      class="logout-button"
      @click="handleLogout"
    ></SimpleButton>
    <div class="buttons">
      <AdminDashboardApp
        to="admin-status"
        title="Status"
        description="Check-up on third party data availability"
        icon="uil:stethoscope-alt"
        color="green"
      ></AdminDashboardApp>
      <AdminDashboardApp
        to="admin-disruptions"
        title="Disruptions"
        description="Manage and curate disruptions from third-party APIs"
        icon="uil:exclamation-circle"
        color="red"
      ></AdminDashboardApp>
      <AdminDashboardApp
        to="admin-gtfs"
        title="GTFS parsing"
        description="Monitor GTFS parsing results and filter services"
        icon="uil:calendar"
        color="blue"
      ></AdminDashboardApp>
      <AdminDashboardApp
        to="admin-auditing"
        title="Auditing"
        description="View results of platform/timetable auditing"
        icon="uil:times-circle"
        color="yellow"
      ></AdminDashboardApp>
      <AdminDashboardApp
        to="admin-logs"
        title="Logs"
        description="View web server logs"
        icon="uil:align-left"
        color="purple"
      ></AdminDashboardApp>
      <AdminDashboardApp
        to="admin-users"
        title="Users"
        description="Manage admin user accounts and roles"
        icon="uil:user"
        color="cyan"
      ></AdminDashboardApp>
    </div>
    <Switch
      :model-value="settings?.showAdminDashboardShortcut"
      @update:model-value="
        handleSettingsChange(
          settings?.with({ showAdminDashboardShortcut: $event }),
        )
      "
      class="switch"
      ><p>Add admin dashboard shortcut to top navigation</p></Switch
    >
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.logout-button {
  margin-top: 1rem;
  align-self: flex-start;
  margin-bottom: 2rem;
}
h2 {
  @include utils.h2;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
.buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.5rem;
  border-top: 1px solid var(--color-soft-border);
  border-bottom: 1px solid var(--color-soft-border);
  padding: 1rem 0rem;
  margin-bottom: 1rem;
}
.switch {
  margin-bottom: 1rem;
  p {
    margin-left: 1rem;
  }
}
</style>
