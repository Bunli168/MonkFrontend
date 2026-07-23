<template>
    <div class="d-flex justify-content-center w-100">
        <div style="max-width: 800px; width: 100%;">
            <div class="card">
                <div class="card-body p-3" style="background-color: var(--body-bg-color); border-radius: var(--border-radius);">
                    <div v-if="isFetching" class="d-flex justify-content-center align-items-center" style="height: 300px;">
                        <span class="spinner-border text-primary" role="status"></span>
                    </div>
                    <div v-else-if="reportDetails" class="d-flex flex-column">
                        <!-- Title Area -->
                        <div class="pb-3">
                            <div class="d-flex align-items-start justify-content-between gap-3">
                                <div>
                                    <h4 class="fw-bold mb-2" style="color: var(--text-heading-color); font-size: 1.5rem;">{{ reportDetails.title || 'Untitled Report' }}</h4>
                                    <div class="d-flex flex-wrap align-items-center gap-2 text-sm">
                                        <BaseBadge :status="reportDetails.status" />
                                        <div class="d-inline-flex align-items-center rounded-pill fw-medium" style="background-color: var(--surface-ground); font-size: 0.8rem; color: var(--text-heading-color); border: 1px solid var(--border-color); padding: 0.2rem 0.6rem; column-gap: 0.4rem;">
                                            <Tag :size="13" :style="{ color: getCategoryColorHex(reportDetails.category?.name) }" :stroke-width="2.5" class="flex-shrink-0" />
                                            <span>{{ reportDetails.category?.name || 'Uncategorized' }}</span>
                                        </div>
                                        <span class="text-muted ms-2 d-flex align-items-center gap-1">
                                            <Calendar :size="14" />
                                            {{ formatDateTime(reportDetails.createdAt) }}
                                        </span>
                                    </div>
                                </div>
                                <BaseActionMenu v-if="reportStore.reportStatus?.length" :items="statusActionItems" :disabled="isUpdatingStatus" />
                            </div>
                        </div>

                        <div class="main-divider mb-3"></div>

                        <!-- Description -->
                        <div class="mb-3">
                            <p class="mb-0" style="white-space: pre-line; line-height: 1.7; font-size: 1rem; color: var(--text-base);">
                                {{ reportDetails.description || 'No description provided.' }}
                            </p>
                        </div>
                        
                        <!-- Images -->
                        <div v-if="reportDetails.images?.length" class="mb-3">
                            <h6 class="fw-bold text-muted mb-2 text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;">Attached Evidence</h6>
                            <div class="d-flex flex-wrap gap-2">
                                <Image
                                    class="flex-fill d-flex align-items-center justify-content-center bg-secondary-subtle"
                                    imageClass="w-100 h-100 object-fit-cover"
                                    :style="[
                                        { borderRadius: 'var(--border-inner-radius)', overflow: 'hidden' },
                                        reportDetails.images.length === 1 ? { height: '350px', maxHeight: '350px' } : { height: '180px', minWidth: '180px' }
                                    ]"
                                    v-for="img in reportDetails.images" :key="img.id"
                                    alt="Evidence" :src="$authImg(img.imageUrl)" preview lazy="true" />
                            </div>
                        </div>

                        <!-- Reporter Info -->
                        <div >
                            <h6 class="fw-semibold text-muted mb-2 text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;">Reported By</h6>
                            <div class="d-flex align-items-center gap-3 p-3" style="background-color: var(--surface-ground); border-radius: var(--border-inner-radius);">
                                <img v-if="reportDetails.reporter?.avatarUrl" :src="$authImg(reportDetails.reporter.avatarUrl)" alt="Avatar" class="rounded-circle" width="48" height="48" style="object-fit: cover; border: 2px solid var(--surface-card);" />
                                <div v-else class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 48px; height: 48px; background-color: var(--body-bg-color); border: 2px solid var(--surface-card); color: var(--text-muted, #6c757d);">
                                    <UserCircle :size="32" :stroke-width="1.5" />
                                </div>
                                <div v-if="reportDetails.reporter">
                                    <h6 class="mb-0 fw-bold">{{ reportDetails.reporter.firstName }} {{ reportDetails.reporter.lastName }}</h6>
                                    <small class="text-muted">{{ reportDetails.reporter.email }}</small>
                                </div>
                                <div v-else>
                                    <h6 class="mb-0 fw-bold text-secondary">Unknown Reporter</h6>
                                    <small class="text-muted">No contact information</small>
                                </div>
                            </div>
                        </div>

                        <!-- Resolution & Feedback -->
                        <div v-if="reportDetails.resolution" class="p-3 mt-3" style="background-color: var(--surface-ground); border-radius: var(--border-inner-radius)">
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <div class="p-2 rounded-circle d-flex align-items-center justify-content-center" style="background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); width: 40px; height: 40px;">
                                    <MessageSquareCheck :size="20" />
                                </div>
                                <div>
                                    <h6 class="fw-semibold text-primary" style="font-size: 1.1rem; line-height: 1;">Resolution & Feedback</h6>
                                    <div v-if="reportDetails.resolution.rating" class="d-flex align-items-center gap-1">
                                        <Star v-for="i in 5" :key="i" :size="14" :class="i <= reportDetails.resolution.rating ? 'text-warning fill-warning' : 'text-muted'" :fill="i <= reportDetails.resolution.rating ? 'currentColor' : 'none'" />
                                    </div>
                                </div>
                            </div>
                            
                            <p class="mb-3" style="line-height: 1.6; color: var(--text-heading-color); font-size: 0.95rem; font-style: italic;">
                                "{{ reportDetails.resolution.comment || reportDetails.resolution.review || 'No comment provided.' }}"
                            </p>

                            <!-- Existing Admin Reply -->
                            <div v-if="reportDetails.resolution.reply && !isEditingReply" class="mt-3 p-3 rounded" style="background: var(--body-bg-color); border: 1px solid var(--border-clr);">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <button class="btn btn-link p-0 text-xs text-primary text-decoration-none fw-medium" @click="startEditingReply">
                                        Edit Reply
                                    </button>
                                </div>
                                <p class="mb-0 text-sm" style="color: var(--text-heading-color); line-height: 1.5; white-space: pre-line;">{{ reportDetails.resolution.reply }}</p>
                            </div>


                            <div v-else>
                            <div class="main-divider mb-3"></div>
                                <BaseInput
                                    label="Reply to Resolution Rating"
                                    required
                                    v-model="replyText"
                                    type="textarea"
                                    :rows="3"
                                    :maxlength="256"
                                    class="mb-3"
                                    placeholder="Write a response to the student's rating..."
                                />
                                <div class="d-flex justify-content-end gap-2">
                                    <BaseButton v-if="isEditingReply" variant="outline-secondary" label="Cancel" @click="cancelEditingReply" />
                                    <BaseButton variant="primary" :label="reportDetails.resolution.reply ? 'Update Reply' : 'Send Reply'" :disabled="!replyText.trim() || isSubmittingReply" :isLoading="isSubmittingReply" @click="handleReplySubmit" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-5 my-3 text-muted d-flex flex-column align-items-center justify-content-center gap-3">
                        <div class="d-flex align-items-center justify-content-center rounded-circle p-4" style="background-color: var(--surface-ground); color: var(--text-muted, #6c757d);">
                            <FileQuestion :size="48" :stroke-width="1.5" />
                        </div>
                        <div>
                            <h6 class="fw-bold mb-1" style="color: var(--text-heading-color);">No Report Selected</h6>
                            <p class="text-muted text-sm mb-0">Please select a report from the list to view its details.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { formatDateTime } from '@/utils/dateFormat';
import Image from 'primevue/image';
import { FileQuestion, UserCircle, Tag, Star, Calendar, MessageSquareCheck } from '@lucide/vue';
import { getCategoryColorHex } from '@/utils/statusTheme';
import { useReportStore } from '@/stores/reports/report';

const reportStore = useReportStore();

const props = defineProps({
    reportDetails: {
        type: Object,
        default: null
    },
    isFetching: {
        type: Boolean,
        default: false
    }
});

defineEmits(['close']);

const replyText = ref('');
const isSubmittingReply = ref(false);
const isEditingReply = ref(false);
const isUpdatingStatus = ref(false);

const startEditingReply = () => {
    replyText.value = props.reportDetails?.resolution?.reply || '';
    isEditingReply.value = true;
};

const cancelEditingReply = () => {
    isEditingReply.value = false;
    replyText.value = '';
};

const handleReplySubmit = async () => {
    if (!replyText.value.trim() || !props.reportDetails?.resolution) return;
    
    const resolutionId = props.reportDetails.resolution.id || props.reportDetails.resolution.resolutionId;
    if (!resolutionId) return;

    isSubmittingReply.value = true;
    try {
        const success = await reportStore.replyToResolution(resolutionId, { reply: replyText.value.trim() });
        if (success) {
            props.reportDetails.resolution.reply = replyText.value.trim();
            isEditingReply.value = false;
            replyText.value = '';
        }
    } finally {
        isSubmittingReply.value = false;
    }
};

const statusActionItems = computed(() => {
    if (!reportStore.reportStatus) return [];
    
    return reportStore.reportStatus.map(statusObj => {
        const value = typeof statusObj === 'object' ? (statusObj.value || statusObj.label) : statusObj;
        return {
            label: 'Mark as',
            badge: value,
            command: async () => {
                if (props.reportDetails?.status === value) return;
                const id = props.reportDetails?.id || props.reportDetails?._id;
                if (!id) return;
                
                isUpdatingStatus.value = true;
                try {
                    const success = await reportStore.updateReportStatus(id, { status: value }, true);
                    if (success) {
                        props.reportDetails.status = value;
                    }
                } finally {
                    isUpdatingStatus.value = false;
                }
            }
        };
    });
});

watch(() => props.reportDetails, () => {
    isEditingReply.value = false;
    replyText.value = '';
}, { immediate: true });
</script>
