<template>
    <div class="card" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
        <div class="row g-0">
            <div class="col-12 d-flex flex-column align-items-center justify-content-center p-4 position-relative" style="min-height: 220px;">
                <img class="object-fit-cover rounded-circle shadow-sm mb-3"
                    style="width: 120px; height: 120px; border: 3px solid var(--primary-color);"
                    :src="avatarUrl"
                    alt="User Avatar">
                
                <BaseButton variant="outline-primary" size="sm" @click="showQrModal = true" class="d-flex align-items-center gap-2">
                    <QrCode :size="16" />
                    <span>Personal QR Code / កូដ QR បុគ្គល</span>
                </BaseButton>
            </div>

            <div class="col-12">
                <div class="card-body pt-0">
                    <div class="d-flex flex-wrap justify-content-between align-items-start">
                        <div>
                            <h4 class="card-title mb-1 fw-bold">
                                {{ displayName }}
                            </h4>
                            <h6 class="card-subtitle text-primary text-capitalize fw-semibold">
                                {{ displayRole || 'No Role Assigned' }}
                            </h6>
                        </div>
                        <span class="badge rounded-pill" :class="user?.isActive ? 'bg-success' : 'bg-secondary'">
                            {{ user?.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <hr>

                    <ul class="ps-0 mb-0">
                        <li class="list-group-item px-0 py-1 border-0">
                            <strong class="text-secondary me-2">Email:</strong>
                            <a :href="`mailto:${user?.email}`" class="text-decoration-none text-primary">{{ user?.email }}</a>
                        </li>

                        <template v-if="user?.UserProfile || user?.profile">
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Phone / លេខទូរស័ព្ទ:</strong> 
                                <span class="fw-medium text-body">{{ user?.UserProfile?.phone_number || user?.profile?.phone || surveyData?.phone_number || 'N/A' }}</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Kudi / កុដិ:</strong> 
                                <span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-6 fw-bold">
                                    {{ kudiName }}
                                </span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 text-capitalize">
                                <strong class="text-secondary me-2">Gender:</strong> {{ user?.UserProfile?.gender || user?.profile?.gender || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">DOB:</strong> {{ formatDate(user?.UserProfile?.date_of_birth || user?.dob || user?.profile?.dateOfBirth || surveyData?.date_of_birth) || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Chhaya ID:</strong> {{ user?.UserProfile?.chhaya_number || 'N/A' }}
                            </li>

                            <!-- Ordination Details / ព័ត៌មានបព្វជ្ជា -->
                            <li class="list-group-item px-0 py-2 border-0 mt-2">
                                <div class="p-3 rounded-3" style="background-color: var(--surface-ground); border: 1px solid var(--border-color);">
                                    <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
                                        <BookOpen :size="18" />
                                        <span>Ordination Details / ព័ត៌មានបព្វជ្ជា</span>
                                    </div>
                                    <div class="row g-2 small text-secondary">
                                        <div class="col-12" v-if="surveyData?.ordained_name">
                                            <strong>Ordained Name / ភិក្ខុ/សាមណេរ:</strong> 
                                            <span class="text-body fw-medium ms-1">{{ surveyData.ordained_name }}</span>
                                        </div>
                                        <div class="col-12">
                                            <strong>Preceptor / ព្រះឧបជ្ឈាយ៍:</strong> 
                                            <span class="text-body fw-medium ms-1">{{ surveyData?.preceptor_name || 'N/A' }}</span>
                                        </div>
                                        <div class="col-12" v-if="surveyData?.first_assistant_name">
                                            <strong>1st Assistant / គ្រូសូត្រស្តាំ:</strong> 
                                            <span class="text-body fw-medium ms-1">{{ surveyData.first_assistant_name }}</span>
                                        </div>
                                        <div class="col-12" v-if="surveyData?.second_assistant_name">
                                            <strong>2nd Assistant / គ្រូសូត្រឆ្វេង:</strong> 
                                            <span class="text-body fw-medium ms-1">{{ surveyData.second_assistant_name }}</span>
                                        </div>
                                        <div class="col-sm-6">
                                            <strong>Ordained Date:</strong> 
                                            <span class="text-body fw-medium ms-1">{{ formatDate(surveyData?.ordained_date) || 'N/A' }}</span>
                                        </div>
                                        <div class="col-sm-6">
                                            <strong>Ordination Wat:</strong> 
                                            <span class="text-body fw-medium ms-1">{{ surveyData?.ordination_wat || user?.UserProfile?.from_wat || 'N/A' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">School / University:</strong> {{ user?.UserProfile?.university_name || user?.profile?.university_name || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Year:</strong> {{ user?.UserProfile?.university_year ? 'Year ' + user?.UserProfile?.university_year : (user?.profile?.university_year ? 'Year ' + user?.profile?.university_year : 'N/A') }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Seating:</strong>
                                <span v-if="user?.UserProfile?.seating_row_id || user?.profile?.seating_row_id">
                                    Row {{ user?.profile?.seatingRow?.row_num || user?.UserProfile?.seating_row_id || user?.profile?.seating_row_id }}
                                    <span v-if="user?.UserProfile?.seat_number || user?.profile?.seat_number">
                                        (Seat {{ user?.UserProfile?.seat_number || user?.profile?.seat_number }})
                                    </span>
                                </span>
                                <span v-else class="text-muted">Not Assigned</span>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary d-block mb-1">Wat Origin / មកពីវត្ត:</strong>
                                <div class="ps-3 text-muted" style="font-size: 0.9rem;">
                                    <div><strong class="text-secondary">From Wat:</strong> {{ user?.UserProfile?.from_wat || user?.profile?.from_wat || 'N/A' }}</div>
                                    <div><strong class="text-secondary">Village:</strong> {{ getBirthAddressField(user, 'village') || 'N/A' }}</div>
                                    <div><strong class="text-secondary">Commune:</strong> {{ getBirthAddressField(user, 'commune') || 'N/A' }}</div>
                                    <div><strong class="text-secondary">District:</strong> {{ getBirthAddressField(user, 'district') || 'N/A' }}</div>
                                    <div><strong class="text-secondary">Province:</strong> {{ getBirthAddressField(user, 'province') || 'N/A' }}</div>
                                </div>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary d-block mb-1">Bio:</strong>
                                <p class="mb-0 text-muted small">{{ user?.UserProfile?.bio || user?.profile?.bio || 'No biography provided.' }}
                                </p>
                            </li>
                        </template>

                        <li v-else class="list-group-item px-0 py-2 border-0 text-muted fst-italic small">
                            Detailed profile data is currently unavailable.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Personal QR Modal -->
    <BaseModal v-model="showQrModal" title="Personal QR Code / កូដ QR បុគ្គល" size="sm">
        <div class="text-center p-3">
            <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">{{ displayName }}</h5>
            <div class="text-primary fw-medium small mb-3">{{ displayRole }}</div>

            <div class="p-3 bg-white rounded-3 d-inline-block shadow-sm mb-3">
                <QrcodeVue :value="qrDataString" :size="200" level="H" />
            </div>

            <div class="p-3 rounded-3 text-start small mb-3" style="background-color: var(--surface-ground); border: 1px solid var(--border-color);">
                <div class="mb-1"><strong>Phone:</strong> {{ user?.UserProfile?.phone_number || user?.profile?.phone || surveyData?.phone_number || 'N/A' }}</div>
                <div class="mb-1"><strong>Kudi:</strong> {{ kudiName }}</div>
                <div class="mb-1"><strong>Preceptor:</strong> {{ surveyData?.preceptor_name || 'N/A' }}</div>
                <div><strong>Ordained Date:</strong> {{ formatDate(surveyData?.ordained_date) || 'N/A' }}</div>
            </div>

            <BaseButton variant="primary" class="w-100" @click="showQrModal = false">
                Close
            </BaseButton>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { formatDate } from '@/utils/dateFormat.js';
import { getAuthImageUrl } from '@/utils/imageUrl.js';
import { BookOpen, QrCode } from '@lucide/vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import QrcodeVue from 'qrcode.vue';
import api from '@/api/api';

const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

const showQrModal = ref(false);
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

watch(() => props.user?.id, (newId) => {
    if (newId) fetchMonkSurvey(newId);
}, { immediate: true });

const displayName = computed(() => {
    if (!props.user) return '';
    const profile = props.user.UserProfile || props.user.profile;
    if (profile) {
        const khName = `${profile.last_name_kh || ''} ${profile.first_name_kh || ''}`.trim();
        if (khName) return khName;
        const enName = `${profile.first_name_en || ''} ${profile.last_name_en || ''}`.trim();
        if (enName) return enName;
    }
    if (props.user.firstName || props.user.lastName) {
        return `${props.user.lastName || ''} ${props.user.firstName || ''}`.trim();
    }
    return props.user.email || '';
});

const displayRole = computed(() => {
    if (!props.user) return '';
    return props.user.Role?.name || props.user.role?.name || '';
});

const kudiName = computed(() => {
    if (!props.user) return 'N/A';
    const profile = props.user.UserProfile || props.user.profile;
    if (profile?.Kut?.name) return profile.Kut.name;
    if (profile?.kut?.name) return profile.kut.name;
    if (profile?.kut_id) return `Kudi ${profile.kut_id}`;
    if (surveyData.value?.kudi_number) return surveyData.value.kudi_number;
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

const qrDataString = computed(() => {
    const profile = props.user?.UserProfile || props.user?.profile;
    const dataObj = {
        id: props.user?.id,
        type: 'user_personal_profile',
        name: displayName.value,
        phone: profile?.phone_number || profile?.phone || surveyData.value?.phone_number || '',
        kudi: kudiName.value,
        ordained_name: surveyData.value?.ordained_name || '',
        preceptor_name: surveyData.value?.preceptor_name || '',
        ordained_date: surveyData.value?.ordained_date || '',
        ordination_wat: surveyData.value?.ordination_wat || profile?.from_wat || ''
    };
    return JSON.stringify(dataObj);
});

const getBirthAddressField = (user, field) => {
    if (!user || !user.Addresses) return '';
    const addr = user.Addresses.find(a => a.address_type === 'birth_place');
    return addr ? addr[field] : '';
};
</script>