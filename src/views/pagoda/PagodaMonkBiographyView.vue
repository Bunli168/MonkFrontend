<template>
    <div :class="['monk-biography-view h-100 d-flex flex-column align-items-center', hideHeader ? '' : 'pb-3']">
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center w-100 py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        
        <div v-if="!isLoading" class="w-100" style="max-width: 1000px;">
            <div v-if="!hideHeader" class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 mt-2 gap-3">
                <h5 class="fw-bold mb-0" style="color: var(--text-heading-color);">{{ title || `${getRoleTextEn()} Profile Summary ` }}<span class="d-none d-md-inline">{{ title ? '' : `/ ប្រវត្តិរូបសង្ខេប (${getRoleTextKh()})` }}</span></h5>
            </div>

            <!-- Summary View (Read Only) - Modern Dashboard Style -->
            <div v-if="!isEditing" class="card mx-auto w-100 p-3 p-md-4 biography-container" style="background-color: var(--body-bg-color); border-radius: 12px; max-width: 1000px; border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                
                <!-- Header with Avatar and Name -->
                <div class="d-flex flex-wrap align-items-center mb-4 gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center text-secondary" style="width: 75px; height: 75px; background-color: var(--bg-secondary); font-size: 2rem; flex-shrink: 0;">
                        <img v-if="viewedUserAvatar || (!props.userId && authStore.user?.profile?.avatarUrl)" 
                             :src="$authImg(viewedUserAvatar || authStore.user?.profile?.avatarUrl)" 
                             class="w-100 h-100 rounded-circle object-fit-cover">
                        <img v-else src="/app-logo.png" class="w-100 h-100 rounded-circle object-fit-cover bg-white" />
                    </div>
                    <div class="flex-grow-1">
                        <h4 class="mb-1 fw-bold" style="color: var(--text-heading-color);">{{ form.surname_name || 'N/A' }}</h4>
                        <div class="text-secondary" style="font-size: 0.95rem;">Ordained Name: <span class="text-primary">{{ form.ordained_name || '-' }}</span></div>
                    </div>
                    <div class="d-flex gap-2 w-100 w-sm-auto mt-2 mt-sm-0">
                        <BaseButton variant="outline-primary" @click="showPersonalQrModal = true" class="w-100 w-sm-auto d-flex align-items-center gap-1">
                            <QrCode :size="16" />
                            <span>My QR Code / កូដ QR</span>
                        </BaseButton>
                        <BaseButton variant="outline-secondary" @click="startEdit" style="background-color: transparent; color: var(--text-heading-color); border-color: var(--border-color);" class="w-100 w-sm-auto">
                            Edit / កែសម្រួល
                        </BaseButton>
                    </div>
                </div>

                <!-- 2x2 Grid of Cards -->
                <div class="row g-3 g-md-4">
                    <!-- Personal Identity -->
                    <div class="col-12 col-md-6">
                        <div class="card h-100 border-0 biography-card" style="border-radius: 8px; background-color: var(--surface-ground);">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Personal Identity / អត្តសញ្ញាណបុគ្គល</h6>
                                <div class="mb-2 text-secondary">Nationality: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.nationality || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Date of Birth: <span class="fw-medium" style="color: var(--text-heading-color);">{{ formatDate(form.date_of_birth) || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Phone Number: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.phone_number || 'N/A' }}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Place of Birth -->
                    <div class="col-12 col-md-6">
                        <div class="card h-100 border-0 biography-card" style="border-radius: 8px; background-color: var(--surface-ground);">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Place of Birth / ទីកន្លែងកំណើត</h6>
                                <div class="mb-2 text-secondary">Province: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(pobLoc.provinces, form.pob_province_id, 'province') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">District: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(pobLoc.districts, form.pob_district_id, 'district') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Commune: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(pobLoc.communes, form.pob_commune_id, 'commune') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Village: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(pobLoc.villages, form.pob_village_id, 'village') || 'N/A' }}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Ordination Details -->
                    <div class="col-12 col-md-6">
                        <div class="card h-100 border-0 biography-card" style="border-radius: 8px; background-color: var(--surface-ground);">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Ordination Details / ព័ត៌មាន{{ isSamanera ? 'បព្វជ្ជា' : 'ឧបសម្បទា' }}</h6>
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="mb-2 text-secondary">Preceptor Name: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.preceptor_name || 'N/A' }}</span></div>
                                        <div v-if="!isSamanera" class="mb-2 text-secondary">First Assistant: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.first_assistant_name || 'N/A' }}</span></div>
                                        <div v-if="!isSamanera" class="mb-2 text-secondary">Second Assistant: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.second_assistant_name || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">Ordained Date: <span class="fw-medium" style="color: var(--text-heading-color);">{{ formatDate(form.ordained_date) || 'N/A' }}</span></div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="mb-2 text-secondary">Wat / Pagoda: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.ordination_wat || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">Province: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(ordLoc.provinces, form.ordination_province_id, 'province') || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">District: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(ordLoc.districts, form.ordination_district_id, 'district') || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">Commune: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(ordLoc.communes, form.ordination_commune_id, 'commune') || 'N/A' }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Current Address -->
                    <div class="col-12 col-md-6">
                        <div class="card h-100 border-0 biography-card" style="border-radius: 8px; background-color: var(--surface-ground);">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Current Address / អាសយដ្ឋានបច្ចុប្បន្ន</h6>
                                <div class="mb-2 text-secondary">Wat / Pagoda: <span class="fw-medium" style="color: var(--text-heading-color);">{{ form.current_wat || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Province: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(currLoc.provinces, form.current_province_id, 'province') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">District: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(currLoc.districts, form.current_district_id, 'district') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Commune: <span class="fw-medium" style="color: var(--text-heading-color);">{{ getLocationName(currLoc.communes, form.current_commune_id, 'commune') || 'N/A' }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div v-else :class="['mx-auto w-100', hideHeader ? '' : 'card p-3 p-md-4']" :style="hideHeader ? { paddingBottom: '1rem' } : { backgroundColor: 'var(--body-bg-color)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color, rgba(0,0,0,0.06))', maxWidth: '1000px' }">
                <h5 v-if="!hideHeader" class="fw-bold mb-4 text-primary">Biography Survey / ប្រវត្តិរូបសង្ខេប ({{ getRoleTextKh() }})</h5>
                
                <form @submit.prevent="currentStep === 5 ? saveSurvey() : currentStep++">
                    
                    <!-- Step Indicator -->
                    <div class="d-flex align-items-center mb-4 overflow-auto pb-2 justify-content-center" style="gap: 0.5rem;">
                        <div v-for="(step, index) in ['Personal Identity', 'Place of Birth', 'Ordination', 'Place of Ordination', 'Current Address']" :key="index" 
                             class="d-flex align-items-center"
                             :style="{ opacity: currentStep >= index + 1 ? '1' : '0.5' }">
                            <div class="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0"
                                 :class="currentStep >= index + 1 ? 'bg-primary' : 'bg-secondary'"
                                 style="width: 28px; height: 28px; font-size: 0.85rem;">
                                {{ index + 1 }}
                            </div>
                            <span class="ms-2 fw-medium text-nowrap"
                                  :class="currentStep === index + 1 ? 'text-primary' : 'text-muted'"
                                  style="font-size: 0.9rem;">
                                {{ step }}
                            </span>
                            <div v-if="index < 4" class="mx-2 bg-secondary flex-shrink-0" style="height: 2px; width: 20px; opacity: 0.3;"></div>
                        </div>
                    </div>

                    <fieldset :disabled="isReadOnly" class="border-0 p-0 m-0">

                    <!-- Step 1: Personal Identity -->
                    <div v-show="currentStep === 1" class="step-content">
                        <div class="d-flex justify-content-between align-items-start mb-4">
                            <h6 class="fw-bold mb-0" style="color: var(--text-heading-color);">Personal Identity / អត្តសញ្ញាណបុគ្គល</h6>
                            <BaseAvatarUpload v-model="avatarFile" :defaultImage="authStore.user?.profile?.avatarUrl" :isLoading="saving" />
                        </div>
                        <div class="row g-4">
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Surname-Name (គោត្តនាម-នាម) - ខ្មែរ <span class="text-danger">*</span></label>
                                <BaseInput v-model="form.surname_name" placeholder="E.g., ភី ប៊ុនលិ" :required="currentStep === 1" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Surname-Name (គោត្តនាម-នាម) - Latin <span class="text-danger">*</span></label>
                                <BaseInput v-model="form.latin_name" placeholder="E.g., PHI BUNLI" :required="currentStep === 1" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Nationality (សញ្ជាតិ) <span class="text-danger">*</span></label>
                                <BaseInput v-model="form.nationality" :error="errors.nationality" placeholder="E.g., KHMER" :required="currentStep === 1" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Date of Birth (ថ្ងៃ-ខែ-ឆ្នាំកំណើត) <span class="text-danger">*</span></label>
                                <BaseDatePicker v-model="form.date_of_birth" placeholder="Select date" :required="currentStep === 1" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Phone Number (លេខទូរស័ព្ទ)</label>
                                <BaseInput v-model="form.phone_number" type="tel" maxlength="15" :error="errors.phone_number" placeholder="E.g., 012345678" />
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Place of Birth -->
                    <div v-show="currentStep === 2" class="step-content">
                        <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Place of Birth / ទីកន្លែងកំណើត</h6>
                        <div class="row g-4">
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Province (រាជធានី/ខេត្ត)</label>
                                <BaseSelect v-model="form.pob_province_id" :options="pobLoc.provinceOptions" placeholder="Select province" @update:modelValue="onPobProvinceChange" :loading="pobLoc.isLoadingProvinces" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">District (ក្រុង/ស្រុក/ខណ្ឌ)</label>
                                <BaseSelect v-model="form.pob_district_id" :options="pobLoc.districtOptions" placeholder="Select district" :disabled="!form.pob_province_id" @update:modelValue="onPobDistrictChange" :loading="pobLoc.isLoadingDistricts" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Commune (ឃុំ/សង្កាត់)</label>
                                <BaseSelect v-model="form.pob_commune_id" :options="pobLoc.communeOptions" placeholder="Select commune" :disabled="!form.pob_district_id" @update:modelValue="onPobCommuneChange" :loading="pobLoc.isLoadingCommunes" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Village (ភូមិ)</label>
                                <BaseSelect v-model="form.pob_village_id" :options="pobLoc.villageOptions" placeholder="Select village" :disabled="!form.pob_commune_id" :loading="pobLoc.isLoadingVillages" />
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Ordination Details -->
                    <div v-show="currentStep === 3" class="step-content">
                        <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Ordination Details / ព័ត៌មាន{{ isSamanera ? 'បព្វជ្ជា' : 'ឧបសម្បទា' }}</h6>
                        
                        <div class="row g-4 mb-4">
                            <div class="col-12">
                                <BaseInput v-model="form.preceptor_name" label="នាមព្រះឧបជ្ឈាយ៍ (Preceptor Name)" placeholder="បញ្ញត្តិ នឹង នាម..." :required="currentStep === 3" />
                            </div>
                        </div>

                        <div class="row g-4">
                            <div class="col-12 col-md-6">
                                <BaseInput v-model="form.ordained_name" label="នាមបញ្ញត្តិ (Ordained Name/Chhaya)" placeholder="នាមបញ្ញត្តិ..." :required="currentStep === 3" :error="errors.ordained_name" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">ថ្ងៃ-ខែ-ឆ្នាំ{{ isSamanera ? 'បព្វជ្ជា' : 'ឧបសម្បទា' }} (Ordination Date) <span class="text-danger">*</span></label>
                                <BaseDatePicker v-model="form.ordained_date" placeholder="Select date" :required="currentStep === 3" />
                            </div>
                        </div>
                    </div>

                    <!-- Step 4: Place of Ordination -->
                    <div v-show="currentStep === 4" class="step-content">
                        <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Place of Ordination / ទីកន្លែង{{ isSamanera ? 'បព្វជ្ជា' : 'ឧបសម្បទា' }}</h6>
                        
                        <div class="row g-4">
                            <!-- Wat spans full width -->
                            <div class="col-12 col-md-6">
                                <BaseInput v-model="form.ordination_wat" label="វត្ត (Wat)" placeholder="ឈ្មោះវត្ត..." :required="currentStep === 4" />
                            </div>
                            <div class="col-12 col-md-6">
                                <BaseSelect v-model="form.ordination_province_id" label="ខេត្ត/រាជធានី (Province)" placeholder="ខេត្ត/រាជធានី..." :required="currentStep === 4" :options="ordLoc.provinceOptions" @update:modelValue="onOrdProvinceChange" :loading="ordLoc.isLoadingProvinces" />
                            </div>
                            <div class="col-12 col-md-6">
                                <BaseSelect v-model="form.ordination_district_id" label="ក្រុង/ស្រុក/ខណ្ឌ (District)" placeholder="ក្រុង/ស្រុក/ខណ្ឌ..." :required="currentStep === 4" :options="ordLoc.districtOptions" :disabled="!form.ordination_province_id" @update:modelValue="onOrdDistrictChange" :loading="ordLoc.isLoadingDistricts" />
                            </div>
                            <div class="col-12 col-md-6">
                                <BaseSelect v-model="form.ordination_commune_id" label="ឃុំ/សង្កាត់ (Commune)" placeholder="ឃុំ/សង្កាត់..." :required="currentStep === 4" :options="ordLoc.communeOptions" :disabled="!form.ordination_district_id" @update:modelValue="onOrdCommuneChange" :loading="ordLoc.isLoadingCommunes" />
                            </div>
                        </div>
                    </div>

                    <!-- Step 5: Current Address -->
                    <div v-show="currentStep === 5" class="step-content">
                        <h6 class="fw-bold mb-4" style="color: var(--text-heading-color);">Current Address / អាសយដ្ឋានបច្ចុប្បន្ន</h6>
                        <div class="row g-4">
                            <!-- Wat spans full width -->
                            <div class="col-12 col-md-6">
                                <BaseInput v-model="form.current_wat" label="វត្ត (Wat)" placeholder="Enter wat name" :required="currentStep === 5" />
                            </div>
                            <div class="col-12 col-md-6">
                                <BaseSelect v-model="form.current_province_id" label="ខេត្ត/រាជធានី (Province)" placeholder="Enter province" :options="currLoc.provinceOptions" @update:modelValue="onCurrProvinceChange" :loading="currLoc.isLoadingProvinces" />
                            </div>
                            <div class="col-12 col-md-6">
                                <BaseSelect v-model="form.current_district_id" label="ស្រុក/ខណ្ឌ (District)" placeholder="Enter district" :options="currLoc.districtOptions" :disabled="!form.current_province_id" @update:modelValue="onCurrDistrictChange" :loading="currLoc.isLoadingDistricts" />
                            </div>
                            <div class="col-12 col-md-6">
                                <BaseSelect v-model="form.current_commune_id" label="ឃុំ/សង្កាត់ (Commune)" placeholder="Enter commune" :options="currLoc.communeOptions" :disabled="!form.current_district_id" @update:modelValue="onCurrCommuneChange" :loading="currLoc.isLoadingCommunes" />
                            </div>
                        </div>
                    </div>
                    
                    </fieldset>

                    <!-- Navigation Buttons -->
                    <div class="d-flex justify-content-between mt-5 w-100">
                        <BaseButton v-if="currentStep === 1" type="button" variant="outline-secondary" @click="cancelEdit" style="border-radius: 20px; padding: 0.5rem 1.5rem;">
                            {{ isReadOnly ? 'Close' : 'Previous' }}
                        </BaseButton>
                        <BaseButton v-if="currentStep > 1" type="button" variant="outline-secondary" @click="currentStep--" style="border-radius: 20px; padding: 0.5rem 1.5rem;">
                            Previous
                        </BaseButton>
                        
                        <BaseButton v-if="currentStep < 5" type="submit" variant="danger" style="border-radius: 20px; padding: 0.5rem 2rem; background-color: #e11d48; border-color: #e11d48;">
                            Next
                        </BaseButton>
                        
                        <BaseButton v-if="currentStep === 5 && !isReadOnly" type="button" @click="saveSurvey" variant="danger" :isLoading="saving" style="border-radius: 20px; padding: 0.5rem 2rem; background-color: #e11d48; border-color: #e11d48;">
                            Save
                        </BaseButton>
                        
                        <BaseButton v-if="currentStep === 5 && isReadOnly" type="button" @click="cancelEdit" variant="danger" style="border-radius: 20px; padding: 0.5rem 2rem; background-color: #e11d48; border-color: #e11d48;">
                            Close
                        </BaseButton>
                    </div>
                </form>
            </div>

        </div>

        <!-- Personal QR Modal -->
        <BaseModal v-model="showPersonalQrModal" title="My Personal QR Code / កូដ QR បុគ្គល" size="sm">
            <div class="text-center p-3">
                <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">{{ form.surname_name || authStore.user?.name || 'My Profile' }}</h5>
                <div class="text-primary fw-medium small mb-3">{{ form.ordained_name ? `Ordained: ${form.ordained_name}` : 'Monk / សង្ឃ' }}</div>

                <div ref="qrContainerRef" class="p-3 bg-white rounded-3 d-inline-block shadow-sm mb-3">
                    <QrcodeVue :value="userQrDataString" :size="200" level="H" />
                </div>

                <div class="p-3 rounded-3 text-center small mb-3" style="background-color: var(--surface-ground); border: 1px solid var(--border-color);">
                    <div v-if="form.kudi_number || authStore.user?.profile?.kut?.name || authStore.user?.profile?.kut_id" class="fw-bold text-warning mb-1">ស្នាក់នៅ៖ {{ form.kudi_number || authStore.user?.profile?.kut?.name || `កុដិ ${authStore.user?.profile?.kut_id}` }}</div>
                    <div v-if="form.phone_number || authStore.user?.profile?.phone" class="mb-1"><strong>ទូរស័ព្ទ៖</strong> {{ form.phone_number || authStore.user?.profile?.phone }}</div>
                    <div v-if="form.ordained_name"><strong>នាមបញ្ញត្តិ៖</strong> {{ form.ordained_name }}</div>
                </div>

                <div class="d-flex gap-2">
                    <BaseButton variant="outline-primary" class="flex-grow-1 d-flex align-items-center justify-content-center gap-1" @click="downloadPersonalQr">
                        <Download :size="16" />
                        <span>Download QR</span>
                    </BaseButton>
                    <BaseButton variant="secondary" class="flex-grow-1" @click="showPersonalQrModal = false">
                        Close
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { QrCode, Download } from '@lucide/vue';
import QrcodeVue from 'qrcode.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAvatarUpload from '@/components/base/BaseAvatarUpload.vue';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/dateFormat';
import { useLocation } from '@/composables/useLocation';
import { usePobLocation } from '@/composables/usePobLocation';
import { getVerifyTokenSync } from '@/utils/verifyHash';
import api from '@/api/api';

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    userId: {
        type: [String, Number],
        default: null
    },
    hideHeader: {
        type: Boolean,
        default: false
    },
    isReadOnly: {
        type: Boolean,
        default: false
    },
    forceIsSamanera: {
        type: Boolean,
        default: null
    }
});

const emit = defineEmits(['close']);

const downloadPersonalQr = () => {
    if (!qrContainerRef.value) return;
    const qrCanvas = qrContainerRef.value.querySelector('canvas');
    if (!qrCanvas) return;

    const width = 540;
    const fontFamily = '"Khmer OS Battambang", "Hanuman", "Noto Sans Khmer", sans-serif';

    // 1. Prepare details first to calculate exact dynamic height without bottom space
    const phoneVal = (form.value.phone_number || authStore.user?.profile?.phone || '').trim();
    const ordainedNameVal = (form.value.ordained_name || '').trim();
    const rawKudi = (form.value.kudi_number || authStore.user?.profile?.kut?.name || (authStore.user?.profile?.kut_id ? `កុដិ ${authStore.user.profile.kut_id}` : '')).trim();
    let kudiVal = '';
    if (rawKudi) {
        const cleanKudiNum = rawKudi.replace(/kudi|កុដិ|លេខ\s*/gi, '').trim();
        kudiVal = cleanKudiNum ? `កុដិលេខ ${cleanKudiNum}` : `កុដិ ${rawKudi}`;
    }

    const textLines = [];
    if (kudiVal) textLines.push({ text: `ស្នាក់នៅកុដិ៖ ${kudiVal}`, color: '#b45309', font: `bold 19px ${fontFamily}` });
    if (phoneVal) textLines.push({ text: `លេខទូរស័ព្ទ៖ ${phoneVal}`, color: '#334155', font: `bold 15px ${fontFamily}` });
    if (ordainedNameVal) textLines.push({ text: `នាមបញ្ញត្តិ៖ ${ordainedNameVal}`, color: '#475569', font: `bold 14px ${fontFamily}` });

    const qrBoxSize = 290;
    const qrBoxY = 175;
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
    const nameStr = (form.value.surname_name || authStore.user?.name || 'សមាជិក').trim();
    drawCenteredText(nameStr, 126, `bold 26px ${fontFamily}`, '#0f172a');

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
const showPersonalQrModal = ref(false);
const qrContainerRef = ref(null);

const userQrDataString = computed(() => {
    const userId = props.userId || authStore.user?.id;
    if (!userId) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const token = getVerifyTokenSync(userId);
    return `${origin}/verify-profile/${token}`;
});

const authStore  = useAuthStore();
const userStore   = useUserStore();
const avatarFile  = ref(null);
const viewedUserAvatar = ref('');
const toastStore = useToastStore();

const saving      = ref(false);
const isLoading   = ref(true);
const isEditing   = ref(false);
const hasSurvey   = ref(false);
const currentStep = ref(1);
const isSamanera  = ref(false);
const isAdmin = ref(false);
const isSuperAdmin = ref(false);

const getRoleTextEn = () => {
    if (isSuperAdmin.value) return 'SuperAdmin';
    if (isAdmin.value) return 'Admin';
    if (isSamanera.value) return 'Samanera';
    return 'Bhikkhu';
};

const getRoleTextKh = () => {
    if (isSuperAdmin.value) return 'អ្នកគ្រប់គ្រងកំពូល';
    if (isAdmin.value) return 'មេកុដិ';
    if (isSamanera.value) return 'សាមណេរ';
    return 'ភិក្ខុ';
};

const pobLoc = usePobLocation();
const ordLoc = useLocation();
const currLoc = useLocation();
const parentsLoc = useLocation();

const defaultForm = () => ({
    surname_name: '', latin_name: '', nationality: 'ខ្មែរ', date_of_birth: null,
    pob_village: '', pob_commune: '', pob_district: '', pob_province: '',
    pob_village_id: null, pob_commune_id: null, pob_district_id: null, pob_province_id: null,
    
    preceptor_name: '',
    ordained_name: '', ordained_date: null,
    
    ordination_wat: '', ordination_province_id: null, ordination_district_id: null, ordination_commune_id: null,
    current_wat: 'វត្តនាគវ័ន', current_province_id: null, current_district_id: null, current_commune_id: null,
    phone_number: '',
    
    edu_level: '', edu_school: '', edu_specialty: '', edu_grade: '',
    current_job: '', kudi_number: '',
    
    father_name: '', father_occupation: '',
    mother_name: '', mother_occupation: '',
    parents_province_id: null, parents_district_id: null, parents_commune_id: null, parents_village_id: null,
});

const form = ref(defaultForm());
const errors = ref({ phone_number: '', nationality: '', first_assistant_name: '', second_assistant_name: '', ordained_name: '' });

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

const extractDatePart = (dateString, part) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    if (part === 'day') return date.getDate().toString().padStart(2, '0');
    if (part === 'month') return (date.getMonth() + 1).toString().padStart(2, '0');
    if (part === 'year') return date.getFullYear().toString();
    return '';
};
const validatePhone = () => {
    const val = form.value.phone_number;
    if (!val) {
        errors.value.phone_number = '';
        return true;
    }
    if (/[^0-9 ]/.test(val)) {
        errors.value.phone_number = 'Phone number can only contain numbers and spaces';
        return false;
    }
    errors.value.phone_number = '';
    return true;
};

const validateNationality = () => {
    const val = form.value.nationality;
    if (!val) {
        errors.value.nationality = '';
        return true;
    }
    if (/[0-9]/.test(val)) {
        errors.value.nationality = 'Nationality cannot contain numbers';
        return false;
    }
    errors.value.nationality = '';
    return true;
};

watch(() => form.value.phone_number, () => {
    validatePhone();
});

watch(() => form.value.nationality, () => {
    validateNationality();
});

const validateNoNumbers = (field, label) => {
    const val = form.value[field];
    if (!val) {
        errors.value[field] = '';
        return true;
    }
    if (/[0-9]/.test(val)) {
        errors.value[field] = `${label} cannot contain numbers`;
        return false;
    }
    errors.value[field] = '';
    return true;
};

watch(() => form.value.first_assistant_name, () => validateNoNumbers('first_assistant_name', 'Name'));
watch(() => form.value.second_assistant_name, () => validateNoNumbers('second_assistant_name', 'Name'));
watch(() => form.value.ordained_name, () => validateNoNumbers('ordained_name', 'Name'));


const fetchSurvey = async () => {
    try {
        // Ensure all province lists are loaded (needed for read-only name lookups)
        await Promise.all([
            pobLoc.fetchProvinces(),
            ordLoc.fetchProvinces(),
            currLoc.fetchProvinces()
        ]);

        const endpoint = props.userId ? `/monk-surveys/${props.userId}` : `/monk-surveys/me`;
        const res = await api.get(endpoint);

        // For own profile, fetch fresh from /users/me to guarantee profile data is loaded
        let ownProfile = null;
        if (!props.userId) {
            try {
                await authStore.getProfile();
                ownProfile = authStore.user?.profile || null;
            } catch (e) { /* ignore */ }
        }

        if (res.data?.success && res.data.data) {
            const data = res.data.data;
            hasSurvey.value = true;
            isEditing.value = false;
            Object.keys(form.value).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    form.value[key] = data[key];
                }
            });
            
            // Load the viewed user's avatar
            // Backend returns raw column: avatar_url (not avatarUrl)
            viewedUserAvatar.value = data.User?.UserProfile?.avatar_url || ownProfile?.avatarUrl || '';
            
            // Set role flags
            if (props.forceIsSamanera !== null) {
                isSamanera.value = props.forceIsSamanera;
            } else if (data.User?.role_id) {
                isSamanera.value = String(data.User.role_id) === '3';
                isAdmin.value = String(data.User.role_id) === '2';
                isSuperAdmin.value = String(data.User.role_id) === '1';
            } else if (authStore.user?.role_id) {
                isSamanera.value = String(authStore.user.role_id) === '3';
                isAdmin.value = String(authStore.user.role_id) === '2';
                isSuperAdmin.value = String(authStore.user.role_id) === '1';
            }

            // Load cascading data
            if (form.value.pob_province_id) await pobLoc.fetchDistricts(form.value.pob_province_id);
            if (form.value.pob_district_id) await pobLoc.fetchCommunes(form.value.pob_district_id);
            if (form.value.pob_commune_id) await pobLoc.fetchVillages(form.value.pob_commune_id);

            if (form.value.ordination_province_id) await ordLoc.fetchDistricts(form.value.ordination_province_id);
            if (form.value.ordination_district_id) await ordLoc.fetchCommunes(form.value.ordination_district_id);

            if (form.value.current_province_id) await currLoc.fetchDistricts(form.value.current_province_id);
            if (form.value.current_district_id) await currLoc.fetchCommunes(form.value.current_district_id);

            // Auto-fill empty survey fields from user profile
            const up = data.User?.UserProfile || null;
            if (props.userId && up) {
                // Admin viewing another user — snake_case fields from raw UserProfile
                if (!form.value.surname_name) form.value.surname_name = `${up.last_name_kh || ''} ${up.first_name_kh || ''}`.trim();
                if (!form.value.latin_name) form.value.latin_name = `${up.first_name_en || ''} ${up.last_name_en || ''}`.trim();
                if (!form.value.date_of_birth && up.date_of_birth) form.value.date_of_birth = up.date_of_birth;
                if (!form.value.phone_number && up.phone_number) form.value.phone_number = up.phone_number;
            } else if (!props.userId && ownProfile) {
                // Own profile — camelCase fields from /users/me formatted response
                if (!form.value.surname_name) form.value.surname_name = `${ownProfile.last_name_kh || ''} ${ownProfile.first_name_kh || ''}`.trim();
                if (!form.value.latin_name) form.value.latin_name = `${ownProfile.first_name_en || ''} ${ownProfile.last_name_en || ''}`.trim();
                if (!form.value.date_of_birth && ownProfile.dateOfBirth) form.value.date_of_birth = ownProfile.dateOfBirth;
                if (!form.value.phone_number && ownProfile.phone) form.value.phone_number = ownProfile.phone;
            }
        } else {
            hasSurvey.value = false;

            // Even when no survey exists, auto-fill from own profile
            if (props.forceIsSamanera !== null) {
                isSamanera.value = props.forceIsSamanera;
            } else if (authStore.user?.role_id) {
                isSamanera.value = String(authStore.user.role_id) === '3';
            }

            if (ownProfile) {
                if (!form.value.surname_name) form.value.surname_name = `${ownProfile.last_name_kh || ''} ${ownProfile.first_name_kh || ''}`.trim();
                if (!form.value.date_of_birth && ownProfile.dateOfBirth) form.value.date_of_birth = ownProfile.dateOfBirth;
                if (!form.value.phone_number && ownProfile.phone) form.value.phone_number = ownProfile.phone;
                if (ownProfile.avatarUrl) viewedUserAvatar.value = ownProfile.avatarUrl;
            }
        }
        if (!form.value.nationality) form.value.nationality = 'KHMER';
    } catch (error) {
        console.error('Failed to load monk survey:', error);
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

const onOrdProvinceChange = async (val) => {
    form.value.ordination_district_id = null;
    form.value.ordination_commune_id = null;
    if (val) await ordLoc.fetchDistricts(val);
};

const onOrdDistrictChange = async (val) => {
    form.value.ordination_commune_id = null;
    if (val) await ordLoc.fetchCommunes(val);
};

const onOrdCommuneChange = async (val) => {
    // Ordination does not store village
};

const onCurrProvinceChange = async (val) => {
    form.value.current_district_id = null;
    form.value.current_commune_id = null;
    if (val) await currLoc.fetchDistricts(val);
};

const onCurrDistrictChange = async (val) => {
    form.value.current_commune_id = null;
    if (val) await currLoc.fetchCommunes(val);
};

const onCurrCommuneChange = async (val) => {
    // Current Address does not store village
};

const cancelEdit = () => {
    currentStep.value = 1;
    isEditing.value = false;
    emit('close');
};

const handleNextOrSave = () => {
    if (currentStep.value < 5) {
        currentStep.value++;
    } else {
        saveSurvey();
    }
};

const getLocationName = (list, code, type) => {
    if (!code) return '';
    const item = list.find(l => String(l[`${type}_code`]) === String(code));
    return item ? (item[`${type}_kh`] || item[`${type}_en`]) : code;
};

// Parents cascades
const onParentsProvinceChange = async () => {
    form.value.parents_district_id = null;
    form.value.parents_commune_id = null;
    form.value.parents_village_id = null;
    if (form.value.parents_province_id) {
        await parentsLoc.fetchDistricts(form.value.parents_province_id);
    }
};

const onParentsDistrictChange = async () => {
    form.value.parents_commune_id = null;
    form.value.parents_village_id = null;
    if (form.value.parents_district_id) {
        await parentsLoc.fetchCommunes(form.value.parents_district_id);
    }
};

const onParentsCommuneChange = async () => {
    form.value.parents_village_id = null;
    if (form.value.parents_commune_id) {
        await parentsLoc.fetchVillages(form.value.parents_commune_id);
    }
};

const saveSurvey = async () => {
    if (!validatePhone() || !validateNationality() || 
        !validateNoNumbers('first_assistant_name', 'Name') ||
        !validateNoNumbers('second_assistant_name', 'Name') ||
        !validateNoNumbers('ordained_name', 'Name')) {
        toastStore.showToast('Please fix validation errors before saving', 'error');
        return;
    }
    saving.value = true;
    try {
        const payload = { ...form.value };
        if (payload.date_of_birth instanceof Date) {
            payload.date_of_birth = payload.date_of_birth.toISOString().split('T')[0];
        }
        if (payload.ordained_date instanceof Date) {
            payload.ordained_date = payload.ordained_date.toISOString().split('T')[0];
        }

        const endpoint = props.userId ? `/monk-surveys/${props.userId}` : `/monk-surveys/me`;
        const res = await api.put(endpoint, payload);

        // Upload avatar if a new file was selected
        if (avatarFile.value) {
            const fd = new FormData();
            fd.append('avatar', avatarFile.value);
            await userStore.uploadProfileAvatar(fd);
            await authStore.fetchCurrentUser();
        }

        if (res.data?.success) {
            toastStore.showToast('Survey saved successfully', 'success');
            hasSurvey.value = true;
            await fetchSurvey();
            isEditing.value = false;
            currentStep.value = 1;
            emit('close');
        }
    } catch (error) {
        toastStore.showToast('Failed to save survey', 'error');
        console.error(error);
    } finally {
        saving.value = false;
    }
};

onMounted(async () => {
    isLoading.value = true;
    await fetchSurvey();
    isLoading.value = false;
});
</script>

<style scoped>
.khmer-muol {
    font-family: 'Khmer OS Muol Light', 'Suwannaphum', serif;
}

.dotted-line {
    border-bottom: 2px dotted #adb5bd;
    display: inline-block;
    min-height: 1.5rem;
    line-height: 1.2;
}

.photo-box {
    position: relative;
    z-index: 10;
}
</style>
