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

            <div ref="qrContainerRef" class="p-3 bg-white rounded-3 d-inline-block shadow-sm mb-3">
                <QrcodeVue :value="qrDataString" :size="200" level="H" />
            </div>

            <div class="p-3 rounded-3 text-start small mb-3" style="background-color: var(--surface-ground); border: 1px solid var(--border-color);">
                <div class="mb-1"><strong>Phone:</strong> {{ user?.UserProfile?.phone_number || user?.profile?.phone || surveyData?.phone_number || 'N/A' }}</div>
                <div class="mb-1"><strong>Kudi:</strong> {{ kudiName }}</div>
                <div class="mb-1"><strong>Preceptor:</strong> {{ surveyData?.preceptor_name || 'N/A' }}</div>
                <div><strong>Ordained Date:</strong> {{ formatDate(surveyData?.ordained_date) || 'N/A' }}</div>
            </div>

            <div class="d-flex gap-2">
                <BaseButton variant="outline-primary" class="flex-grow-1 d-flex align-items-center justify-content-center gap-1" @click="downloadQrCode">
                    <Download :size="16" />
                    <span>Download QR</span>
                </BaseButton>
                <BaseButton variant="secondary" class="flex-grow-1" @click="showQrModal = false">
                    Close
                </BaseButton>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { formatDate } from '@/utils/dateFormat.js';
import { getAuthImageUrl } from '@/utils/imageUrl.js';
import { BookOpen, QrCode, Download } from '@lucide/vue';
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
const qrContainerRef = ref(null);
const surveyData = ref(null);

const downloadQrCode = () => {
    if (!qrContainerRef.value) return;
    const qrCanvas = qrContainerRef.value.querySelector('canvas');
    if (!qrCanvas) return;

    // Standard Portrait ID Card canvas dimensions: 600px x 900px
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Solid Clean Dark Background (#0f172a)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Card Frame & Top Gold Accent Ribbon
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(16, 16, width - 32, 10);

    // 3. Pagoda Header (Top Header Section)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('វត្តនគរវន / NEAKAVORN PAGODA', width / 2, 75);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('OFFICIAL MEMBER IDENTITY CARD', width / 2, 105);

    // Gold Divider Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 125);
    ctx.lineTo(width - 60, 125);
    ctx.stroke();

    // 4. Monk Name & Role Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(displayName.value, width / 2, 175);

    const roleName = (displayRole.value || 'Monk').toUpperCase();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(roleName, width / 2, 205);

    // 5. Large Centered QR Code Container (330px x 330px)
    const qrBoxSize = 340;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 240;

    // White Card Frame for QR Code
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw QR Code centered inside White Frame
    const qrImageSize = 300;
    const qrImgX = qrBoxX + (qrBoxSize - qrImageSize) / 2;
    const qrImgY = qrBoxY + (qrBoxSize - qrImageSize) / 2;
    ctx.drawImage(qrCanvas, qrImgX, qrImgY, qrImageSize, qrImageSize);

    // 6. Kudi & Phone Container Box
    const infoY = 610;
    const infoWidth = width - 80;
    const infoHeight = 180;
    const infoX = (width - infoWidth) / 2;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(infoX, infoY, infoWidth, infoHeight, 18);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Kudi Highlight Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(`កុដិស្នាក់នៅ / KUDI: ${kudiName.value}`, width / 2, infoY + 50);

    // Phone / Contact Info
    const phoneVal = user.value?.UserProfile?.phone_number || user.value?.profile?.phone || surveyData.value?.phone_number || 'N/A';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 17px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Phone: ${phoneVal}`, width / 2, infoY + 95);

    // Ordained Name if available
    const ordainedNameVal = surveyData.value?.ordained_name || '';
    if (ordainedNameVal) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '15px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Ordained Name: ${ordainedNameVal}`, width / 2, infoY + 135);
    }

    // 7. Footer Notice
    ctx.fillStyle = '#64748b';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Neakavorn Pagoda Management System • Scan for Verification', width / 2, height - 40);

    // Download PNG File
    const link = document.createElement('a');
    link.download = `ID_CARD_QR_${displayName.value.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

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