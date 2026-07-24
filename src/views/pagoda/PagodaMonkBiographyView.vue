<template>
    <div :class="['monk-biography-view h-100 d-flex flex-column align-items-center', hideHeader ? '' : 'pb-3']">
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center w-100 py-5 no-print">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        
        <!-- Print Layout (Hidden on Screen) -->
        <div class="print-only formal-document w-100 position-relative" v-if="!isLoading && form">
            <div class="text-center mb-4 mt-2">
                <div class="khmer-muol fs-5 mb-1">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div class="khmer-muol fs-6 mb-4">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                <div class="khmer-muol fs-5 mb-0" style="text-decoration: underline;">ប្រវត្តិរូបសង្ខេប ({{ isSamanera ? 'សាមណេរ' : 'ភិក្ខុ' }})</div>
            </div>
            
            <!-- The 4x6 photo box on top right -->
            <div class="position-absolute" style="top: 0; right: 0; width: 4cm; height: 6cm; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                ៤x៦
            </div>

            <!-- Personal Info -->
            <div class="print-row mt-5">
                <span class="print-label">-គោត្តនាម-នាម :</span>
                <span class="print-value khmer-muol">{{ form.surname_name }}</span>
                <span class="print-label mx-2">អក្សរឡាតាំង :</span>
                <span class="print-value text-uppercase">{{ form.latin_name }}</span>
                <span class="print-label mx-2">សញ្ជាតិ :</span>
                <span class="print-value flex-grow-1">{{ form.nationality }}</span>
            </div>
            <div class="print-sub-label">
                -Surname-Name: <span style="margin-right: 170px;"></span> Nationality:
            </div>

            <div class="print-row">
                <span class="print-label">-ថ្ងៃ-ខែ-ឆ្នាំកំណើត: ថ្ងៃ.........</span>
                <span class="print-value" style="width: 40px;">{{ extractDatePart(form.date_of_birth, 'day') }}</span>
                <span class="print-label">ខែ.........</span>
                <span class="print-value" style="width: 40px;">{{ extractDatePart(form.date_of_birth, 'month') }}</span>
                <span class="print-label">ឆ្នាំ.........</span>
                <span class="print-value" style="width: 60px;">{{ extractDatePart(form.date_of_birth, 'year') }}</span>
                <span class="print-label">ស័ក ព.ស......... ត្រូវនឹងថ្ងៃទី.........ខែ.........ឆ្នាំ.........</span>
            </div>
            <div class="print-sub-label">-Date of Birth :</div>

            <div class="print-row">
                <span class="print-label">-ទីកន្លែងកំណើត : ភូមិ.........</span>
                <span class="print-value" style="width: 150px;">{{ getLocationName(pobLoc.villages, form.pob_village_id, 'village') }}</span>
                <span class="print-label">ឃុំ/សង្កាត់.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(pobLoc.communes, form.pob_commune_id, 'commune') }}</span>
            </div>
            <div class="print-row mt-1">
                <span class="print-label" style="padding-left: 100px;">ក្រុង/ស្រុក/ខណ្ឌ.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(pobLoc.districts, form.pob_district_id, 'district') }}</span>
                <span class="print-label">ខេត្ត/រាជធានី.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(pobLoc.provinces, form.pob_province_id, 'province') }}</span>
            </div>
            <div class="print-sub-label">
                -Place of Birth : Village: <span style="margin-right: 150px;"></span> Commune: <span style="margin-right: 150px;"></span> District: <span style="margin-right: 150px;"></span> Province:
            </div>

            <div class="print-row mt-2">
                <span class="print-label">-នាមព្រះឧបជ្ឈាយ៍:</span>
                <span class="print-value flex-grow-1">{{ form.preceptor_name }}</span>
            </div>
            <div class="print-sub-label">-Preceptor's Name:</div>

            <template v-if="!isSamanera">
                <div class="print-row mt-2">
                    <span class="print-label">-នាមឧបសម្បទាចារ្យ:</span>
                    <span class="print-value flex-grow-1">{{ form.first_assistant_name }}</span>
                </div>
                <div class="print-sub-label">-First Assistant Preceptor's Name:</div>

                <div class="print-row mt-2">
                    <span class="print-label">-នាមអនុស្សាវនាចារ្យ:</span>
                    <span class="print-value flex-grow-1">{{ form.second_assistant_name }}</span>
                </div>
                <div class="print-sub-label">-Second Assistant Preceptor's Name:</div>
            </template>

            <div class="print-row mt-2">
                <span class="print-label">-នាមបញ្ញត្តិ:</span>
                <span class="print-value flex-grow-1">{{ form.ordained_name }}</span>
            </div>
            <div class="print-sub-label">-Ordained Name:</div>

            <div class="print-row mt-2">
                <span class="print-label">-{{ isSamanera ? 'ថ្ងៃ-ខែ-ឆ្នាំបព្វជ្ជា' : 'ថ្ងៃ-ខែ-ឆ្នាំឧបសម្បទា' }}: ថ្ងៃ.........</span>
                <span class="print-value" style="width: 40px;">{{ extractDatePart(form.ordained_date, 'day') }}</span>
                <span class="print-label">ខែ.........</span>
                <span class="print-value" style="width: 40px;">{{ extractDatePart(form.ordained_date, 'month') }}</span>
                <span class="print-label">ឆ្នាំ.........</span>
                <span class="print-value" style="width: 60px;">{{ extractDatePart(form.ordained_date, 'year') }}</span>
                <span class="print-label">ស័ក ព.ស......... ត្រូវនឹងថ្ងៃទី.........ខែ.........ឆ្នាំ.........ម៉ោង.........</span>
            </div>
            <div class="print-sub-label">-Date of {{ isSamanera ? 'Ordination' : 'Higher Ordination' }}:</div>

            <div class="print-row mt-2">
                <span class="print-label">-{{ isSamanera ? 'ទីកន្លែងបព្វជ្ជា' : 'ទីកន្លែងឧបសម្បទា' }}: វត្ត.........</span>
                <span class="print-value flex-grow-1">{{ form.ordination_wat }}</span>
                <span class="print-label">ឃុំ/សង្កាត់.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(ordLoc.communes, form.ordination_commune_id, 'commune') }}</span>
            </div>
            <div class="print-row mt-1">
                <span class="print-label" style="padding-left: 130px;">ក្រុង/ស្រុក/ខណ្ឌ.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(ordLoc.districts, form.ordination_district_id, 'district') }}</span>
                <span class="print-label">រាជធានី/ខេត្ត.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(ordLoc.provinces, form.ordination_province_id, 'province') }}</span>
            </div>
            <div class="print-sub-label">
                -Place of Higher Ordination: Wat: <span style="margin-right: 120px;"></span> Commune: <span style="margin-right: 120px;"></span> District: <span style="margin-right: 120px;"></span> Province:
            </div>

            <div class="print-row mt-2">
                <span class="print-label">-អាសយដ្ឋានបច្ចុប្បន្ន: វត្ត.........</span>
                <span class="print-value flex-grow-1">{{ form.current_wat }}</span>
                <span class="print-label">ឃុំ/សង្កាត់.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(currLoc.communes, form.current_commune_id, 'commune') }}</span>
            </div>
            <div class="print-row mt-1">
                <span class="print-label" style="padding-left: 130px;">ក្រុង/ស្រុក/ខណ្ឌ.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(currLoc.districts, form.current_district_id, 'district') }}</span>
                <span class="print-label">រាជធានី/ខេត្ត.........</span>
                <span class="print-value flex-grow-1">{{ getLocationName(currLoc.provinces, form.current_province_id, 'province') }}</span>
            </div>
            <div class="print-sub-label">
                -Current Address: Wat: <span style="margin-right: 120px;"></span> Commune: <span style="margin-right: 120px;"></span> District: <span style="margin-right: 120px;"></span> Province:
            </div>

            <div class="mt-4 mb-2" style="font-size: 1.1rem; padding-left: 2rem;">
                ខ្ញុំព្រះករុណា សូមធានាទទួលខុសត្រូវចំពោះមុខច្បាប់ថា ព័ត៌មានដែលបានបំពេញខាងលើនេះ ពិតជាត្រឹមត្រូវប្រាកដមែន ។
            </div>
            
            <div class="print-row mb-4">
                <span class="print-label">-លេខទូរស័ព្ទ (+855) </span>
                <span class="print-value" style="width: 150px; margin-left: 5px;">{{ form.phone_number }}</span>
            </div>

            <!-- Signatures: Top Row (Left/Right) -->
            <div class="d-flex justify-content-between mt-4 px-3">
                <div class="text-center" style="width: 45%;">
                    <div class="khmer-muol mb-2">{{ isSamanera ? 'បានឃើញ និងឯកភាព' : 'បានឃើញ និងទទួលស្គាល់' }}</div>
                    <div>វត្តតាតែន, ថ្ងៃទី.........ខែ.........ឆ្នាំ២០២...</div>
                    <div class="khmer-muol" style="margin-top: 3rem;">{{ isSamanera ? 'ព្រះគ្រូមេកុដិលេខ.........' : 'មេកុដិលេខ.........' }}</div>
                </div>
                
                <div class="text-center" style="width: 45%;">
                    <div class="mb-2">ថ្ងៃទី.........ខែ.........ឆ្នាំ.........ស័ក ព.ស.២៥៦...</div>
                    <div>វត្តតាតែន, ថ្ងៃទី.........ខែ.........ឆ្នាំ២០២...</div>
                    <div class="khmer-muol" style="margin-top: 3rem;">ហត្ថលេខាសាមីអង្គ</div>
                </div>
            </div>

            <!-- Signatures: Bottom Row (Center) -->
            <div class="text-center" style="margin-top: 2rem;">
                <div class="khmer-muol mb-2">បានឃើញ និងឯកភាព</div>
                <div>វត្តតាតែន, ថ្ងៃទី.........ខែ.........ឆ្នាំ២០២...</div>
                <div class="khmer-muol" style="margin-top: 3rem;">ព្រះចៅអធិការវត្តតាតែន</div>
            </div>
            
            <div class="mt-4">
                <u>សូមភ្ជាប់មកជាមួយ៖</u>
            </div>
        </div>

        <div v-if="!isLoading" class="w-100 no-print" style="max-width: 1000px;">
            <div v-if="!hideHeader" class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 mt-2 gap-3">
                <h5 class="fw-bold mb-0" style="color: var(--text-heading-color);">{{ title || `Monk Profile Summary / ប្រវត្តិរូបសង្ខេប (${isSamanera ? 'សាមណេរ' : 'ភិក្ខុ'})` }}</h5>
            </div>

            <!-- Summary View (Read Only) - Modern Dashboard Style -->
            <div v-if="!isEditing" class="mx-auto w-100 p-4" style="background-color: rgba(220, 225, 229, 0.4); border-radius: 12px; max-width: 1000px;">
                
                <!-- Header with Avatar and Name -->
                <div class="d-flex flex-wrap align-items-center mb-4 gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center text-secondary" style="width: 75px; height: 75px; background-color: #e2e6ea; font-size: 2rem; flex-shrink: 0;">
                        <img v-if="viewedUserAvatar || (!props.userId && authStore.user?.profile?.avatarUrl)" 
                             :src="$authImg(viewedUserAvatar || authStore.user?.profile?.avatarUrl)" 
                             class="w-100 h-100 rounded-circle object-fit-cover">
                        <span v-else>{{ form.surname_name ? form.surname_name.charAt(0).toUpperCase() : 'M' }}</span>
                    </div>
                    <div class="flex-grow-1">
                        <h4 class="mb-1 fw-bold" style="color: #2b3035;">{{ form.surname_name || 'N/A' }}</h4>
                        <div class="text-secondary" style="font-size: 0.95rem;">Ordained Name: <span class="text-primary">{{ form.ordained_name || '-' }}</span></div>
                    </div>
                    <div class="d-flex gap-2">
                        <BaseButton variant="outline-primary" @click="printBiography" style="background-color: transparent;">
                            <Printer :size="18" class="me-2"/> Print / បោះពុម្ព
                        </BaseButton>
                        <BaseButton variant="outline-secondary" @click="startEdit" style="background-color: transparent; color: #495057;">
                            Edit / កែសម្រួល
                        </BaseButton>
                    </div>
                </div>

                <!-- 2x2 Grid of Cards -->
                <div class="row g-4">
                    <!-- Personal Identity -->
                    <div class="col-md-6">
                        <div class="card h-100 shadow-sm border-0" style="background-color: rgba(220, 225, 229, 0.6); border-radius: 8px;">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Personal Identity / អត្តសញ្ញាណបុគ្គល</h6>
                                <div class="mb-2 text-secondary">Nationality: <span class="text-dark">{{ form.nationality || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Date of Birth: <span class="text-dark">{{ formatDate(form.date_of_birth) || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Phone Number: <span class="text-dark">{{ form.phone_number || 'N/A' }}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Place of Birth -->
                    <div class="col-md-6">
                        <div class="card h-100 shadow-sm border-0" style="background-color: rgba(220, 225, 229, 0.6); border-radius: 8px;">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Place of Birth / ទីកន្លែងកំណើត</h6>
                                <div class="mb-2 text-secondary">Province: <span class="text-dark">{{ getLocationName(pobLoc.provinces, form.pob_province_id, 'province') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">District: <span class="text-dark">{{ getLocationName(pobLoc.districts, form.pob_district_id, 'district') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Commune: <span class="text-dark">{{ getLocationName(pobLoc.communes, form.pob_commune_id, 'commune') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Village: <span class="text-dark">{{ getLocationName(pobLoc.villages, form.pob_village_id, 'village') || 'N/A' }}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Ordination Details -->
                    <div class="col-md-6">
                        <div class="card h-100 shadow-sm border-0" style="background-color: rgba(220, 225, 229, 0.6); border-radius: 8px;">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Ordination Details / ព័ត៌មាន{{ isSamanera ? 'បព្វជ្ជា' : 'ឧបសម្បទា' }}</h6>
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="mb-2 text-secondary">Preceptor Name: <span class="text-dark">{{ form.preceptor_name || 'N/A' }}</span></div>
                                        <div v-if="!isSamanera" class="mb-2 text-secondary">First Assistant: <span class="text-dark">{{ form.first_assistant_name || 'N/A' }}</span></div>
                                        <div v-if="!isSamanera" class="mb-2 text-secondary">Second Assistant: <span class="text-dark">{{ form.second_assistant_name || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">Ordained Date: <span class="text-dark">{{ formatDate(form.ordained_date) || 'N/A' }}</span></div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="mb-2 text-secondary">Wat / Pagoda: <span class="text-dark">{{ form.ordination_wat || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">Province: <span class="text-dark">{{ getLocationName(ordLoc.provinces, form.ordination_province_id, 'province') || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">District: <span class="text-dark">{{ getLocationName(ordLoc.districts, form.ordination_district_id, 'district') || 'N/A' }}</span></div>
                                        <div class="mb-2 text-secondary">Commune: <span class="text-dark">{{ getLocationName(ordLoc.communes, form.ordination_commune_id, 'commune') || 'N/A' }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Current Address -->
                    <div class="col-md-6">
                        <div class="card h-100 shadow-sm border-0" style="background-color: rgba(220, 225, 229, 0.6); border-radius: 8px;">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3" style="color: #026bb4;">Current Address / អាសយដ្ឋានបច្ចុប្បន្ន</h6>
                                <div class="mb-2 text-secondary">Wat / Pagoda: <span class="text-dark">{{ form.current_wat || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Province: <span class="text-dark">{{ getLocationName(currLoc.provinces, form.current_province_id, 'province') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">District: <span class="text-dark">{{ getLocationName(currLoc.districts, form.current_district_id, 'district') || 'N/A' }}</span></div>
                                <div class="mb-2 text-secondary">Commune: <span class="text-dark">{{ getLocationName(currLoc.communes, form.current_commune_id, 'commune') || 'N/A' }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div v-else :class="['mx-auto w-100', hideHeader ? '' : 'card p-4']" :style="hideHeader ? { paddingBottom: '1rem' } : { backgroundColor: 'var(--body-bg-color)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color, rgba(0,0,0,0.06))', maxWidth: '1000px' }">
                <h5 v-if="!hideHeader" class="fw-bold mb-4 text-primary">Biography Survey / ប្រវត្តិរូបសង្ខេប ({{ isSamanera ? 'សាមណេរ' : 'ភិក្ខុ' }})</h5>
                
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
                                <BaseInput v-model="form.surname_name" placeholder="E.g., ឈួន ស៊ីណា" :required="currentStep === 1" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" style="color: var(--text-color);">Surname-Name (គោត្តនាម-នាម) - Latin <span class="text-danger">*</span></label>
                                <BaseInput v-model="form.latin_name" placeholder="E.g., CHHOUN SINA" :required="currentStep === 1" />
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
                            <div v-if="!isSamanera" class="col-12 col-md-6">
                                <BaseInput v-model="form.first_assistant_name" label="នាមកម្មវាចាចារ្យ (First Assistant)" placeholder="បញ្ញត្តិ នឹង នាម..." :required="currentStep === 3 && !isSamanera" :error="errors.first_assistant_name" />
                            </div>
                            <div v-if="!isSamanera" class="col-12 col-md-6">
                                <BaseInput v-model="form.second_assistant_name" label="នាមអនុស្សាវនាចារ្យ (Second Assistant)" placeholder="បញ្ញត្តិ នឹង នាម..." :required="currentStep === 3 && !isSamanera" :error="errors.second_assistant_name" />
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
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

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
    }
});

const emit = defineEmits(['close']);

import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import { formatDate } from '@/utils/dateFormat';
import api from '@/api/api';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import { Printer } from '@lucide/vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAvatarUpload from '@/components/base/BaseAvatarUpload.vue';
import { useLocation } from '@/composables/useLocation';

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

const pobLoc = useLocation();
const ordLoc = useLocation();
const currLoc = useLocation();
const parentsLoc = useLocation();

const defaultForm = () => ({
    surname_name: '', latin_name: '', nationality: 'ខ្មែរ', date_of_birth: null,
    pob_village: '', pob_commune: '', pob_district: '', pob_province: '',
    pob_village_id: null, pob_commune_id: null, pob_district_id: null, pob_province_id: null,
    
    preceptor_name: '', first_assistant_name: '', second_assistant_name: '',
    ordained_name: '', ordained_date: null,
    
    ordination_wat: '', ordination_province_id: null, ordination_district_id: null, ordination_commune_id: null,
    current_wat: '', current_province_id: null, current_district_id: null, current_commune_id: null,
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

const printBiography = () => {
    window.print();
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
            
            // Set isSamanera based on role_id (3 is Samanera)
            if (data.User?.role_id) {
                isSamanera.value = data.User.role_id === 3;
            } else if (authStore.user?.role_id) {
                isSamanera.value = authStore.user.role_id === 3;
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
    const item = list.find(l => l[`${type}_code`] === code);
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
.formal-document {
    background-color: #ffffff !important;
    padding: 1cm;
    font-family: 'Khmer OS Battambang', 'Suwannaphum', sans-serif;
    color: #212529;
}

.khmer-muol {
    font-family: 'Khmer OS Muol Light', 'Suwannaphum', serif;
}

.print-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 6px;
    font-size: 1.15rem;
    line-height: 1.4;
}
.print-label {
    white-space: nowrap;
}
.print-value {
    border-bottom: 2px dotted #000;
    text-align: center;
    color: #000;
    min-height: 1.5rem;
    font-size: 1.05rem;
}
.print-sub-label {
    font-size: 0.85rem;
    color: #555;
    margin-top: 0px;
    margin-bottom: 12px;
}

.print-only {
    display: none;
}

@media print {
    body {
        background-color: #fff !important;
        padding: 0;
        margin: 0;
    }
    
    .print-only, .print-only * {
        visibility: visible;
    }
    .print-only {
        display: block !important;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0 !important;
    }
    
    /* Hide everything else */
    .no-print,
    .app-sidebar,
    .app-header,
    .monk-biography-view > *:not(.print-only) {
        display: none !important;
    }
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
