<template>
    <div class="student-profile-summary-view pb-3 h-100 d-flex flex-column align-items-center">
        <div class="w-100" style="max-width: 1000px;">
            <div class="d-flex align-items-center justify-content-between mb-4 mt-2">
                <h5 class="fw-bold mb-0" style="color: var(--text-heading-color);">Student Profile Summary <span class="d-none d-md-inline">/ ព័ត៌មានសិស្ស (ប្រវត្តិរូបសង្ខេប)</span></h5>
            </div>

            <!-- Summary View (Read Only) -->
            <div v-if="!loading" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center align-items-sm-start mb-4 gap-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="user-profile-avatar d-flex align-items-center justify-content-center text-muted rounded-circle overflow-hidden border"
                            style="width: 80px; height: 80px; background-color: rgba(0,0,0,0.03);">
                            <img v-if="authStore.user?.profile?.avatarUrl" :src="$authImg(authStore.user.profile.avatarUrl)" class="w-100 h-100 object-fit-cover">
                            <span v-else class="fs-2 fw-bold text-muted">{{ form.surname_name ? form.surname_name.charAt(0) : 'S' }}</span>
                        </div>
                        <div>
                            <h4 class="fw-bold mb-1" style="color: var(--text-heading-color);">{{ form.surname_name || '—' }}</h4>
                            <p class="text-muted mb-0">Nationality: <span class="fw-semibold text-primary">{{ form.nationality || 'N/A' }}</span></p>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <!-- Personal Identity -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Personal Identity / អត្តសញ្ញាណបុគ្គល</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Nationality:</strong> {{ form.nationality || 'N/A' }}</li>
                                <li><strong class="text-secondary">Date of Birth:</strong> {{ formatDate(form.date_of_birth) }}</li>
                                <li><strong class="text-secondary">Phone Number:</strong> {{ form.phone_number || 'N/A' }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Place of Birth -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Place of Birth / ទីកន្លែងកំណើត</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Province:</strong> {{ getOptionLabel(pobLoc.provinceOptions, form.pob_province_id) || form.pob_province || 'N/A' }}</li>
                                <li><strong class="text-secondary">District:</strong> {{ getOptionLabel(pobLoc.districtOptions, form.pob_district_id) || form.pob_district || 'N/A' }}</li>
                                <li><strong class="text-secondary">Commune:</strong> {{ getOptionLabel(pobLoc.communeOptions, form.pob_commune_id) || form.pob_commune || 'N/A' }}</li>
                                <li><strong class="text-secondary">Village:</strong> {{ getOptionLabel(pobLoc.villageOptions, form.pob_village_id) || form.pob_village || 'N/A' }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Education -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Education / ការសិក្សា</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Education Level:</strong> {{ form.edu_level || 'N/A' }}</li>
                                <li><strong class="text-secondary">University / School:</strong> {{ form.edu_school || 'N/A' }}</li>
                                <li><strong class="text-secondary">Specialty:</strong> {{ form.edu_specialty || 'N/A' }}</li>
                                <li><strong class="text-secondary">Grade / Class:</strong> {{ form.edu_grade || 'N/A' }}</li>
                                <li><strong class="text-secondary">Current Job:</strong> {{ form.current_job || 'N/A' }}</li>
                                <li><strong class="text-secondary">Kudi Number:</strong> {{ form.kudi_number || 'N/A' }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Parents Info -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Parents / ព័ត៌មានឪពុកម្ដាយ</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Father:</strong> {{ form.father_name || 'N/A' }}</li>
                                <li><strong class="text-secondary">Father's Occupation:</strong> {{ form.father_occupation || 'N/A' }}</li>
                                <li><strong class="text-secondary">Mother:</strong> {{ form.mother_name || 'N/A' }}</li>
                                <li><strong class="text-secondary">Mother's Occupation:</strong> {{ form.mother_occupation || 'N/A' }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Parents Address -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Parents' Address / អាសយដ្ឋានឪពុកម្ដាយ</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Province:</strong> {{ getOptionLabel(parentsLoc.provinceOptions, form.parents_province_id) || form.parents_province || 'N/A' }}</li>
                                <li><strong class="text-secondary">District:</strong> {{ getOptionLabel(parentsLoc.districtOptions, form.parents_district_id) || form.parents_district || 'N/A' }}</li>
                                <li><strong class="text-secondary">Commune:</strong> {{ getOptionLabel(parentsLoc.communeOptions, form.parents_commune_id) || form.parents_commune || 'N/A' }}</li>
                                <li><strong class="text-secondary">Village:</strong> {{ getOptionLabel(parentsLoc.villageOptions, form.parents_village_id) || form.parents_village || 'N/A' }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-else class="card p-4 mx-auto w-100 text-center" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading profile...</p>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/dateFormat';
import api from '@/api/api';
import { useLocation } from '@/composables/useLocation';

const authStore = useAuthStore();
const loading = ref(true);

const pobLoc = useLocation();
const parentsLoc = useLocation();

const getOptionLabel = (options, value) => {
    if (!options || !value) return '';
    const item = options.find(o => o.value == value);
    return item ? item.label : '';
};

const form = ref({
    surname_name: '', nationality: '', date_of_birth: null,
    pob_village: '', pob_commune: '', pob_district: '', pob_province: '',
    pob_village_id: null, pob_commune_id: null, pob_district_id: null, pob_province_id: null,
    phone_number: '',
    edu_level: '', edu_school: '', edu_specialty: '', edu_grade: '',
    current_job: '', kudi_number: '',
    father_name: '', father_occupation: '',
    mother_name: '', mother_occupation: '',
    parents_village: '', parents_commune: '', parents_district: '', parents_province: '',
    parents_village_id: null, parents_commune_id: null, parents_district_id: null, parents_province_id: null,
});

const fetchSurvey = async () => {
    loading.value = true;
    try {
        const res = await api.get('/student-surveys/me');
        if (res.data?.success && res.data.data) {
            const data = res.data.data;
            Object.keys(form.value).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    form.value[key] = data[key];
                }
            });
            
            // Fetch names for IDs
            if (form.value.pob_province_id) await pobLoc.fetchDistricts(form.value.pob_province_id);
            if (form.value.pob_district_id) await pobLoc.fetchCommunes(form.value.pob_district_id);
            if (form.value.pob_commune_id) await pobLoc.fetchVillages(form.value.pob_commune_id);

            if (form.value.parents_province_id) await parentsLoc.fetchDistricts(form.value.parents_province_id);
            if (form.value.parents_district_id) await parentsLoc.fetchCommunes(form.value.parents_district_id);
            if (form.value.parents_commune_id) await parentsLoc.fetchVillages(form.value.parents_commune_id);
        }

        // Auto-fill from user profile if fields are empty
        const user = authStore.user;
        if (user) {
            const p = user.profile || user.UserProfile;
            if (p) {
                // Personal Identity
                if (!form.value.surname_name) {
                    form.value.surname_name = `${p.last_name_kh || ''} ${p.first_name_kh || ''}`.trim();
                }
                if (!form.value.date_of_birth && p.date_of_birth) form.value.date_of_birth = p.date_of_birth;
                if (!form.value.phone_number && (p.phone_number || p.phone)) form.value.phone_number = p.phone_number || p.phone;
                
                // Education
                if (!form.value.edu_school && p.university_name) form.value.edu_school = p.university_name;
                if (!form.value.edu_grade && p.university_year) form.value.edu_grade = `Year ${p.university_year}`;
                
                // Place of Birth from Addresses
                if (user.Addresses && user.Addresses.length > 0) {
                    const birthAddress = user.Addresses.find(a => a.address_type === 'birth_place');
                    if (birthAddress) {
                        if (!form.value.pob_province && birthAddress.province) form.value.pob_province = birthAddress.province;
                        if (!form.value.pob_district && birthAddress.district) form.value.pob_district = birthAddress.district;
                        if (!form.value.pob_commune && birthAddress.commune) form.value.pob_commune = birthAddress.commune;
                        if (!form.value.pob_village && birthAddress.village) form.value.pob_village = birthAddress.village;
                    }
                }
            }
            if (!form.value.nationality) form.value.nationality = 'KHMER';
            
            // Kudi Number (auto-fetched from profile - always populate regardless of survey data)
            const kudiNumber = (p && p.kut_id) || (p && (p.chhaya_number || p.kudi_number || p.student_id || p.id_number)) || user.id || user.userId;
            form.value.kudi_number = kudiNumber ? String(kudiNumber) : '';
        }
    } catch (error) {
        console.error('Failed to load student survey:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await pobLoc.fetchProvinces();
    await parentsLoc.fetchProvinces();
    await fetchSurvey();
});
</script>

<style scoped>
/* Scoped styles */
</style>
