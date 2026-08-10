<template>
    <div class="min-vh-100 py-4 px-3" style="background-color: var(--body-bg-color, #f8fafc);">
        <div class="container" style="max-width: 680px;">

            <!-- Header Branding Card -->
            <div class="text-center p-4 rounded-4 shadow-sm mb-4 bg-white border border-light">
                <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-3 shadow-sm" style="width: 70px; height: 70px;">
                    <i class="fas fa-university fa-2x"></i>
                </div>
                <h4 class="fw-bold mb-1" style="color: #b45309;">វត្តនាគវ័ន</h4>
                <div class="text-primary fw-semibold small mb-2">ប័ណ្ណសម្គាល់ខ្លួនសមាជិក • ផ្ទៀងផ្ទាត់ផ្លូវការ</div>
                <div class="d-inline-flex align-items-center gap-2 bg-success bg-opacity-10 text-success px-3 py-1.5 rounded-pill small fw-bold">
                    <i class="fas fa-check-circle"></i>
                    <span>Officially Verified Member Record</span>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <div class="text-muted small mt-2">កំពុងទាញយកទិន្នន័យផ្ទៀងផ្ទាត់...</div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-5 card border-0 shadow-sm p-4 rounded-4 bg-white">
                <div class="text-danger mb-3">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h5 class="fw-bold text-dark mb-2">រកមិនឃើញទិន្នន័យ</h5>
                <p class="text-muted small mb-0">{{ error }}</p>
            </div>

            <!-- Profile Content -->
            <div v-else-if="member" class="d-flex flex-column gap-4">

                <!-- Read Only Notice Banner -->
                <div class="alert alert-info border-0 shadow-sm rounded-3 d-flex align-items-center gap-3 mb-0" style="background-color: #e0f2fe; color: #0369a1;">
                    <i class="fas fa-info-circle fa-lg flex-shrink-0"></i>
                    <div class="small fw-medium">
                        ព័ត៌មាននេះសម្រាប់តែការពិនិត្យផ្ទៀងផ្ទាត់ផ្លូវការប៉ុណ្ណោះ (View-Only Record)
                    </div>
                </div>

                <!-- Main Identity Card -->
                <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                    <div class="card-body p-4 text-center">
                        <img :src="avatarUrl" alt="Avatar" class="rounded-circle shadow-sm mb-3 object-fit-cover" style="width: 120px; height: 120px; border: 4px solid #f59e0b;">
                        <h4 class="fw-bold text-dark mb-1">{{ member.name }}</h4>
                        <div v-if="member.role" class="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill fw-bold small mb-2">
                            {{ member.role }}
                        </div>
                        
                        <!-- Kudi Residence Badge -->
                        <div v-if="kudiDisplay" class="mt-2">
                            <span class="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill fs-6 fw-bold">
                                <i class="fas fa-home me-1.5"></i> ស្នាក់នៅ៖ {{ kudiDisplay }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Education Details / ព័ត៌មានការសិក្សា -->
                <div v-if="member.universityName || member.universityYear" class="card border-0 shadow-sm rounded-4 bg-white">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color: #0284c7;">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Education Details / ព័ត៌មានការសិក្សា</span>
                        </h6>
                        <div class="row g-3 small">
                            <div class="col-12" v-if="member.universityName">
                                <div class="text-muted">School / University (គ្រឹះស្ថានសិក្សា/សាកលវិទ្យាល័យ):</div>
                                <div class="fw-bold text-dark fs-6">{{ member.universityName }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.universityYear">
                                <div class="text-muted">Academic Year (ឆ្នាំសិក្សា):</div>
                                <div class="fw-bold text-dark">Year {{ member.universityYear }} (ឆ្នាំទី {{ member.universityYear }})</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ordination Details / ព័ត៌មានបព្វជ្ជា/ឧបសម្បទា -->
                <div v-if="member.monkSurvey" class="card border-0 shadow-sm rounded-4 bg-white">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color: #b45309;">
                            <i class="fas fa-book-open"></i>
                            <span>Ordination Details / ព័ត៌មានបព្វជ្ជា-ឧបសម្បទា</span>
                        </h6>
                        <div class="row g-3 small">
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.ordained_name">
                                <div class="text-muted">Ordained Name (នាមបញ្ញត្តិ/ឆាយា):</div>
                                <div class="fw-bold text-dark fs-6">{{ member.monkSurvey.ordained_name }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.preceptor_name">
                                <div class="text-muted">Preceptor (ព្រះឧបជ្ឈាយ៍):</div>
                                <div class="fw-bold text-dark">{{ member.monkSurvey.preceptor_name }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.first_assistant_name">
                                <div class="text-muted">1st Assistant (គ្រូសូត្រស្តាំ):</div>
                                <div class="fw-bold text-dark">{{ member.monkSurvey.first_assistant_name }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.second_assistant_name">
                                <div class="text-muted">2nd Assistant (គ្រូសូត្រឆ្វេង):</div>
                                <div class="fw-bold text-dark">{{ member.monkSurvey.second_assistant_name }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.ordained_date">
                                <div class="text-muted">Ordained Date (ថ្ងៃបព្វជ្ជា/ឧបសម្បទា):</div>
                                <div class="fw-bold text-dark">{{ formatDate(member.monkSurvey.ordained_date) }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.monkSurvey.ordination_wat || member.fromWat">
                                <div class="text-muted">Ordained Wat (វត្តដើម):</div>
                                <div class="fw-bold text-dark">{{ member.monkSurvey.ordination_wat || member.fromWat }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Basic Profile Details -->
                <div class="card border-0 shadow-sm rounded-4 bg-white">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2 text-secondary">
                            <i class="fas fa-id-card"></i>
                            <span>General Information / ព័ត៌មានទូទៅ</span>
                        </h6>
                        <div class="row g-3 small">
                            <div class="col-12 col-sm-6" v-if="member.phone">
                                <div class="text-muted">Phone Number (លេខទូរស័ព្ទ):</div>
                                <div class="fw-bold text-dark">{{ member.phone }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.chhayaNumber">
                                <div class="text-muted">Chhaya ID (លេខឆាយា):</div>
                                <div class="fw-bold text-dark">{{ member.chhayaNumber }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.dateOfBirth">
                                <div class="text-muted">Date of Birth (ថ្ងៃខែឆ្នាំកំណើត):</div>
                                <div class="fw-bold text-dark">{{ formatDate(member.dateOfBirth) }}</div>
                            </div>
                            <div class="col-12 col-sm-6" v-if="member.gender">
                                <div class="text-muted">Gender (ភេទ):</div>
                                <div class="fw-bold text-dark text-capitalize">{{ member.gender }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Copyright -->
                <div class="text-center py-3 text-muted small">
                    ប្រព័ន្ធគ្រប់គ្រងវត្តនាគវ័ន • Wat Neak Voan Verification System
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
