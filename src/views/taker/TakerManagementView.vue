<template>
    <div>
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2"
            style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="take-attendance" v-if="authStore.isAttendanceTaker">
                        <div class="d-flex align-items-center gap-2">
                            <ClipboardList style="color: var(--success-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'take-attendance'}">Take Attendance</span>
                        </div>
                    </Tab>
                    <Tab value="request-permission" v-if="authStore.isAdmin || authStore.isSuperAdmin">
                        <div class="d-flex align-items-center gap-2">
                            <ClipboardList style="color: var(--primary-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'request-permission'}">Member Request Permission</span>
                            <span v-if="pendingCount > 0" class="badge bg-danger rounded-pill">{{ pendingCount }}</span>
                        </div>
                    </Tab>
                    <Tab value="my-leave-request">
                        <div class="d-flex align-items-center gap-2">
                            <FileText style="color: var(--info-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'my-leave-request'}">My Leave Request</span>
                        </div>
                    </Tab>

                    <Tab value="manage-rows" v-if="false">
                        <div class="d-flex align-items-center gap-2">
                            <Settings style="color: var(--info-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'manage-rows'}">Manage Rows</span>
                        </div>
                    </Tab>
                </TabList>
            </div>
            <TabPanels class="p-0 bg-transparent">
                <TabPanel value="take-attendance" v-if="authStore.isAttendanceTaker">
                    <TakerTakeAttendanceView v-if="activeTab === 'take-attendance'" />
                </TabPanel>
                <TabPanel value="request-permission" v-if="authStore.isAdmin || authStore.isSuperAdmin">
                    <MemberRequestPermissionView v-if="activeTab === 'request-permission'" :pending-count="pendingCount" @refresh-pending-count="fetchPendingCount" />
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
import api from '@/api/api';
import { useAuthStore } from '@/stores/auth';
import { ClipboardList, FileText, Settings, QrCode } from '@lucide/vue';
import TakerTakeAttendanceView from './TakerTakeAttendanceView.vue';
import MemberRequestPermissionView from './MemberRequestPermissionView.vue';
import PagodaLeaveRequestView from '@/views/pagoda/PagodaLeaveRequestView.vue';


import SeatingRowSettings from '@/views/admin/settings/SeatingRowSettings.vue';
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('request-permission');
const pendingCount = ref(0);

const fetchPendingCount = async () => {
    if (!authStore.isAdmin && !authStore.isSuperAdmin) return;
    try {
        const response = await api.get('/leave-requests', {
            params: { status: 'pending' }
        });
        pendingCount.value = response.data?.length || 0;
    } catch (error) {
        console.error('Failed to load pending count:', error);
    }
};

onMounted(() => {
    fetchPendingCount();
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
:deep(.p-tabpanel) {
    padding: 0 !important;
}
</style>
