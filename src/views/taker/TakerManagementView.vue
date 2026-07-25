<template>
    <div>
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2"
            style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="take-attendance" v-if="authStore.isAttendanceTaker">
                        <div class="d-flex align-items-center gap-2">
                            <ClipboardList style="color: var(--success-color);" :size="16" />
                            Take Attendance
                        </div>
                    </Tab>
                    <Tab value="member-absences">
                        <div class="d-flex align-items-center gap-2">
                            <FileText style="color: var(--warning-color);" :size="16" />
                            View
                        </div>
                    </Tab>
                    <Tab value="request-permission">
                        <div class="d-flex align-items-center gap-2">
                            <ClipboardList style="color: var(--primary-color);" :size="16" />
                            Member Request Permission
                        </div>
                    </Tab>
                    <Tab value="my-leave-request">
                        <div class="d-flex align-items-center gap-2">
                            <FileText style="color: var(--info-color);" :size="16" />
                            My Leave Request
                        </div>
                    </Tab>
                    <Tab value="manage-rows" v-if="false">
                        <div class="d-flex align-items-center gap-2">
                            <Settings style="color: var(--info-color);" :size="16" />
                            Manage Rows
                        </div>
                    </Tab>
                </TabList>
            </div>
            <TabPanels class="p-0 bg-transparent">
                <TabPanel value="take-attendance" v-if="authStore.isAttendanceTaker">
                    <TakerTakeAttendanceView v-if="activeTab === 'take-attendance'" />
                </TabPanel>
                <TabPanel value="member-absences">
                    <TakerAbsentPermissionView v-if="activeTab === 'member-absences'" />
                </TabPanel>
                <TabPanel value="request-permission">
                    <MemberRequestPermissionView v-if="activeTab === 'request-permission'" />
                </TabPanel>
                <TabPanel value="my-leave-request">
                    <PagodaLeaveRequestView v-if="activeTab === 'my-leave-request'" />
                </TabPanel>
                <TabPanel value="manage-rows" v-if="false">
                    <SeatingRowSettings v-if="activeTab === 'manage-rows'" />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ClipboardList, FileText, Settings } from '@lucide/vue';
import TakerTakeAttendanceView from './TakerTakeAttendanceView.vue';
import TakerAbsentPermissionView from './TakerAbsentPermissionView.vue';
import MemberRequestPermissionView from './MemberRequestPermissionView.vue';
import PagodaLeaveRequestView from '@/views/pagoda/PagodaLeaveRequestView.vue';
import SeatingRowSettings from '@/views/admin/settings/SeatingRowSettings.vue';
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('member-absences');

onMounted(() => {
    if (authStore.isAttendanceTaker) {
        activeTab.value = 'take-attendance';
    } else if (false) {
        activeTab.value = 'manage-rows';
    }
    
    if (route.query.tab) {
        activeTab.value = route.query.tab;
    }
});

watch(activeTab, (newTab) => {
    router.replace({ query: { ...route.query, tab: newTab } });
});
</script>

<style scoped>
</style>
