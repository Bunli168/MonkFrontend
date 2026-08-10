<template>
    <div class="public-profile-page min-vh-100 py-4 px-3 d-flex align-items-center justify-content-center">
        <div class="w-100 py-2" style="max-width: 620px;">

            <!-- Pagoda Branding Ribbon for Desktop PC -->
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-sm top-brand-badge">
                    <i class="fas fa-gopuram text-warning"></i>
                    <span class="fw-bold tracking-wide">វត្តនាគវ័ន • Wat NeakaVorn Pagoda</span>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-5 profile-card shadow-sm p-4 rounded-4">
                <div class="spinner-border text-warning" role="status"></div>
                <div class="text-muted small mt-3">កំពុងទាញយកទិន្នន័យផ្ទៀងផ្ទាត់...</div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-5 profile-card shadow-sm p-4 rounded-4">
                <div class="text-danger mb-3">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h5 class="fw-bold mb-2">រកមិនឃើញទិន្នន័យ</h5>
                <p class="text-muted small mb-0">{{ error }}</p>
            </div>

            <!-- Profile Content -->
            <div v-else-if="member" class="d-flex flex-column gap-3">

                <!-- Main Identity Card -->
                <div class="profile-card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-body p-4 text-center">
                        <div class="position-relative d-inline-block mb-3">
                            <img :src="avatarUrl" alt="Avatar" class="rounded-circle shadow-sm object-fit-cover" style="width: 130px; height: 130px; border: 4px solid #f59e0b;">
                        </div>
                        <h3 class="fw-bold mb-1 profile-title">{{ member.name }}</h3>
                        <div v-if="member.role" class="badge px-3 py-1.5 rounded-pill fw-bold small mb-2 role-badge">
                            {{ member.role }}
                        </div>
                        
                        <!-- High-Contrast Kudi Residence Badge -->
                        <div v-if="kudiDisplay" class="mt-3">
                            <div class="d-inline-block px-4 py-2.5 rounded-pill shadow-sm kudi-badge">
                                <span class="fw-bold fs-6">
                                    <i class="fas fa-home me-2" style="color: #d97706;"></i>ស្នាក់នៅ៖ {{ kudiDisplay }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Education Details / ព័ត៌មានការសិក្សា -->
                <div v-if="member.universityName || member.universityYear" class="profile-card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2 section-title-edu" style="font-size: 1rem;">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Education Details / ព័ត៌មានការសិក្សា</span>
                        </h6>
                        <div class="row g-3 small">
                            <div class="col-12" v-if="member.universityName">
                                <div class="field-label">School / University (គ្រឹះស្ថានសិក្សា/សាកលវិទ្យាល័យ):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ member.universityName }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.universityYear">
                                <div class="field-label">Academic Year (ឆ្នាំសិក្សា):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">Year {{ member.universityYear }} (ឆ្នាំទី {{ member.universityYear }})</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ordination Details / ព័ត៌មានបព្វជ្ជា-ឧបសម្បទា -->
                <div v-if="member.monkSurvey" class="profile-card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2 section-title-ord" style="font-size: 1rem;">
                            <i class="fas fa-book-open"></i>
                            <span>Ordination Details / ព័ត៌មានបព្វជ្ជា-ឧបសម្បទា</span>
                        </h6>
                        <div class="row g-3 small">
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.ordained_name">
                                <div class="field-label">Ordained Name (នាមបញ្ញត្តិ/ឆាយា):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ member.monkSurvey.ordained_name }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.preceptor_name">
                                <div class="field-label">Preceptor (ព្រះឧបជ្ឈាយ៍):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ member.monkSurvey.preceptor_name }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.ordained_date">
                                <div class="field-label">Ordained Date (ថ្ងៃបព្វជ្ជា/ឧបសម្បទា):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ formatDate(member.monkSurvey.ordained_date) }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.ordination_wat || member.fromWat">
                                <div class="field-label">Ordained Wat (វត្តដើម):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ member.monkSurvey.ordination_wat || member.fromWat }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- General Information -->
                <div class="profile-card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2 section-title-gen" style="font-size: 1rem;">
                            <i class="fas fa-id-card"></i>
                            <span>General Information / ព័ត៌មានទូទៅ</span>
                        </h6>
                        <div class="row g-3 small">
                            <div class="col-12 col-sm-6" v-if="member.phone">
                                <div class="field-label">Phone Number (លេខទូរស័ព្ទ):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ member.phone }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.chhayaNumber">
                                <div class="field-label">Chhaya ID (លេខឆាយា):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ member.chhayaNumber }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.dateOfBirth">
                                <div class="field-label">Date of Birth (ថ្ងៃខែឆ្នាំកំណើត):</div>
                                <div class="fw-bold fs-6 mt-1 info-value">{{ formatDate(member.dateOfBirth) }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.gender">
                                <div class="field-label">Gender (ភេទ):</div>
                                <div class="fw-bold text-capitalize fs-6 mt-1 info-value">{{ member.gender }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Copyright -->
                <div class="text-center py-3 text-muted small">
                    ប្រព័ន្ធគ្រប់គ្រងវត្តនាគវ័ន • Wat NeakaVorn Pagoda Verification System
                </div>

            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { formatDate } from '@/utils/dateFormat';
import { getAuthImageUrl } from '@/utils/imageUrl';
import api from '@/api/api';

const route = useRoute();
const member = ref(null);
const isLoading = ref(true);
const error = ref(null);

const fetchVerificationData = async () => {
    const userId = route.params.id;
    if (!userId) {
        error.value = 'User ID missing';
        isLoading.value = false;
        return;
    }

    try {
        isLoading.value = true;
        let res;
        try {
            res = await api.get(`/auth/verify-member/${userId}`);
        } catch (err) {
            res = await api.get(`/users/public-verify/${userId}`);
        }

        if (res.data?.success) {
            member.value = res.data.data;
        } else {
            error.value = res.data?.message || 'Member profile not found';
        }
    } catch (e) {
        console.error('Failed to fetch verification profile:', e);
        error.value = 'សមាជិកនេះពុំមានក្នុងប្រព័ន្ធ ឬត្រូវបានលុបចេញ';
    } finally {
        isLoading.value = false;
    }
};

const avatarUrl = computed(() => {
    if (!member.value) return '';
    if (member.value.avatarUrl) return getAuthImageUrl(member.value.avatarUrl);
    const initials = member.value.name ? member.value.name.split(/\s+/).map(n => n[0]).join('+') : 'U';
    return `https://ui-avatars.com/api/?name=${initials}&background=random`;
});

const kudiDisplay = computed(() => {
    if (!member.value) return '';
    if (member.value.monkSurvey?.kudi_number) {
        const clean = member.value.monkSurvey.kudi_number.replace(/kudi|កុដិ|លេខ\s*/gi, '').trim();
        return clean ? `កុដិលេខ ${clean}` : member.value.monkSurvey.kudi_number;
    }
    if (member.value.kut?.name) {
        const clean = member.value.kut.name.replace(/kudi|កុដិ|លេខ\s*/gi, '').trim();
        return clean ? `កុដិលេខ ${clean}` : member.value.kut.name;
    }
    return '';
});

onMounted(() => {
    fetchVerificationData();
});
</script>

<style scoped>
.public-profile-page {
    background-color: var(--body-bg-color, #f8fafc);
    color: var(--text-color, #1e293b);
}

.top-brand-badge {
    background-color: var(--surface-card, #ffffff);
    color: var(--text-color, #1e293b);
    border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
}

.profile-card {
    background-color: var(--surface-card, #ffffff);
    border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08)) !important;
}

.profile-title {
    color: var(--text-heading-color, #0f172a);
}

.role-badge {
    background-color: rgba(2, 132, 199, 0.12);
    color: #0284c7;
    font-size: 0.85rem;
}

.kudi-badge {
    background-color: #fffbeb;
    border: 2px solid #f59e0b;
    color: #78350f;
}

.section-title-edu {
    color: #0284c7;
}

.section-title-ord {
    color: #b45309;
}

.section-title-gen {
    color: #64748b;
}

.field-label {
    color: var(--text-muted-color, #64748b);
    font-weight: 500;
}

.info-value {
    color: var(--text-color, #0f172a);
}

/* Explicit Dark Theme Support */
:global(.dark-theme) .public-profile-page,
:global([data-theme="dark"]) .public-profile-page,
:global(body.dark) .public-profile-page {
    background-color: #0f172a !important;
    color: #f8fafc !important;
}

:global(.dark-theme) .top-brand-badge,
:global([data-theme="dark"]) .top-brand-badge,
:global(body.dark) .top-brand-badge {
    background-color: #1e293b !important;
    color: #f8fafc !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
}

:global(.dark-theme) .profile-card,
:global([data-theme="dark"]) .profile-card,
:global(body.dark) .profile-card {
    background-color: #1e293b !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
}

:global(.dark-theme) .profile-title,
:global([data-theme="dark"]) .profile-title,
:global(body.dark) .profile-title {
    color: #ffffff !important;
}

:global(.dark-theme) .field-label,
:global([data-theme="dark"]) .field-label,
:global(body.dark) .field-label {
    color: #94a3b8 !important;
}

:global(.dark-theme) .info-value,
:global([data-theme="dark"]) .info-value,
:global(body.dark) .info-value {
    color: #ffffff !important;
}

:global(.dark-theme) .section-title-edu,
:global([data-theme="dark"]) .section-title-edu,
:global(body.dark) .section-title-edu {
    color: #38bdf8 !important;
}

:global(.dark-theme) .section-title-ord,
:global([data-theme="dark"]) .section-title-ord,
:global(body.dark) .section-title-ord {
    color: #fbbf24 !important;
}

:global(.dark-theme) .section-title-gen,
:global([data-theme="dark"]) .section-title-gen,
:global(body.dark) .section-title-gen {
    color: #cbd5e1 !important;
}
</style>
