<template>
    <div class="card border-0" style="background-color: var(--body-bg-color, #0f172a); color: var(--text-color, #f8fafc); border-radius: var(--border-inner-radius)">
        <div class="row g-0">
            <div class="col-12 d-flex flex-column align-items-center justify-content-center p-4 position-relative" style="min-height: 180px;">
                <img class="object-fit-cover rounded-circle shadow-sm mb-2"
                    style="width: 110px; height: 110px; border: 3px solid var(--primary-color, #f59e0b);"
                    :src="avatarUrl"
                    alt="User Avatar">
            </div>

            <div class="col-12">
                <div class="card-body pt-0">
                    <div class="d-flex flex-wrap justify-content-between align-items-start mb-3">
                        <div>
                            <h4 class="card-title mb-1 fw-bold text-heading">
                                {{ displayName }}
                            </h4>
                            <h6 class="card-subtitle text-warning text-capitalize fw-semibold">
                                {{ displayRole || 'No Role Assigned' }}
                            </h6>
                        </div>
                        <span class="badge rounded-pill" :class="user?.isActive ? 'bg-success' : 'bg-secondary'">
                            {{ user?.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <hr class="border-secondary opacity-25">

                    <ul class="ps-0 mb-0 d-flex flex-column gap-2">
                        <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                            <strong class="label-text me-2">Email:</strong>
                            <a :href="`mailto:${user?.email}`" class="text-decoration-none text-info fw-medium">{{ user?.email }}</a>
                        </li>

                        <template v-if="user?.UserProfile || user?.profile">
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">Phone / លេខទូរស័ព្ទ:</strong> 
                                <span class="fw-medium value-text">{{ user?.UserProfile?.phone_number || user?.profile?.phone || surveyData?.phone_number || 'N/A' }}</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">Kudi / កុដិ:</strong> 
                                <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-6 fw-bold">
                                    {{ kudiName }}
                                </span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom text-capitalize">
                                <strong class="label-text me-2">Gender:</strong> 
                                <span class="value-text">{{ user?.UserProfile?.gender || user?.profile?.gender || 'N/A' }}</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">DOB:</strong> 
                                <span class="value-text">{{ formatDate(user?.UserProfile?.date_of_birth || user?.dob || user?.profile?.dateOfBirth || surveyData?.date_of_birth) || 'N/A' }}</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">Chhaya ID:</strong> 
                                <span class="value-text">{{ user?.UserProfile?.chhaya_number || 'N/A' }}</span>
                            </li>

                            <!-- Ordination Details / ព័ត៌មានបព្វជ្ជា -->
                            <li class="list-group-item px-0 py-2 border-0 bg-transparent mt-2">
                                <div class="p-3 rounded-3 details-box">
                                    <div class="d-flex align-items-center gap-2 mb-2 text-warning fw-bold">
                                        <BookOpen :size="18" />
                                        <span>Ordination Details / ព័ត៌មានបព្វជ្ជា</span>
                                    </div>
                                    <div class="row g-2 small">
                                        <div class="col-12" v-if="surveyData?.ordained_name">
                                            <strong class="label-text">Ordained Name / ភិក្ខុ/សាមណេរ:</strong> 
                                            <span class="value-text fw-medium ms-1">{{ surveyData.ordained_name }}</span>
                                        </div>
                                        <div class="col-12">
                                            <strong class="label-text">Preceptor / ព្រះឧបជ្ឈាយ៍:</strong> 
                                            <span class="value-text fw-medium ms-1">{{ surveyData?.preceptor_name || 'N/A' }}</span>
                                        </div>
                                        <div class="col-sm-6">
                                            <strong class="label-text">Ordained Date:</strong> 
                                            <span class="value-text fw-medium ms-1">{{ formatDate(surveyData?.ordained_date) || 'N/A' }}</span>
                                        </div>
                                        <div class="col-sm-6">
                                            <strong class="label-text">Ordination Wat:</strong> 
                                            <span class="value-text fw-medium ms-1">{{ surveyData?.ordination_wat || user?.UserProfile?.from_wat || 'N/A' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">School / University:</strong> 
                                <span class="value-text">{{ user?.UserProfile?.university_name || user?.profile?.university_name || 'N/A' }}</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">Year:</strong> 
                                <span class="value-text">{{ user?.UserProfile?.university_year ? 'Year ' + user?.UserProfile?.university_year : (user?.profile?.university_year ? 'Year ' + user?.profile?.university_year : 'N/A') }}</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text me-2">Seating:</strong>
                                <span v-if="user?.UserProfile?.seating_row_id || user?.profile?.seating_row_id" class="value-text">
                                    Row {{ user?.profile?.seatingRow?.row_num || user?.UserProfile?.seating_row_id || user?.profile?.seating_row_id }}
                                    <span v-if="user?.UserProfile?.seat_number || user?.profile?.seat_number">
                                        (Seat {{ user?.UserProfile?.seat_number || user?.profile?.seat_number }})
                                    </span>
                                </span>
                                <span v-else class="text-muted">Not Assigned</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text d-block mb-1">Wat Origin / មកពីវត្ត:</strong>
                                <div class="ps-3" style="font-size: 0.9rem;">
                                    <div><strong class="label-text">From Wat:</strong> <span class="value-text">{{ user?.UserProfile?.from_wat || user?.profile?.from_wat || 'N/A' }}</span></div>
                                    <div><strong class="label-text">Village:</strong> <span class="value-text">{{ getBirthAddressField(user, 'village') || 'N/A' }}</span></div>
                                    <div><strong class="label-text">Commune:</strong> <span class="value-text">{{ getBirthAddressField(user, 'commune') || 'N/A' }}</span></div>
                                    <div><strong class="label-text">District:</strong> <span class="value-text">{{ getBirthAddressField(user, 'district') || 'N/A' }}</span></div>
                                    <div><strong class="label-text">Province:</strong> <span class="value-text">{{ getBirthAddressField(user, 'province') || 'N/A' }}</span></div>
                                </div>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 bg-transparent text-body-custom">
                                <strong class="label-text d-block mb-1">Bio:</strong>
                                <p class="mb-0 value-text small">{{ user?.UserProfile?.bio || user?.profile?.bio || 'No biography provided.' }}</p>
                            </li>
                        </template>

                        <li v-else class="list-group-item px-0 py-2 border-0 bg-transparent text-muted fst-italic small">
                            Detailed profile data is currently unavailable.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { formatDate } from '@/utils/dateFormat.js';
import { getAuthImageUrl } from '@/utils/imageUrl.js';
import { BookOpen } from '@lucide/vue';
import api from '@/api/api';

const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

const surveyData = ref(null);

const fetchMonkSurvey = async (userId) => {
    if (!userId) return;
    try {
        const res = await api.get(`/monk-surveys/${userId}`);
        if (res.data?.success) {
            surveyData.value = res.data.data;
        }
    } catch (e) {
        console.error('Failed to fetch monk survey for user:', e);
    }
};

watch(() => props.user?.id, async (newId) => {
    if (newId) {
        fetchMonkSurvey(newId);
    }
}, { immediate: true });

const displayName = computed(() => {
    if (!props.user) return '';
    const profile = props.user.UserProfile || props.user.profile;
    const nameKh = (profile?.first_name_kh || profile?.last_name_kh) ? `${profile?.first_name_kh || ''} ${profile?.last_name_kh || ''}`.trim() : '';
    const nameEn = (profile?.first_name_en || profile?.last_name_en) ? `${profile?.first_name_en || ''} ${profile?.last_name_en || ''}`.trim() : '';
    return nameKh || nameEn || props.user.name || 'User';
});

const displayRole = computed(() => {
    return props.user?.Role?.name || props.user?.role?.name || props.user?.role || 'Member';
});

const kudiName = computed(() => {
    if (!props.user) return 'N/A';
    const profile = props.user.UserProfile || props.user.profile;
    if (surveyData.value?.kudi_number) return surveyData.value.kudi_number;
    if (profile?.Kut?.name) return profile.Kut.name;
    if (profile?.kut_id) return `Kudi ${profile.kut_id}`;
    return 'N/A';
});

const avatarUrl = computed(() => {
    if (!props.user) return '';
    const profile = props.user.UserProfile || props.user.profile;
    const url = profile?.avatar_url || profile?.avatarUrl;
    if (url) return getAuthImageUrl(url);
    const initials = displayName.value ? displayName.value.split(/\s+/).map(n => n[0]).join('+') : 'U';
    return `https://ui-avatars.com/api/?name=${initials}&background=random`;
});

const getBirthAddressField = (user, field) => {
    if (!user || !user.Addresses) return '';
    const addr = user.Addresses.find(a => a.address_type === 'birth_place');
    return addr ? addr[field] : '';
};
</script>

<style scoped>
.text-heading {
    color: var(--text-heading-color, #ffffff);
}

.label-text {
    color: var(--text-muted-color, #94a3b8);
}

.value-text {
    color: var(--text-color, #f8fafc);
}

.details-box {
    background-color: var(--surface-ground, #1e293b);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

/* Light Mode Support */
@media (prefers-color-scheme: light) {
    .label-text {
        color: #64748b;
    }
    .value-text {
        color: #0f172a;
    }
    .text-heading {
        color: #0f172a;
    }
}
</style>