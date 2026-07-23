<template>
    <div>
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2" style="background-color: var(--surface-ground);">
        <div>
            <TabList>
                <Tab value="report-list" :disabled="activeTab === 'category-form' || activeTab === 'report-detail'">
                    <div class="d-flex align-items-center gap-2">
                        <MessageCircleWarning style="color: var(--warning-color);" :size="16" />
                        All Province District Commune Reports
                    </div>
                </Tab>
                <Tab value="report-category" :disabled="activeTab === 'category-form' || activeTab === 'report-detail'">
                    <div class="d-flex align-items-center gap-2">
                        <Tags style="color: var(--success-color);" :size="16" />
                        Report Category
                    </div>
                </Tab>
                <Tab value="category-form" v-show="activeTab === 'category-form'">
                    <div class="d-flex align-items-center gap-2">
                        <FileSignature style="color: var(--primary-color);" :size="16" />
                        {{ editingCategory ? 'Edit Category' : 'New Category' }}
                    </div>
                </Tab>
                <Tab value="report-detail" v-show="activeTab === 'report-detail'" @click="onDetailClose">
                    <div class="d-flex align-items-center gap-2">
                        <ArrowLeft :size="16" />
                        Report Details (Back)
                    </div>
                </Tab>
            </TabList>
        </div>
        <TabPanels class="p-0 bg-transparent">
            <TabPanel value="report-list">
                <ReportListView v-if="activeTab === 'report-list'" @view-detail="onViewDetail" />
            </TabPanel>
            <TabPanel value="report-category">
                <ReportCategoryView v-if="activeTab === 'report-category'" @edit="onEditCategory" @new="onNewCategory" />
            </TabPanel>
            <TabPanel value="category-form">
                <ReportCategoryFormView v-if="activeTab === 'category-form'" :initial-data="editingCategory" @close="onFormClose" />
            </TabPanel>
            <TabPanel value="report-detail">
                <ReportDetailView v-if="activeTab === 'report-detail'" :report-details="selectedReportDetails" :is-fetching="isFetchingDetails" @close="onDetailClose" />
            </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
import ReportListView from './ReportListView.vue';
import ReportCategoryView from './ReportCategoryView.vue';
import ReportCategoryFormView from './ReportCategoryFormView.vue';
import ReportDetailView from './ReportDetailView.vue';
import { useReportStore } from '@/stores/reports/report';
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessageCircleWarning, Tags, FileSignature, FileText, ArrowLeft } from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const reportStore = useReportStore();

const activeTab = ref('report-list');
const VALID_TABS = ['report-list', 'report-category', 'category-form', 'report-detail'];

const editingCategory = ref(null);
const selectedReportId = ref(null);
const selectedReportDetails = ref(null);
const isFetchingDetails = ref(false);

const onEditCategory = (category) => {
    editingCategory.value = category;
    activeTab.value = 'category-form';
}

const onNewCategory = () => {
    editingCategory.value = null;
    activeTab.value = 'category-form';
}

const onFormClose = () => {
    editingCategory.value = null;
    activeTab.value = 'report-category';
}

const onViewDetail = async (report) => {
    const reportId = report.id || report._id || report;
    selectedReportId.value = reportId;
    activeTab.value = 'report-detail';
    isFetchingDetails.value = true;
    selectedReportDetails.value = null;

    const data = await reportStore.getReportById(reportId);
    if (!data) {
        onDetailClose(); // redirects back to 'report-list'
        isFetchingDetails.value = false;
        return;
    }
    
    selectedReportDetails.value = data;
    isFetchingDetails.value = false;
}

const onDetailClose = () => {
    selectedReportId.value = null;
    selectedReportDetails.value = null;
    activeTab.value = 'report-list';
}

// Initialize from URL on mount
onMounted(() => {
    if (route.query.tab === 'report-detail' && route.query.id) {
        activeTab.value = 'report-detail';
        onViewDetail(route.query.id);
    } else if (route.query.tab && VALID_TABS.includes(route.query.tab) && route.query.tab !== 'report-detail') {
        activeTab.value = route.query.tab;
    } else if (route.query.tab) {
        // Fix the URL if tab is invalid or missing required ID
        router.replace({ query: { ...route.query, tab: activeTab.value } });
    }
});

// Update URL when tab or selected report ID changes
watch([activeTab, selectedReportId], ([newTab, newId]) => {
    const query = { ...route.query, tab: newTab };
    if (newTab === 'report-detail' && newId) {
        query.id = newId;
    } else {
        delete query.id;
    }
    router.replace({ query });
});
</script>
