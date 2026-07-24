<template>
    <div class="user-view d-flex flex-column gap-3">
        <!-- Title Banner -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center p-3 rounded" style="background-color: var(--body-bg-color); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
            <div>
                <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">
                    Users Management / គ្រប់គ្រងអ្នកប្រើប្រាស់
                </h5>
            </div>
        </div>

        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2" style="background-color: var(--surface-ground);">
        <div>
            <TabList>
                <Tab value="all-users" :disabled="activeTab === 'user-form' || activeTab === 'bulk-preview'">
                    <div class="d-flex align-items-center gap-2">
                        <UserRoundCheck style="color: var(--success-color);" :size="16" />
                        All Verified Users
                    </div>
                </Tab>
                <Tab v-if="authStore.isMonk" value="my-biography" :disabled="activeTab === 'user-form' || activeTab === 'bulk-preview'">
                    <div class="d-flex align-items-center gap-2">
                        <ClipboardList style="color: var(--primary-color);" :size="16" />
                        ប្រវត្តិរូបរបស់ខ្ញុំ (My Biography)
                    </div>
                </Tab>
                <Tab v-if="false" value="all-pending-users" :disabled="activeTab === 'user-form' || activeTab === 'bulk-preview'">
                    <div class="d-flex align-items-center gap-2">
                        <MailWarning style="color: var(--warning-color);" :size="16" />
                        Pending Users
                    </div>
                </Tab>
                <Tab value="biography-surveys" :disabled="activeTab === 'user-form' || activeTab === 'bulk-preview'">
                    <div class="d-flex align-items-center gap-2">
                        <BookOpen style="color: var(--primary-color);" :size="16" />
                        ប្រវត្តិព្រះសង្ឃ
                    </div>
                </Tab>
                <Tab value="student-biography" :disabled="activeTab === 'user-form' || activeTab === 'bulk-preview'">
                    <div class="d-flex align-items-center gap-2">
                        <GraduationCap style="color: var(--info-color, #0ea5e9);" :size="16" />
                        ប្រវត្តិរូបនិស្សិត
                    </div>
                </Tab>
                <Tab value="user-form" v-show="activeTab === 'user-form'">
                    <div class="d-flex align-items-center gap-2">
                        <UserPlus style="color: var(--primary-color);" :size="16" />
                        Add New User
                    </div>
                </Tab>
                <Tab value="bulk-preview" v-show="activeTab === 'bulk-preview'">
                    <div class="d-flex align-items-center gap-2">
                        <FileDown style="color: var(--primary-color);" :size="16" />
                        Preview Import
                    </div>
                </Tab>
            </TabList>
        </div>
        <TabPanels class="p-0 bg-transparent">
            <TabPanel value="bulk-preview">
                <UserBulkPreviewView v-if="activeTab === 'bulk-preview'" @close="onFormClose" />
            </TabPanel>
            <TabPanel value="user-form">
                <UserFormView v-if="activeTab === 'user-form'" @close="onFormClose" />
            </TabPanel>
            <TabPanel value="all-users">
                <UserListView v-if="activeTab === 'all-users'" @new="activeTab = 'user-form'" @preview-bulk="activeTab = 'bulk-preview'" />
            </TabPanel>
            <TabPanel v-if="authStore.isMonk" value="my-biography">
                <PagodaMonkBiographyView v-if="activeTab === 'my-biography'" />
            </TabPanel>
            <TabPanel v-if="false" value="all-pending-users">
                <UserPendingView v-if="activeTab === 'all-pending-users'" />
            </TabPanel>
            <TabPanel value="biography-surveys">
                <UserBiographySurveysView v-if="activeTab === 'biography-surveys'" />
            </TabPanel>
            <TabPanel value="student-biography">
                <UserStudentBiographyView v-if="activeTab === 'student-biography'" />
            </TabPanel>
        </TabPanels>
    </Tabs>
    </div>
</template>

<script setup>
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
import { ref, watch, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import UserListView from './UserListView.vue';
import UserPendingView from './UserPendingView.vue';
import UserFormView from './UserFormView.vue';
import UserBulkPreviewView from './UserBulkPreviewView.vue';
import UserBiographySurveysView from './UserMonkBiographyView.vue';
import UserBhikkhuBiographyView from './UserBhikkhuBiographyView.vue';
import UserStudentBiographyView from './UserStudentBiographyView.vue';
import UserMekudiBiographyView from './UserMekudiBiographyView.vue';
import PagodaMonkBiographyView from '@/views/pagoda/PagodaMonkBiographyView.vue';
import { useRoute, useRouter } from 'vue-router';
import { UserRoundCheck, MailWarning, UserPlus, FileDown, BookOpen, GraduationCap, ClipboardList } from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('all-users');

const VALID_TABS = computed(() => {
    const tabs = ['all-users'];
    if (authStore.isMonk) tabs.push('my-biography');
    tabs.push('user-form', 'biography-surveys', 'student-biography');
    return tabs;
});

const onFormClose = () => {
    activeTab.value = 'all-users';
}

onMounted(() => {
    const requestedTab = route.query.tab;
    if (requestedTab && VALID_TABS.value.includes(requestedTab)) {
        activeTab.value = requestedTab;
    } else if (requestedTab) {
        activeTab.value = 'all-users';
        router.replace({ query: { ...route.query, tab: 'all-users' } });
    }
});

watch(activeTab, (newTab) => {
    if (route.query.tab !== newTab) {
        router.replace({ query: { ...route.query, tab: newTab } });
    }
});
</script>
