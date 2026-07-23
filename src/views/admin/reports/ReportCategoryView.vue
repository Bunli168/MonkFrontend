<template>
    <div class="d-flex flex-column gap-2">
        <div class="card p-2" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2 flex-grow-1 search-sort-container" style="min-width: 250px;">
                    <div class="flex-grow-1 search-container">
                        <BaseInput 
                            v-model="searchAndFilter.searchQuery.value" 
                            placeholder="Search categories..." 
                            :prefixIcon="Search"
                            clearable
                        />
                    </div>
                    <BaseButton 
                        type="button" 
                        variant="outline-primary" 
                        @click="toggleSortDir"
                        v-tooltip="searchAndFilter.filters.value.sortDir === 'desc' ? 'Sort: Newest First' : 'Sort: Oldest First'"
                        class="h-100 flex-shrink-0"
                    >
                        <ClockArrowDown v-if="searchAndFilter.filters.value.sortDir === 'desc'" :size="18" />
                        <ClockArrowUp v-else :size="18" />
                    </BaseButton>
                </div>
                <div class="button-container flex-shrink-0">
                    <BaseButton class="btn btn-primary text-nowrap w-100 h-100" @click="$emit('new')">
                        Add Category
                    </BaseButton>
                </div>
            </div>
        </div>

        <ReportCategorySkeleton v-if="reportCategoryStore.isLoading || isInitialLoad" :count="4" />
        <div v-else-if="!reportCategoryStore.reportCategories?.length">
            <DashboardEmptyData title="No Categories Found" description="Get started by creating your very first report category using the form." />
        </div>
        <div v-else class="row g-2">
            <div class="col-xl-3 col-lg-4 col-md-6" v-for="category in reportCategoryStore.reportCategories" :key="category.id">
                <div class="card p-2 gap-2 h-100"
                    style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
                    <div class="card-header pe-2 py-1 bg-transparent d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2 fw-semibold text-base" :class="isExpanded(category.id) ? '' : 'text-truncate'" style="color: var(--text-heading-color);">
                            <Tag :size="18" :style="{ color: getCategoryColorHex(category.name) }" :stroke-width="2.5" class="flex-shrink-0" />
                            <span :class="isExpanded(category.id) ? 'text-break' : 'text-truncate'">{{ category.name }}</span>
                        </div>
                        <div>
                            <BaseActionMenu :items="getActionItems(category)" />
                        </div>
                    </div>
                    <div class="card-body" style="background-color: var(--surface-ground); border-radius: calc(var(--border-inner-radius) - 0.5rem) !important;">
                        <div class="mb-0 text-muted small" :class="isExpanded(category.id) ? 'text-break' : 'text-truncate'">
                            {{ category.description || 'No description provided.' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <BaseInfiniteScroll
            v-if="reportCategoryStore.reportCategories?.length"
            :is-loading="isLoadingMore"
            :has-more="reportCategoryStore.page < reportCategoryStore.totalPages"
            @load-more="loadMore"
        />
    </div>
</template>

<script setup>
import DashboardEmptyData from '@/components/common/DashboardEmptyData.vue';
import { useReportCategoryStore } from '@/stores/reports/reportCategory';
import { Pencil, Trash, Search, ClockArrowDown, ClockArrowUp, Tag, ChevronDown, ChevronUp } from '@lucide/vue';
import { getCategoryColorHex } from '@/utils/statusTheme';
import { onMounted, ref } from 'vue';
import ReportCategorySkeleton from '@/components/skeletons/ReportCategorySkeleton.vue';
import BaseInfiniteScroll from '@/components/base/BaseInfiniteScroll.vue';
import { useSearchAndFilter } from '@/composables/common/useSearchAndFilter.js';

const emit = defineEmits(['new', 'edit']);
const reportCategoryStore = useReportCategoryStore();
const isLoadingMore = ref(false);
const isInitialLoad = ref(true);

const expandedCategories = ref({});
const toggleExpand = (id) => {
    expandedCategories.value[id] = !expandedCategories.value[id];
};
const isExpanded = (id) => !!expandedCategories.value[id];

const toggleSortDir = () => {
    searchAndFilter.filters.value.sortDir = searchAndFilter.filters.value.sortDir === 'desc' ? 'asc' : 'desc';
};

const handleFilterChange = async (filters) => {
    reportCategoryStore.search = filters.search;
    reportCategoryStore.sortOrder = filters.sortDir;
    reportCategoryStore.page = 1;
    await reportCategoryStore.getAllReportCategories({ showLoading: true });
};

const searchAndFilter = useSearchAndFilter(
    { sortDir: reportCategoryStore.sortOrder },
    handleFilterChange
);

const deletingReportCategoryId = ref(null);

const onUpdate = (category) => {
    emit('edit', category);
}

const onDelete = (categoryId) => {
    deletingReportCategoryId.value = categoryId;
    handleDelete();
}

const getActionItems = (category) => [
    {
        label: isExpanded(category.id) ? 'Show Less' : 'Read More',
        icon: isExpanded(category.id) ? ChevronUp : ChevronDown,
        command: () => toggleExpand(category.id),
        iconClass: 'text-primary'
    },
    {
        label: 'Edit',
        icon: Pencil,
        command: () => onUpdate(category),
        iconClass: 'text-warning'
    },
    {
        label: 'Delete',
        icon: Trash,
        command: () => onDelete(category.id),
        iconClass: 'text-danger'
    }
];

const handleDelete = async () => {
    if (!deletingReportCategoryId.value) return;

    const success = await reportCategoryStore.deleteReportCategory(deletingReportCategoryId.value);
    if (success) {
        reportCategoryStore.page = 1;
        await reportCategoryStore.getAllReportCategories({ forceRefresh: true });
    }
}

const loadMore = async () => {
    if (reportCategoryStore.page >= reportCategoryStore.totalPages || isLoadingMore.value) return;
    isLoadingMore.value = true;
    reportCategoryStore.page++;
    await reportCategoryStore.getAllReportCategories({ append: true });
    isLoadingMore.value = false;
}

onMounted(async () => {
    reportCategoryStore.search = searchAndFilter.searchQuery.value;
    reportCategoryStore.sortDir = searchAndFilter.filters.value.sortDir;
    reportCategoryStore.page = 1;
    await reportCategoryStore.getAllReportCategories({ showLoading: true });
    isInitialLoad.value = false;
})
</script>

<style scoped>
@media (min-width: 768px) {
    .search-container {
        max-width: 300px;
    }
}
@media (max-width: 575.98px) {
    .button-container {
        flex-grow: 1 !important;
        width: 100%;
    }
}
</style>