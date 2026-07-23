<template>
    <div>
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 overflow-auto pb-1 pb-xl-0 d-flex align-items-center gap-2" style="min-width: 0;">
                
                <BaseFilter v-model="searchAndFilter.filters.value.status" :options="filterOptions" style="min-width: max-content;" />
            </div>

            <div class="d-flex align-items-center gap-2 flex-shrink-0" v-if="selectedReportForUpdate">
                <div class="d-flex align-items-center gap-2 px-2 py-1 rounded" style="background-color: var(--surface-ground); border: 1px solid var(--border-color); max-width: 260px;">
                    <span class="text-sm fw-medium text-truncate" style="color: var(--text-heading-color); font-size: 0.85rem;">{{ selectedReportForUpdate.title }}</span>
                    <button class="btn btn-link p-0 text-muted d-flex align-items-center flex-shrink-0 border-0" @click="selectedReportForUpdate = null; bulkUpdateStatus = null;" title="Cancel">
                        <X :size="16" />
                    </button>
                </div>
                <BaseSelect v-model="bulkUpdateStatus" :options="reportStore.reportStatus"
                    placeholder="Change status">
                    <template #value="slotProps">
                        <BaseBadge v-if="slotProps.value" :status="typeof slotProps.value === 'object' ? (slotProps.value.value || slotProps.value.label) : slotProps.value" />
                        <span v-else>Change status</span>
                    </template>
                    <template #option="slotProps">
                        <BaseBadge :status="typeof slotProps.option === 'object' ? (slotProps.option.value || slotProps.option.label) : slotProps.option" />
                    </template>
                </BaseSelect>
                <BaseButton :disabled="!bulkUpdateStatus || isBulkUpdating || bulkUpdateStatus === selectedReportForUpdate?.status" @click="onUpdateStatus()" variant="primary" :isLoading="isBulkUpdating">
                    Update
                </BaseButton>
            </div>
            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0" v-else>
                <div class="search-input">
                    <BaseInput 
                        v-model="searchAndFilter.searchQuery.value" 
                        placeholder="Search reports..." 
                        :prefixIcon="Search"
                        clearable
                    />
                </div>
                <div class="category-select">
                    <BaseSelect 
                        v-model="searchAndFilter.filters.value.categoryId" 
                        :options="localCategoryOptions"
                        placeholder="Category"
                        :loading="isFetchingCategories"
                        @load-more="loadCategories(false)"
                    >
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="d-flex align-items-center gap-2">
                                <Tag v-if="slotProps.value !== 'all'" :size="14" :style="{ color: getCategoryColorHex(getSelectedCategoryLabel(slotProps.value)) }" :stroke-width="2.5" />
                                <span>{{ getSelectedCategoryLabel(slotProps.value) }}</span>
                            </div>
                            <span v-else>Category</span>
                        </template>
                        <template #option="slotProps">
                            <div class="d-flex align-items-center gap-2 w-100">
                                <Tag v-if="slotProps.option.value !== 'all'" :size="14" :style="{ color: getCategoryColorHex(slotProps.option.label) }" :stroke-width="2.5" class="flex-shrink-0" />
                                <span class="text-truncate">{{ slotProps.option.label }}</span>
                            </div>
                        </template>
                    </BaseSelect>
                </div>

            </div>
        </div>
        <BaseTable :columns="colDefs" :rows="reportStore.reports"
            :loading="reportStore.isLoading" :total-records="reportStore.totalItems" v-model:page="reportStore.page"
            v-model:per-page="reportStore.perPage" v-model:sort-by="reportStore.sortBy"
            v-model:sort-order="reportStore.sortOrder" @refresh-data="reportStore.getAllReports"
            :rowClass="getReportRowClass">

            <template #imageUrl="{ data }">
                <div class="d-flex align-items-center">
                    <Image
                        imageClass="object-fit-cover w-100 h-100"
                        style="border-radius: var(--border-radius); overflow: hidden; border: 2px solid var(--surface-ground); margin-right: -8px; width: 36px; height: 36px;"
                        v-for="(image, idx) in data?.images?.slice(0, 2)" :key="idx" alt="Image" :src="$authImg(image.imageUrl)" preview
                        lazy="true" />
                    <div v-if="data?.images?.length > 2" 
                        class="d-flex align-items-center justify-content-center fw-bold text-muted rounded-circle"
                        style="width: 36px; height: 36px; background-color: var(--border-clr); border: 2px solid var(--surface-ground); font-size: 0.75rem; z-index: 1; cursor: pointer;"
                        @click="openReportDetails(data)"
                        :title="`View ${data.images.length - 2} more images in details`">
                        +{{ data.images.length - 2 }}
                    </div>
                    <div v-if="!data?.images?.length"
                        class="d-flex align-items-center text-muted justify-content-center"
                        style="width: 36px; height: 36px; border-radius: var(--border-radius); background-color: var(--surface-ground);">
                        <ImageIcon :size="20" :stroke-width="1.5" />
                    </div>
                </div>
            </template>
            <template #title="{ data }">
                <div class="truncate-2-lines">{{ data?.title }}</div>
            </template>
            <template #description="{ data }">
                <div class="truncate-2-lines">{{ data?.content }}</div>
            </template>
            <template #category="{ data }">
                <div class="d-flex align-items-center gap-2 fw-medium" style="font-size: 0.85rem; color: var(--text-heading-color); min-width: 0;">
                    <Tag :size="15" :style="{ color: getCategoryColorHex(data.category?.name) }" :stroke-width="2.5" class="flex-shrink-0" />
                    <span class="truncate-1-line" :title="data.category?.name || 'Uncategorized'">{{ data.category?.name || 'Uncategorized' }}</span>
                </div>
            </template>
            <template #createdAt="{ data }">
                <div>{{ formatDateTime(data?.submitted_at) }}</div>
            </template>
            <template #status="{ data }">
                <BaseBadge 
                    :status="(isBulkUpdating && selectedReportForUpdate?.id === data.id && bulkUpdateStatus) ? bulkUpdateStatus : data.status"
                    :loading="isBulkUpdating && selectedReportForUpdate?.id === data.id"
                />
            </template>
            <template #action="{ data }">
                <BaseActionMenu :items="getActions(data)" />
            </template>
        </BaseTable>
    </div>
</template>

<script setup>
import { useReportStore } from '@/stores/reports/report';
import { useReportCategoryStore } from '@/stores/reports/reportCategory';
import { useToastStore } from '@/stores/toast';
import { formatDateTime } from '@/utils/dateFormat';
import Image from 'primevue/image';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { Image as ImageIcon, Eye, Search, Tag, X } from '@lucide/vue';
import { useSearchAndFilter } from '@/composables/common/useSearchAndFilter';
import { getCategoryColorHex } from '@/utils/statusTheme';

const reportStore = useReportStore();
const reportCategoryStore = useReportCategoryStore();
const toastStore = useToastStore();

const selectedReportForUpdate = ref(null);
const bulkUpdateStatus = ref(null);
const isBulkUpdating = ref(false);

const emit = defineEmits(['view-detail']);

const openReportDetails = (report) => {
    emit('view-detail', report);
};

const getActions = (data) => [
    {
        label: 'View Details',
        icon: Eye,
        command: () => openReportDetails(data)
    },
    {
        label: 'Update Status',
        icon: Tag,
        command: () => {
            selectedReportForUpdate.value = data;
            bulkUpdateStatus.value = data.status || null;
        }
    }
];

// FIX: Added safe navigation (?.) to prevent crashes on initial render
const filterOptions = computed(() => [
    { label: 'All Province District Commune Reports', value: 'all', badge: reportStore.statusStats?.['all'] || 0 },
    { label: 'Pending', value: 'pending', badge: reportStore.statusStats?.['pending'] || 0, variant: 'warning' },
    { label: 'In Progress', value: 'in_progress', badge: reportStore.statusStats?.['in_progress'] || 0, variant: 'info' },
    { label: 'Resolved', value: 'resolved', badge: reportStore.statusStats?.['resolved'] || 0, variant: 'success' },
    { label: 'Rejected', value: 'rejected', badge: reportStore.statusStats?.['rejected'] || 0, variant: 'danger' }
]);

const handleFilterChange = async (filters) => {
    reportStore.search = filters.search;
    reportStore.statusFilter = filters.status;
    reportStore.categoryId = filters.categoryId;
    reportStore.page = 1;
    await reportStore.getAllReports({ showLoading: true });
};

const searchAndFilter = useSearchAndFilter(
    { 
        categoryId: reportStore.categoryId || 'all',
        status: reportStore.statusFilter || 'all'
    },
    handleFilterChange
);

const hasActiveFilters = computed(() => {
    return !!searchAndFilter.searchQuery.value || 
           searchAndFilter.filters.value.status !== 'all' || 
           searchAndFilter.filters.value.categoryId !== 'all';
});

const resetFilters = () => {
    searchAndFilter.searchQuery.value = '';
    searchAndFilter.filters.value.status = 'all';
    searchAndFilter.filters.value.categoryId = 'all';
};

const localCategoryOptions = ref([{ label: 'All Categories', value: 'all' }]);
const categoryPage = ref(1);
const hasMoreCategories = ref(true);
const isFetchingCategories = ref(false);

const getSelectedCategoryLabel = (val) => {
    if (!val || val === 'all') return 'All Categories';
    const found = localCategoryOptions.value.find(opt => opt.value === val);
    return found ? found.label : 'Category';
};

const loadCategories = async (reset = true) => {
    if (reset) {
        categoryPage.value = 1;
        localCategoryOptions.value = [{ label: 'All Categories', value: 'all' }];
        hasMoreCategories.value = true;
    }
    
    if (!hasMoreCategories.value || isFetchingCategories.value) return;
    
    isFetchingCategories.value = true;
    try {
        await reportCategoryStore.getAllReportCategories({ _page: categoryPage.value, _per_page: 10 });
        const categories = reportCategoryStore.reportCategories || [];
        
        if (categories.length < 10) {
            hasMoreCategories.value = false;
        }
        
        const newOptions = categories
            .filter(c => !localCategoryOptions.value.some(opt => opt.value === c.id))
            .map(c => ({ label: c.name, value: c.id }));
        
        localCategoryOptions.value = [...localCategoryOptions.value, ...newOptions];
        categoryPage.value++;
    } finally {
        isFetchingCategories.value = false;
    }
}

const onUpdateStatus = async () => {
    if (!bulkUpdateStatus.value || !selectedReportForUpdate.value) return;

    isBulkUpdating.value = true;
    try {
        const id = selectedReportForUpdate.value.id || selectedReportForUpdate.value._id;
        const res = await reportStore.updateReportStatus(id, { status: bulkUpdateStatus.value }, true);
        if (res) {
            await reportStore.getAllReports({ forceRefresh: true, showLoading: false });
            selectedReportForUpdate.value = null;
            bulkUpdateStatus.value = null;
        }
    } finally {
        isBulkUpdating.value = false;
    }
};

const getReportRowClass = (data) => {
    return (data && data.status === 'REJECTED') ? 'row-border-danger opacity-75' : '';
};

const colDefs = [
    { field: 'imageUrl', header: 'Media', sortable: false },
    { field: 'title', header: 'Report Title' },
    { field: 'category', header: 'Category' },
    { field: 'status', header: 'Status' },
    { field: 'createdAt', header: 'Reported On' },
    { field: 'description', header: 'Description', sortable: false },
    { field: 'action', header: '', sortable: false },
]

onMounted(async () => {
    reportStore.setupSocketListeners();
    loadCategories();
    await reportStore.getAllReports({ showLoading: reportStore.reports.length === 0 });
    await reportStore.getReportStatus();
    reportStore.fetchStatusStats();
});

onUnmounted(() => {
    reportStore.search = '';
    reportStore.statusFilter = 'all';
    reportStore.categoryId = 'all';
    reportStore.page = 1;
});
</script>