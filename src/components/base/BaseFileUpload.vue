<template>
    <div class="base-file-upload">
        <transition name="fade">
            <div v-show="!modelValue || modelValue.length < maxFiles"
                class="upload-container border p-4 text-center rounded position-relative"
                @dragover.prevent="!isLoading && (isDragging = true)" 
                @dragleave.prevent="!isLoading && (isDragging = false)" 
                @drop.prevent="!isLoading && handleDrop($event)"
                :class="[
                    isDragging && !isLoading ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle',
                    isLoading ? 'opacity-50' : ''
                ]"
                :style="`border: var(--border-width) dashed var(--border-clr) !important; cursor: ${isLoading ? 'not-allowed' : 'pointer'}; border-radius: var(--border-inner-radius) !important; pointer-events: ${isLoading ? 'none' : 'auto'};`"
                @click="!isLoading && triggerUpload()">

            <input type="file" ref="fileInput" class="d-none" :accept="accept" :multiple="maxFiles > 1" :disabled="isLoading"
                @change="handleChange" />

            <div class="upload-content text-muted">
                <div v-if="isLoading" class="py-3">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <p class="mb-1 fw-bold" style="color: var(--text-base);">Processing files...</p>
                    <small>Please wait</small>
                </div>
                <template v-else>
                    <i class="bi bi-cloud-arrow-up display-4 mb-2"></i>
                    <div v-if="!modelValue || modelValue.length === 0">
                        <p class="mb-1 fw-bold" style="color: var(--text-base);">Click to upload or drag and drop</p>
                        <small>Images supported (Max: {{ maxFiles }} files, {{ formatSize(maxFileSize) }} each)</small>
                    </div>
                    <div v-else>
                        <p class="mb-1 fw-bold" style="color: var(--text-base);">Add more files</p>
                        <small>Attached {{ modelValue.length }} of {{ maxFiles }} files</small>
                    </div>
                </template>
            </div>
        </div>
        </transition>

        <div v-if="errorMessages.length" class="mt-2 text-danger small">
            <div v-for="(err, idx) in errorMessages" :key="idx"><i class="bi bi-exclamation-triangle me-1"></i>{{ err }}
            </div>
        </div>

        <div v-if="modelValue && modelValue.length" class="mt-2">
            <div class="d-flex flex-wrap gap-2">
                <div v-for="(file, index) in modelValue" :key="index" 
                    class="position-relative overflow-hidden bg-light flex-fill shadow-sm border"
                    :style="modelValue.length === 1 
                        ? 'min-width: 100%; height: 240px; border-radius: var(--border-inner-radius);' 
                        : 'min-width: 120px; max-width: 100%; height: 120px; border-radius: var(--border-inner-radius);'">
                    
                    <div class="image-spinner position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center" style="z-index: 0;">
                        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                    </div>

                    <Image v-image-load v-if="file.imageUrl" :src="$authImg(file.imageUrl)" preview imageClass="w-100 h-100 object-fit-cover" class="w-100 h-100 d-block position-relative" style="z-index: 1;" />
                    <Image v-image-load v-else-if="getPreviewUrl(file)" :src="getPreviewUrl(file)" preview imageClass="w-100 h-100 object-fit-cover" class="w-100 h-100 d-block position-relative" style="z-index: 1;" />
                    <div v-else class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted position-relative bg-light" style="z-index: 1;">
                        <i class="bi bi-image" style="font-size: 2rem; opacity: 0.5;"></i>
                    </div>

                    <button type="button" @click.stop="removeFile(index)"
                        class="btn-close position-absolute top-0 end-0 m-2 bg-white border shadow-none border-secondary"
                        style="font-size: 10px; padding: 6px; opacity: 0.85; z-index: 2;" title="Remove file" :disabled="isLoading"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onUnmounted, toRaw } from 'vue';
import Image from 'primevue/image';

const vImageLoad = {
    mounted(el) {
        const img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (img) {
            const hideSpinner = () => {
                if (el.previousElementSibling && el.previousElementSibling.classList.contains('image-spinner')) {
                    el.previousElementSibling.style.display = 'none';
                }
            };
            if (img.complete) {
                hideSpinner();
            } else {
                img.addEventListener('load', hideSpinner);
            }
        }
    }
};

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    maxFiles: { type: Number, default: 5 },
    maxFileSize: { type: Number, default: 5000000 },
    accept: { type: String, default: 'image/*' },
    required: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const isDragging = ref(false);
const errorMessages = ref([]);
const previewUrls = ref({});

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const triggerUpload = () => {
    errorMessages.value = [];
    if (props.modelValue.length >= props.maxFiles) {
        errorMessages.value.push(`You can only upload up to ${props.maxFiles} files.`);
        return;
    }
    fileInput.value.click();
};

const handleFiles = (files) => {
    errorMessages.value = [];
    const newFilesList = Array.from(files);
    const validFiles = [];

    let currentTotal = props.modelValue.length;

    for (const file of newFilesList) {
        if (currentTotal >= props.maxFiles) {
            errorMessages.value.push(`Cannot exceed ${props.maxFiles} files. Some files were skipped.`);
            break;
        }

        if (file.size > props.maxFileSize) {
            errorMessages.value.push(`File "${file.name}" exceeds the size limit of ${formatSize(props.maxFileSize)}.`);
            continue;
        }

        validFiles.push(file);
        currentTotal++;
    }

    if (validFiles.length) {
        emit('update:modelValue', [...props.modelValue, ...validFiles]);
    }

    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const handleChange = (e) => {
    if (e.target.files?.length) {
        handleFiles(e.target.files);
    }
};

const handleDrop = (e) => {
    isDragging.value = false;
    if (e.dataTransfer?.files?.length) {
        handleFiles(e.dataTransfer.files);
    }
};

const removeFile = (index) => {
    const file = props.modelValue[index];
    if (file && !file.imageUrl && previewUrls.value[file.name]) {
        URL.revokeObjectURL(previewUrls.value[file.name]);
        delete previewUrls.value[file.name];
    }

    const newValue = [...props.modelValue];
    newValue.splice(index, 1);
    emit('update:modelValue', newValue);
};

const getPreviewUrl = (file) => {
    const rawFile = toRaw(file);
    if (!rawFile || !(rawFile instanceof File || rawFile instanceof Blob)) return '';
    if (previewUrls.value[rawFile.name]) return previewUrls.value[rawFile.name];

    try {
        const url = URL.createObjectURL(rawFile);
        previewUrls.value[rawFile.name] = url;
        return url;
    } catch (e) {
        console.error('Failed to create object URL:', e);
        return '';
    }
};

onUnmounted(() => {
    Object.values(previewUrls.value).forEach(url => URL.revokeObjectURL(url));
});
</script>
