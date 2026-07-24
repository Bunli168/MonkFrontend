<template>
    <div class="student-biography-view pb-3 h-100 d-flex flex-column align-items-center">
        <div class="w-100" style="max-width: 1000px;">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 mt-2 gap-3">
                <h5 class="fw-bold mb-0" style="color: var(--text-heading-color);">{{ title }}</h5>
                <BaseButton v-if="!isEditing" variant="outline-primary" @click="startEdit">
                    Edit Profile / កែសម្រួលព័ត៌មាន
                </BaseButton>
            </div>

            <!-- Summary View (Read Only) -->
            <div v-if="!isEditing" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                <div class="d-flex align-items-center gap-3 mb-4">
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

            <!-- ══════════════════════════════════════════════ -->
            <!-- EDIT VIEW — 3-step wizard                      -->
            <!-- ══════════════════════════════════════════════ -->
            <div v-else>
                <!-- Step Indicator -->
                <div class="d-flex align-items-center mb-4 overflow-auto pb-2 justify-content-center" style="gap: 0.5rem;">
                    <div v-for="(step, index) in steps" :key="index"
                         class="d-flex align-items-center"
                         :style="{ opacity: currentStep >= index + 1 ? '1' : '0.5' }">
                        <div class="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                             :class="currentStep >= index + 1 ? 'bg-primary' : 'bg-secondary'"
                             style="width: 28px; height: 28px; font-size: 0.85rem;">
                            {{ index + 1 }}
                        </div>
                        <span class="ms-2 fw-medium text-nowrap"
                              :class="currentStep === index + 1 ? 'text-primary' : 'text-muted'"
                              style="font-size: 0.9rem;">
                            {{ step.name }}
                        </span>
                        <div v-if="index < steps.length - 1" class="mx-3 bg-secondary" style="height: 2px; width: 30px; opacity: 0.3;"></div>
                    </div>
                </div>

                <form @submit.prevent="handleNextOrSave" class="d-flex flex-column">
                    <div class="flex-grow-1 w-100">

                        <!-- Step 1: Personal Identity -->
                        <div v-show="currentStep === 1" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <h6 class="fw-bold mb-0" style="color: var(--text-heading-color);">Personal Identity / អត្តសញ្ញាណបុគ្គល</h6>
                                <div>
                                    <BaseAvatarUpload v-model="avatarFile" :defaultImage="authStore.user?.profile?.avatarUrl" :isLoading="saving" />
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Surname-Name (គោត្តនាម-នាម) <span class="text-danger">*</span></label>
                                    <BaseInput v-model="form.surname_name" preventNumbers placeholder="E.g., CHHOUN SINA" :required="currentStep === 1" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Nationality (សញ្ជាតិ) <span class="text-danger">*</span></label>
                                    <BaseInput v-model="form.nationality" preventNumbers placeholder="E.g., KHMER" :required="currentStep === 1" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Date of Birth (ថ្ងៃ-ខែ-ឆ្នាំកំណើត) <span class="text-danger">*</span></label>
                                    <BaseDatePicker v-model="form.date_of_birth" placeholder="Select date" :required="currentStep === 1" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Phone Number (លេខទូរស័ព្ទ)</label>
                                    <BaseInput v-model="form.phone_number" preventText placeholder="Enter phone number" />
                                </div>

                            </div>
                        </div>

                        <!-- Step 2: Place of Birth -->
                        <div v-show="currentStep === 2" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                            <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Place of Birth / ទីកន្លែងកំណើត</h6>
                            
                            <div class="row g-3">
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Province (រាជធានី/ខេត្ត) <span class="text-danger">*</span></label>
                                    <BaseSelect v-model="form.pob_province_id" :options="pobLoc.provinceOptions" placeholder="Select province" :required="currentStep === 2" @update:modelValue="onPobProvinceChange" :loading="pobLoc.isLoadingProvinces" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">District (ក្រុង/ស្រុក/ខណ្ឌ)</label>
                                    <BaseSelect v-model="form.pob_district_id" :options="pobLoc.districtOptions" placeholder="Select district" :disabled="!form.pob_province_id" @update:modelValue="onPobDistrictChange" :loading="pobLoc.isLoadingDistricts" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Commune (ឃុំ/សង្កាត់)</label>
                                    <BaseSelect v-model="form.pob_commune_id" :options="pobLoc.communeOptions" placeholder="Select commune" :disabled="!form.pob_district_id" @update:modelValue="onPobCommuneChange" :loading="pobLoc.isLoadingCommunes" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Village (ភូមិ)</label>
                                    <BaseSelect v-model="form.pob_village_id" :options="pobLoc.villageOptions" placeholder="Select village" :disabled="!form.pob_commune_id" :loading="pobLoc.isLoadingVillages" />
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Education -->
                        <div v-show="currentStep === 3" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                            <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Education / ការសិក្សា</h6>
                            <div class="row g-3">
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Education Level (កំរិតបញ្ចប់)</label>
                                    <BaseSelect v-model="form.edu_level" :options="eduLevelOptions" placeholder="ជ្រើសរើសកម្រិតសិក្សា..." />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">School / University (ត្រីស្ថានសិក្សា)</label>
                                    <BaseInput v-model="form.edu_school" preventNumbers placeholder="Enter school name" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Specialty / Major (ជំនាញ)</label>
                                    <BaseInput v-model="form.edu_specialty" preventNumbers placeholder="Enter specialty" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Grade / Class (ថ្នាក់/ឆ្នាំទី)</label>
                                    <BaseInput v-model="form.edu_grade" placeholder="E.g., Grade 12..." />
                                </div>

                                <div class="col-12 mt-4 mb-2">
                                    <h6 class="fw-semibold" style="font-size: 0.9rem;">Current Job / ការងារបច្ចុប្បន្ន</h6>
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Current Job (ការងារបច្ចុប្បន្ន)</label>
                                    <BaseInput v-model="form.current_job" preventNumbers placeholder="Enter current job" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Kudi Number (លេខកុដិស្នាក់នៅ)</label>
                                    <BaseInput v-model="form.kudi_number" placeholder="Enter kudi number" />
                                </div>
                            </div>
                        </div>

                        <!-- Step 4: Parents & Family -->
                        <div v-show="currentStep === 4" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                            <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Parents & Family / ព័ត៌មានឪពុកម្ដាយ</h6>
                            <div class="row g-3">
                                <div class="col-12 mb-1">
                                    <h6 class="fw-semibold" style="font-size: 0.9rem;">Father's Information / ព័ត៌មានឪពុក</h6>
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Father's Name (ឈ្មោះឪពុក)</label>
                                    <BaseInput v-model="form.father_name" preventNumbers placeholder="Enter father's name" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Occupation (មុខរប)</label>
                                    <BaseInput v-model="form.father_occupation" preventNumbers placeholder="Enter occupation" />
                                </div>

                                <div class="col-12 mt-4 mb-1">
                                    <h6 class="fw-semibold" style="font-size: 0.9rem;">Mother's Information / ព័ត៌មានម្ដាយ</h6>
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Mother's Name (ឈ្មោះម្ដាយ)</label>
                                    <BaseInput v-model="form.mother_name" preventNumbers placeholder="Enter mother's name" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Occupation (មុខរប)</label>
                                    <BaseInput v-model="form.mother_occupation" preventNumbers placeholder="Enter occupation" />
                                </div>

                                <div class="col-12 mt-4 mb-1">
                                    <h6 class="fw-semibold" style="font-size: 0.9rem;">Parents' Address / អាសយដ្ឋានឪពុកម្ដាយ</h6>
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Province (ខេត្ត/រាជធានី)</label>
                                    <BaseSelect v-model="form.parents_province_id" :options="parentsLoc.provinceOptions" placeholder="Select province" @update:modelValue="onParentsProvinceChange" :loading="parentsLoc.isLoadingProvinces" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">District (ស្រុក/ខណ្ឌ)</label>
                                    <BaseSelect v-model="form.parents_district_id" :options="parentsLoc.districtOptions" placeholder="Select district" :disabled="!form.parents_province_id" @update:modelValue="onParentsDistrictChange" :loading="parentsLoc.isLoadingDistricts" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Commune (ឃុំ/សង្កាត់)</label>
                                    <BaseSelect v-model="form.parents_commune_id" :options="parentsLoc.communeOptions" placeholder="Select commune" :disabled="!form.parents_district_id" @update:modelValue="onParentsCommuneChange" :loading="parentsLoc.isLoadingCommunes" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <label class="form-label">Village (ភូមិ)</label>
                                    <BaseSelect v-model="form.parents_village_id" :options="parentsLoc.villageOptions" placeholder="Select village" :disabled="!form.parents_commune_id" :loading="parentsLoc.isLoadingVillages" />
                                </div>
                            </div>
                        </div>

                    </div><!-- end flex-grow-1 -->

                    <!-- Navigation Buttons -->
                    <div class="d-flex justify-content-between mt-4 w-100">
                        <BaseButton type="button" variant="outline-secondary" @click="cancelEdit" class="px-4">
                            Cancel
                        </BaseButton>
                        <div class="d-flex gap-2">
                            <BaseButton type="button" variant="outline-secondary" @click="currentStep--" :disabled="currentStep === 1" class="px-4">
                                Previous
                            </BaseButton>
                            <BaseButton v-if="currentStep < 4" type="submit" variant="primary" class="px-5">
                                Next
                            </BaseButton>
                            <BaseButton v-else type="submit" variant="primary" :isLoading="saving" class="px-5">
                                Save Survey
                            </BaseButton>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Student Profile Summary / ព័ត៌មានសិស្ស (ប្រវត្តិរូបសង្ខេប)'
    }
});

import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import { formatDate } from '@/utils/dateFormat';
import api from '@/api/api';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAvatarUpload from '@/components/base/BaseAvatarUpload.vue';
import { useLocation } from '@/composables/useLocation';

const authStore  = useAuthStore();
const userStore  = useUserStore();
const toastStore = useToastStore();

const saving      = ref(false);
const isEditing   = ref(false);
const hasSurvey   = ref(false);
const currentStep = ref(1);
const avatarFile  = ref(null);

const steps = [
    { name: 'Personal Identity' },
    { name: 'Place of Birth' },
    { name: 'Education' },
    { name: 'Parents & Family' },
];

const pobLoc = useLocation();
const parentsLoc = useLocation();

const defaultForm = () => ({
    surname_name: '', nationality: 'ខ្មែរ', date_of_birth: null,
    pob_village: '', pob_commune: '', pob_district: '', pob_province: '',
    pob_village_id: null, pob_commune_id: null, pob_district_id: null, pob_province_id: null,
    occupation: '', current_address: '',
    phone_number: '', id_card_number: '', other_number: '',
    edu_level: '', edu_school: '', edu_specialty: '', edu_grade: '',
    current_job: '', kudi_number: '',
    father_name: '', father_occupation: '',
    mother_name: '', mother_occupation: '',
    parents_village: '', parents_commune: '', parents_district: '', parents_province: '',
    parents_village_id: null, parents_commune_id: null, parents_district_id: null, parents_province_id: null,
});

const form = ref(defaultForm());

const eduLevelOptions = [
    { value: 'បឋមសិក្សា (Primary School)', label: 'បឋមសិក្សា (Primary School)' },
    { value: 'អនុវិទ្យាល័យ (Secondary School)', label: 'អនុវិទ្យាល័យ (Secondary School)' },
    { value: 'វិទ្យាល័យ (High School)', label: 'វិទ្យាល័យ (High School)' },
    { value: 'បរិញ្ញាបត្រ (Bachelor Degree)', label: 'បរិញ្ញាបត្រ (Bachelor Degree)' },
    { value: 'បរិញ្ញាបត្រជាន់ខ្ពស់ (Master Degree)', label: 'បរិញ្ញាបត្រជាន់ខ្ពស់ (Master Degree)' },
    { value: 'បណ្ឌិត (Ph.D)', label: 'បណ្ឌិត (Ph.D)' },
    { value: 'ពុទ្ធិកបឋមសិក្សា (ថ្នាក់ទី១ ដល់ទី៣)', label: 'ពុទ្ធិកបឋមសិក្សា (ថ្នាក់ទី១ ដល់ទី៣)' },
    { value: 'ពុទ្ធិកមធ្យមសិក្សាបឋមភូមិ (ថ្នាក់ទី៧ ដល់ទី៩)', label: 'ពុទ្ធិកមធ្យមសិក្សាបឋមភូមិ (ថ្នាក់ទី៧ ដល់ទី៩)' },
    { value: 'ពុទ្ធិកមធ្យមសិក្សាទុតិយភូមិ (ថ្នាក់ទី១០ ដល់ទី១២)', label: 'ពុទ្ធិកមធ្យមសិក្សាទុតិយភូមិ (ថ្នាក់ទី១០ ដល់ទី១២)' },
    { value: 'ពុទ្ធិកឧត្តមសិក្សា (សាកលវិទ្យាល័យ)', label: 'ពុទ្ធិកឧត្តមសិក្សា (សាកលវិទ្យាល័យ)' },
    { value: 'ផ្សេងៗ (Other)', label: 'ផ្សេងៗ (Other)' }
];

const getOptionLabel = (options, value) => {
    if (!options || !value) return '';
    const item = options.find(o => o.value == value);
    return item ? item.label : '';
};

const fetchSurvey = async () => {
    try {
        let res;
        try {
            res = await api.get('/student-surveys/me');
        } catch (apiError) {
            if (apiError.response?.status !== 404) throw apiError;
        }
        
        if (res?.data?.success && res.data.data) {
            const data = res.data.data;
            hasSurvey.value = true;
            isEditing.value = false;
            Object.keys(form.value).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    form.value[key] = data[key];
                }
            });
            
            // Load cascading data for Place of Birth
            if (form.value.pob_province_id) await pobLoc.fetchDistricts(form.value.pob_province_id);
            if (form.value.pob_district_id) await pobLoc.fetchCommunes(form.value.pob_district_id);
            if (form.value.pob_commune_id) await pobLoc.fetchVillages(form.value.pob_commune_id);

            // Load cascading data for Parents Address
            if (form.value.parents_province_id) await parentsLoc.fetchDistricts(form.value.parents_province_id);
            if (form.value.parents_district_id) await parentsLoc.fetchCommunes(form.value.parents_district_id);
            if (form.value.parents_commune_id) await parentsLoc.fetchVillages(form.value.parents_commune_id);
        } else {
            hasSurvey.value = false;
            isEditing.value = false;
        }

        // For own profile, fetch fresh from /users/me to guarantee profile data is loaded
        try {
            await authStore.fetchProfile();
        } catch (e) {
            console.error("Failed to fetch profile in biography view:", e);
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
                if (!form.value.date_of_birth && p.dateOfBirth) form.value.date_of_birth = p.dateOfBirth;
                if (!form.value.phone_number && (p.phone_number || p.phone)) form.value.phone_number = p.phone_number || p.phone;
                if (!form.value.id_card_number && p.chhaya_number) form.value.id_card_number = p.chhaya_number;
                
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
                        
                        if (!form.value.pob_province_id && birthAddress.province_id) {
                            form.value.pob_province_id = birthAddress.province_id;
                            await pobLoc.fetchDistricts(birthAddress.province_id);
                        }
                        if (!form.value.pob_district_id && birthAddress.district_id) {
                            form.value.pob_district_id = birthAddress.district_id;
                            await pobLoc.fetchCommunes(birthAddress.district_id);
                        }
                        if (!form.value.pob_commune_id && birthAddress.commune_id) {
                            form.value.pob_commune_id = birthAddress.commune_id;
                            await pobLoc.fetchVillages(birthAddress.commune_id);
                        }
                        if (!form.value.pob_village_id && birthAddress.village_id) form.value.pob_village_id = birthAddress.village_id;
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
        isEditing.value = false;
    }
};

const startEdit = () => {
    currentStep.value = 1;
    isEditing.value   = true;
};

const onPobProvinceChange = async (val) => {
    form.value.pob_district_id = null;
    form.value.pob_commune_id = null;
    form.value.pob_village_id = null;
    if (val) await pobLoc.fetchDistricts(val);
};

const onPobDistrictChange = async (val) => {
    form.value.pob_commune_id = null;
    form.value.pob_village_id = null;
    if (val) await pobLoc.fetchCommunes(val);
};

const onPobCommuneChange = async (val) => {
    form.value.pob_village_id = null;
    if (val) await pobLoc.fetchVillages(val);
};

const onParentsProvinceChange = async (val) => {
    form.value.parents_district_id = null;
    form.value.parents_commune_id = null;
    form.value.parents_village_id = null;
    if (val) await parentsLoc.fetchDistricts(val);
};

const onParentsDistrictChange = async (val) => {
    form.value.parents_commune_id = null;
    form.value.parents_village_id = null;
    if (val) await parentsLoc.fetchCommunes(val);
};

const onParentsCommuneChange = async (val) => {
    form.value.parents_village_id = null;
    if (val) await parentsLoc.fetchVillages(val);
};

const cancelEdit = () => {
    isEditing.value = false;
    currentStep.value = 1;
};

const handleNextOrSave = () => {
    if (currentStep.value < 4) {
        currentStep.value++;
    } else {
        saveSurvey();
    }
};

const saveSurvey = async () => {
    saving.value = true;
    try {
        const payload = { ...form.value };
        if (payload.date_of_birth instanceof Date) {
            payload.date_of_birth = payload.date_of_birth.toISOString().split('T')[0];
        }

        const res = await api.put('/student-surveys/me', payload);

        // Handle avatar upload if a new file was selected
        if (avatarFile.value) {
            const fd = new FormData();
            fd.append('avatar', avatarFile.value);
            await userStore.uploadProfileAvatar(fd);
            await authStore.fetchCurrentUser();
        }

        if (res.data?.success) {
            toastStore.showToast('Survey saved successfully', 'success');
            hasSurvey.value = true;
            isEditing.value = false;
            currentStep.value = 1;
        }
    } catch (error) {
        toastStore.showToast('Failed to save survey', 'error');
        console.error(error);
    } finally {
        saving.value = false;
    }
};

onMounted(async () => {
    await pobLoc.fetchProvinces();
    await parentsLoc.fetchProvinces();
    await fetchSurvey();
});
</script>

<style scoped>
/* Scoped styles — same as PagodaBiographySurveyView */
</style>
