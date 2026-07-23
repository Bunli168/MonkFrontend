<script setup>
import ReportForm from '@/components/forms/reports/ReportForm.vue';
import { onMounted, ref} from 'vue';
import { useReportManager } from '@/composables/reports/useReportManager';
import { useFeedbackManager } from '@/composables/reports/useFeedbackManager';
import { Image, Panel } from 'primevue';
import { Pencil, Trash, Calendar, MessageSquare, Search, ArrowDownAZ, ArrowUpZA, Filter, Plus, ClipboardList, User, ChevronRight } from '@lucide/vue';
import { computed, watch } from 'vue';
import { useSearchAndFilter } from '@/composables/common/useSearchAndFilter';
import { useOwnReportstore } from '@/stores/reports/ownReport';
import { formatDate } from '@/utils/dateFormat';
import ResolutionRatingForm from '@/components/forms/reports/ResolutionRatingForm.vue';
import TnakReportSkeleton from '@/components/skeletons/TnakReportSkeleton.vue';
import BaseInfiniteScroll from '@/components/base/BaseInfiniteScroll.vue';
import { useAuthStore } from '@/stores/auth';
import ReportView from '@/views/admin/reports/ReportView.vue';

const authStore = useAuthStore();
const isManageRole = computed(() => {
    return authStore.hasRole(['Admin', 'SuperAdmin']);
});

const vImageLoad = {
    mounted(el) {
        const img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (img) {
            const hideSpinner = () => {
                if (el.previousElementSibling && el.previousElementSibling.classList.contains('image-spinner')) {
                    el.previousElementSibling.style.display = 'none';
                }
            };
            if (img.complete) {
                hideSpinner();
            } else {
                img.addEventListener('load', hideSpinner);
            }
        }
    }
};

const reportFormRef = ref(null);
const feedbackReportFormRefs = ref({});

const ownReportStore = useOwnReportstore();

const reportManager = useReportManager(ownReportStore, reportFormRef);
const feedbackManager = useFeedbackManager(ownReportStore, feedbackReportFormRefs);

import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isFormVisible = computed({
    get: () => route.query.view === 'form',
    set: (value) => {
        router.push({
            query: {
                ...route.query,
                view: value ? 'form' : undefined,
                editId: value ? route.query.editId : undefined
            }
        });
    }
});

const handleEdit = (report) => {
    router.push({
        query: {
            ...route.query,
            view: 'form',
            editId: report.id
        }
    });
};

const isSubmitting = ref(false);
const feedbackValidity = ref({});

const handleMobileSubmit = async () => {
    if (!reportFormRef.value) return;
    const isValid = await reportFormRef.value.validateForm();
    if (!isValid) return;

    isSubmitting.value = true;
    const success = await reportManager.submit(isValid);
    isSubmitting.value = false;
    if (success) {
        isFormVisible.value = false;
    }
};

watch([() => route.query.editId, () => ownReportStore.ownReports], ([newId, reports]) => {
    if (newId && reports.length > 0) {
        const report = reports.find(r => String(r.id) === String(newId));
        if (report) {
            reportManager.edit(report);
        }
    } else if (!newId) {
        reportManager.cancel();
    }
}, { immediate: true });

const getReportActionItems = (report) => [
    {
        label: 'Edit',
        icon: Pencil,
        command: () => handleEdit(report)
    },
    {
        label: 'Delete',
        icon: Trash,
        iconClass: 'text-danger',
        textClass: 'text-danger',
        command: () => reportManager.delete(report.id)
    }
];

const getFeedbackActionItems = (report) => [
    {
        label: 'Edit',
        icon: Pencil,
        command: () => { feedbackManager.getState(report.id).isEditFeedback = true; }
    },
    {
        label: 'Delete',
        icon: Trash,
        iconClass: 'text-danger',
        textClass: 'text-danger',
        command: () => feedbackManager.delete(report.id)
    }
];


const activeFeedbackIds = ref([]);
const handleFeedbackClick = (reportId) => {
    if (feedbackManager.getState(reportId).isLoading) return;
    if (!activeFeedbackIds.value.includes(reportId)) {
        activeFeedbackIds.value.push(reportId);
        feedbackManager.togglePanel({ value: false }, reportId);
    } else {
        activeFeedbackIds.value = activeFeedbackIds.value.filter(id => id !== reportId);
    }
};

const { isEdit, editingReport } = reportManager;



const sortOptions = [
    { label: 'Sort by Title', value: 'title' },
    { label: 'Sort by Status', value: 'status' },
    { label: 'Sort by Date', value: 'createdAt' }
];

const handleFilterChange = async (filters) => {
    ownReportStore.search = filters.search;
    ownReportStore.statusFilter = filters.status;
    ownReportStore.sortBy = filters.sortBy;
    ownReportStore.sortOrder = filters.sortDir;
    ownReportStore.page = 1;
    await ownReportStore.getOwnReports({ showLoading: true });
};

const searchAndFilter = useSearchAndFilter(
    { 
        status: ownReportStore.statusFilter || 'all',
        sortBy: ownReportStore.sortBy || 'createdAt',
        sortDir: ownReportStore.sortOrder || 'desc'
    },
    handleFilterChange
);

const toggleSortDir = () => {
    searchAndFilter.filters.value.sortDir = searchAndFilter.filters.value.sortDir === 'desc' ? 'asc' : 'desc';
};

const hasMore = computed(() => {
    return ownReportStore.page < (ownReportStore.totalPages || 1);
});

const isLoadingMore = ref(false);

const onLoadMore = async () => {
    if (isLoadingMore.value || ownReportStore.isLoading || !hasMore.value) return;
    isLoadingMore.value = true;
    ownReportStore.page++;
    await ownReportStore.getOwnReports({ append: true });
    isLoadingMore.value = false;
};

onMounted(async () => {
    ownReportStore.setupSocketListeners();
    if (ownReportStore.ownReports.length === 0 || ownReportStore.page > 1) {
        ownReportStore.page = 1;
        await ownReportStore.getOwnReports({ showLoading: true });
    }
});

</script>

<template>
    <ReportView v-if="isManageRole" />
    <div v-else>
        <transition name="fade" mode="out-in">
            <div v-if="isFormVisible" class="pb-3 w-100 mx-auto" style="max-width: 600px;">
            <div>
                <div class="card" style="background-color: var(--surface-ground);">
                    <div class="card-body p-3"
                        style="background-color: var(--body-bg-color); border-radius: var(--border-radius) !important;">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h5 class="mb-0">{{ isEdit ? 'Edit Report' : 'Create New Report' }}</h5>
                        </div>
                        <ReportForm ref="reportFormRef" :initial-data="editingReport" :is-loading="isSubmitting" />
                        <div class="d-flex gap-2 mt-3">
                            <BaseButton @click="() => { reportManager.cancel(); isFormVisible = false; }" type="button"
                                variant="outline-primary" class="flex-grow-1" :disabled="isSubmitting">Cancel
                            </BaseButton>
                            <BaseButton @click="handleMobileSubmit" :isLoading="isSubmitting" type="button"
                                class="flex-grow-1">
                                {{ isEdit ?
                                    isSubmitting ? 'Updating...' : 'Update Now' :
                                    isSubmitting ? 'Reporting...' : 'Report Now' }}
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="pb-3">
            <div class="row g-3">
                <!-- Left Aside: Filters & Actions (col-4) -->
                <div class="col-12 col-md-4 col-lg-4">
                    <div class="card p-3 d-flex flex-column gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06)); position: sticky; top: 1rem;">
                        <div class="d-flex align-items-center justify-content-between">
                            <h6 class="fw-semibold mb-0 d-flex align-items-center gap-2" style="color: var(--text-base); font-size: 1rem;">
                                <Filter :size="16" />
                                <span>Filters & Actions</span>
                            </h6>
                        </div>
                        <div class="main-divider my-0"></div>

                        <!-- Search -->
                        <div>
                            <BaseInput 
                                label="Search Reports"
                                v-model="searchAndFilter.searchQuery.value" 
                                placeholder="Search by title..." 
                                :prefixIcon="Search"
                                clearable
                            />
                        </div>

                        <!-- Sort By -->
                        <div>
                            <label class="form-label mb-2">Sort Order</label>
                            <div class="d-flex gap-2">
                                <BaseSelect
                                    v-model="searchAndFilter.filters.value.sortBy"
                                    :options="sortOptions"
                                    placeholder="Sort by"
                                    class="flex-grow-1"
                                />
                                <BaseButton 
                                    type="button" 
                                    variant="outline-primary" 
                                    @click="toggleSortDir"
                                    v-tooltip="searchAndFilter.filters.value.sortDir === 'desc' ? 'Sort: Descending' : 'Sort: Ascending'"
                                    class="d-flex align-items-center justify-content-center px-3 flex-shrink-0"
                                >
                                    <ArrowDownAZ v-if="searchAndFilter.filters.value.sortDir === 'desc'" :size="18" />
                                    <ArrowUpZA v-else :size="18" />
                                </BaseButton>
                            </div>
                        </div>

                        <div class="main-divider my-0"></div>

                        <!-- Create Report Action -->
                        <div>
                            <BaseButton @click="() => { reportManager.cancel(); isFormVisible = true; }" variant="primary" class="w-100 py-2.5 d-flex align-items-center justify-content-center gap-2">
                                <Plus :size="16" />
                                <span>Create New Report</span>
                            </BaseButton>
                        </div>
                    </div>
                </div>

                <!-- Right List: Reports (col-8) -->
                <div class="col-12 col-md-8 col-lg-8">
                    <div class="row g-3">
                        
                        <!-- My Reports Column (col-12) -->
                        <div class="col-12">
                            <h6 class="fw-semibold mb-3 d-flex align-items-center gap-2" style="color: var(--text-base);">
                                <Calendar :size="16" />
                                <span>My Reports</span>
                            </h6>
                            
                            <div v-if="ownReportStore.isLoading">
                                <TnakReportSkeleton :count="4" />
                            </div>

                            <div v-else-if="ownReportStore.ownReports.length === 0" class="text-center my-3 text-muted card p-4" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                                <p class="mb-0">No reports found.</p>
                            </div>

                            <div v-else class="d-flex flex-column gap-3">
                                <div class="w-100" v-for="report in ownReportStore.ownReports" :key="report.id">
                                <div class="card report-card p-3 d-flex flex-column justify-content-between h-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                                    <div>
                                        <!-- Header Row: Status -->
                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                                <BaseBadge :status="report.status" />
                                            </div>
                                            <BaseActionMenu v-if="report.status?.toLowerCase() !== 'resolved'" :items="getReportActionItems(report)" />
                                            <button v-else v-tooltip.top="'Resolution & Feedback'"
                                                :disabled="feedbackManager.getState(report.id).isLoading"
                                                @click="handleFeedbackClick(report.id)"
                                                class="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 feedback-toggle-btn"
                                                :class="activeFeedbackIds.includes(report.id) ? 'btn-success text-white' : 'text-success bg-success-subtle'">
                                                <span v-if="feedbackManager.getState(report.id).isLoading" class="spinner-border spinner-border-sm" role="status" style="border-width: 0.15em;"></span>
                                                <MessageSquare v-else :size="16" stroke-width="2.5" />
                                            </button>
                                        </div>

                                        <!-- Title & Date -->
                                        <div class="mb-3">
                                            <h5 class="fw-semibold mb-1 text-truncate" style="color: var(--text-base); letter-spacing: -0.01em; font-size: 1.1rem;">
                                                {{ report.title }}
                                            </h5>
                                            <div class="d-flex align-items-center gap-1 text-muted" style="font-size: 0.8rem;">
                                                <Calendar :size="13" class="text-muted" />
                                                <span>Reported on {{ formatDate(report.submitted_at) }}</span>
                                            </div>
                                        </div>

                                        <!-- Main Content / Feedback Toggle -->
                                        <transition name="fade" mode="out-in">
                                            <div v-if="!activeFeedbackIds.includes(report.id)" class="d-flex flex-column gap-3">
                                                <!-- Full Width Cover Image / Image Gallery -->
                                                <div v-if="report.images?.length > 0 && report.images[0].imageUrl" class="report-cover-container rounded position-relative overflow-hidden w-100" style="background-color: var(--surface-ground);">
                                                    <div class="image-spinner position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center" style="z-index: 0;">
                                                        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                                                    </div>
                                                    <Image v-image-load :src="$authImg(report.images[0].imageUrl)" alt="Report Image" class="w-100 h-100 position-relative" imageClass="w-100 h-100 object-fit-cover d-block" style="z-index: 1;" preview />
                                                    <span v-if="report.images?.length > 1" class="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white fw-normal px-2 py-1 shadow-sm d-flex align-items-center gap-1" style="font-size: 0.75rem; z-index: 2; backdrop-filter: blur(4px);">
                                                        <i class="pi pi-images me-1"></i>
                                                        <span>{{ report.images.length }} Photos</span>
                                                    </span>
                                                </div>

                                                <!-- Description Text -->
                                                <div class="report-description text-muted mb-0" style="font-size: 0.9rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                                    {{ report?.content || 'No detailed description provided.' }}
                                                </div>
                                            </div>

                                            <!-- Feedback & Resolution Section when active -->
                                            <div v-else class="mt-2 d-flex flex-column gap-3">
                                                <div class="main-divider my-0"></div>
                                                <div class="rounded p-3 resolution-feedback-box" style="background-color: var(--surface-ground);">
                                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                                        <div class="ms-auto d-flex gap-2"
                                                            v-if="feedbackManager.getState(report.id).hasRating && !feedbackManager.getState(report.id).isEditFeedback">
                                                            <BaseActionMenu :items="getFeedbackActionItems(report)" />
                                                        </div>
                                                    </div>
                                                    <div class="position-relative">
                                                        <div v-if="feedbackManager.getState(report.id).isLoading"
                                                            class="d-flex justify-content-center align-items-center py-4">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div v-show="!feedbackManager.getState(report.id).isLoading">
                                                            <ResolutionRatingForm
                                                                :initialData="feedbackManager.getState(report.id).ratingData"
                                                                :disabled="!feedbackManager.getState(report.id).isEditFeedback"
                                                                :ref="(el) => { if (el) feedbackReportFormRefs[report.id] = el }"
                                                                @update:validity="(val) => feedbackValidity[report.id] = val" />

                                                            <div class="mt-3 d-flex gap-2"
                                                                v-if="feedbackManager.getState(report.id).isEditFeedback">
                                                                <BaseButton
                                                                    @click="activeFeedbackIds = activeFeedbackIds.filter(id => id !== report.id)"
                                                                    variant="outline-primary" type="button" class="w-100">
                                                                    Cancel
                                                                </BaseButton>
                                                                <BaseButton @click="feedbackManager.submit(report?.id)" :is-loading="feedbackManager.getState(report.id).isSubmitting" :disabled="!feedbackValidity[report.id]" class="w-100">
                                                                    {{ feedbackManager.getState(report.id).isSubmitting ? (feedbackManager.getState(report.id).hasRating ? 'Updating...' : 'Submitting...') : (feedbackManager.getState(report.id).hasRating ? 'Update' : 'Submit') }}
                                                                </BaseButton>
                                                            </div>
                                                            <div class="mt-3" v-else>
                                                                <BaseButton class="w-100" variant="outline-primary" @click="activeFeedbackIds = activeFeedbackIds.filter(id => id !== report.id)">
                                                                    Close
                                                                </BaseButton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </transition>
                                    </div>
                                </div>
                            </div>
                            
                            <BaseInfiniteScroll
                                v-if="ownReportStore.ownReports.length > 0 && !ownReportStore.isLoading"
                                :is-loading="isLoadingMore || ownReportStore.isLoading"
                                :has-more="hasMore"
                                @load-more="onLoadMore"
                                class="mt-4"
                            />
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </transition>
    </div>
</template>

<style scoped>
.report-image-wrapper {
    flex: 0 0 100%;
    height: 200px;
    overflow: hidden;
    border-radius: calc(var(--border-radius) - 1rem);
}

@media (min-width: 576px) {
    .report-image-wrapper {
        flex: 0 0 150px;
        height: 150px;
    }
}

.report-image-wrapper :deep(.p-image),
.report-image-wrapper :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

:deep(.p-panel-header),
:deep(.p-panel-content) {
    background-color: var(--surface-ground);
    border-radius: calc(var(--border-radius) - 1rem);
}

:deep(.p-panel-content) {
    margin-top: 0.5rem;
    padding-top: 1rem;
}

.sort-select {
    max-width: 100%;
}

@media (min-width: 768px) {
    .sort-select {
        max-width: 200px;
    }
}

.report-cover-container {
    aspect-ratio: 16 / 9;
    min-height: 170px;
}

.report-cover-container :deep(.p-image),
.report-cover-container :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.feedback-toggle-btn {
    width: 34px;
    height: 34px;
    border: none;
    transition: all 0.2s ease;
}

.feedback-toggle-btn:hover {
    transform: scale(1.05);
}
</style>