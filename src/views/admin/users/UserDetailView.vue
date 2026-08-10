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

            <div class="p-3 rounded-3 text-center small mb-3" style="background-color: var(--surface-ground); border: 1px solid var(--border-color);">
                <div v-if="kudiName && kudiName !== 'N/A'" class="fw-bold text-warning mb-1">ស្នាក់នៅ៖ {{ kudiName }}</div>
                <div v-if="user?.UserProfile?.phone_number || user?.profile?.phone || surveyData?.phone_number" class="mb-1"><strong>ទូរស័ព្ទ៖</strong> {{ user?.UserProfile?.phone_number || user?.profile?.phone || surveyData?.phone_number }}</div>
                <div v-if="surveyData?.ordained_name"><strong>នាមបញ្ញត្តិ៖</strong> {{ surveyData.ordained_name }}</div>
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

    const width = 540;
    const fontFamily = '"Khmer OS Battambang", "Hanuman", "Noto Sans Khmer", sans-serif';

    // 1. Prepare details first to calculate exact dynamic height without bottom space
    const phoneVal = (user.value?.UserProfile?.phone_number || user.value?.profile?.phone || surveyData.value?.phone_number || '').trim();
    const ordainedNameVal = (surveyData.value?.ordained_name || '').trim();
    const rawKudi = (kudiName.value !== 'N/A' ? kudiName.value : '').trim();
    let kudiVal = '';
    if (rawKudi) {
        const cleanKudiNum = rawKudi.replace(/kudi|កុដិ|លេខ\s*/gi, '').trim();
        kudiVal = cleanKudiNum ? `កុដិលេខ ${cleanKudiNum}` : `កុដិ ${rawKudi}`;
    }

    const textLines = [];
    if (kudiVal) textLines.push({ text: `ស្នាក់នៅ៖ ${kudiVal}`, color: '#b45309', font: `bold 19px ${fontFamily}` });
    if (phoneVal) textLines.push({ text: `លេខទូរស័ព្ទ៖ ${phoneVal}`, color: '#334155', font: `bold 15px ${fontFamily}` });
    if (ordainedNameVal) textLines.push({ text: `នាមបញ្ញត្តិ៖ ${ordainedNameVal}`, color: '#475569', font: `bold 14px ${fontFamily}` });

    const roleStr = (displayRole.value || '').trim();
    const qrBoxSize = 290;
    const qrBoxY = roleStr ? 205 : 175;
    const infoY = qrBoxY + qrBoxSize + 20;
    const infoHeight = textLines.length > 0 ? (textLines.length * 36 + 14) : 0;
    const footerY = infoY + (infoHeight > 0 ? infoHeight + 24 : 18);
    const height = footerY + 36; // Exact dynamic card height!

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const drawCenteredText = (text, y, font, color, baseline = 'top') => {
        const cleanText = (text || '').toString().replace(/\s+/g, ' ').trim();
        if (!cleanText) return;
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textBaseline = baseline;
        ctx.textAlign = 'center';
        ctx.fillText(cleanText, width / 2, y);
        ctx.restore();
    };

    // 2. Light White-Gray Theme Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(0.5, '#f8fafc');
    bgGradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 3. Outer Frame dynamically sized to fit height
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(12, 12, width - 24, height - 24, 20);
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(18, 18, width - 36, height - 36, 16);
    ctx.stroke();

    // Top Gold Decorative Ribbon
    const goldBarGrad = ctx.createLinearGradient(20, 0, width - 20, 0);
    goldBarGrad.addColorStop(0, '#b45309');
    goldBarGrad.addColorStop(0.5, '#f59e0b');
    goldBarGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = goldBarGrad;
    ctx.beginPath();
    ctx.roundRect(22, 19, width - 44, 5, 2.5);
    ctx.fill();

    // 4. Pagoda Header (Khmer Title)
    drawCenteredText('វត្តនាគវ័ន', 38, `bold 28px ${fontFamily}`, '#b45309');
    drawCenteredText('ប័ណ្ណសម្គាល់ខ្លួនសមាជិក', 78, `bold 14px ${fontFamily}`, '#0284c7');

    // Ornate Gold Line Divider
    const divY = 108;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, divY);
    ctx.lineTo(width / 2 - 18, divY);
    ctx.moveTo(width / 2 + 18, divY);
    ctx.lineTo(width - 50, divY);
    ctx.stroke();

    // Diamond accent
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(width / 2, divY - 5);
    ctx.lineTo(width / 2 + 5, divY);
    ctx.lineTo(width / 2, divY + 5);
    ctx.lineTo(width / 2 - 5, divY);
    ctx.closePath();
    ctx.fill();

    // 5. Member Name
    const nameStr = (displayName.value || 'សមាជិក').trim();
    drawCenteredText(nameStr, 126, `bold 26px ${fontFamily}`, '#0f172a');

    // Role Pill Badge if present
    if (roleStr) {
        const roleWidth = Math.max(140, roleStr.length * 12);
        const roleX = (width - roleWidth) / 2;
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(roleX, 168, roleWidth, 24, 12);
        ctx.fill();
        ctx.stroke();
        drawCenteredText(roleStr, 172, `bold 12px ${fontFamily}`, '#0369a1');
    }

    // 6. Centered White QR Code Box
    const qrBoxX = (width - qrBoxSize) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const qrImageSize = 255;
    const qrImgX = qrBoxX + (qrBoxSize - qrImageSize) / 2;
    const qrImgY = qrBoxY + (qrBoxSize - qrImageSize) / 2;
    ctx.drawImage(qrCanvas, qrImgX, qrImgY, qrImageSize, qrImageSize);

    // 7. Info Box
    if (textLines.length > 0) {
        const infoWidth = 460;
        const infoX = (width - infoWidth) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(infoX, infoY, infoWidth, infoHeight, 14);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(infoX + 40, infoY, infoWidth - 80, 3, 1.5);
        ctx.fill();

        let lineY = infoY + 16;
        textLines.forEach(item => {
            drawCenteredText(item.text, lineY, item.font, item.color);
            lineY += 36;
        });
    }

    // 8. Footer Notice positioned at dynamic bottom
    drawCenteredText('ប្រព័ន្ធគ្រប់គ្រងវត្តនាគវ័ន • ស្កែនដើម្បីផ្ទៀងផ្ទាត់ទិន្នន័យ', footerY, `12px ${fontFamily}`, '#64748b');

    // Download PNG directly
    const link = document.createElement('a');
    link.download = `ID_CARD_QR_${nameStr.replace(/\s+/g, '_')}.png`;
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