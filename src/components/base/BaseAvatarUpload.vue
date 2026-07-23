<template>
    <div class="base-avatar-upload d-flex flex-column align-items-center">
        <div class="avatar-ring-container" :class="{ 'is-loading': isLoading || isImageLoading }">
            <label class="avatar-wrapper" :class="{ 'has-image': previewUrl, 'disabled': disabled }">
                <input type="file" accept="image/*" class="d-none" @change="onFileSelected" :disabled="disabled" />
                
                <div class="avatar-preview" :style="{ backgroundImage: `url(${previewUrl})` }" v-if="previewUrl"></div>
                <div class="avatar-placeholder" v-else>
                    <Camera class="text-muted" :size="32" />
                    <span class="small text-muted mt-2">Upload</span>
                </div>

                <div class="avatar-overlay" v-if="!disabled">
                    <Camera class="text-white" :size="24" />
                </div>
            </label>
        </div>
        <button v-if="previewUrl && !disabled" class="btn btn-sm btn-link text-danger mt-2" @click="removeImage">
            Remove
        </button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Camera } from '@lucide/vue';
import { getAuthImageUrl } from '@/utils/imageUrl';

const props = defineProps({
    modelValue: {
        type: [File, String, Object],
        default: null
    },
    defaultImage: {
        type: String,
        default: null
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const previewUrl = ref(getAuthImageUrl(props.defaultImage) || null);
const initialImageOnly = ref(!!props.defaultImage && !props.modelValue);
const isImageLoading = ref(!!props.defaultImage);

watch(() => previewUrl.value, (newUrl) => {
    if (newUrl && !newUrl.startsWith('blob:')) {
        isImageLoading.value = true;
        const img = new Image();
        img.onload = () => { isImageLoading.value = false; };
        img.onerror = () => { isImageLoading.value = false; };
        img.src = newUrl;
    } else {
        isImageLoading.value = false;
    }
}, { immediate: true });

watch(() => props.defaultImage, (newVal) => {
    if (!props.modelValue) {
        previewUrl.value = getAuthImageUrl(newVal);
        initialImageOnly.value = true;
    }
});

const onFileSelected = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (previewUrl.value && !initialImageOnly.value && previewUrl.value.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl.value);
        }
        previewUrl.value = URL.createObjectURL(file);
        initialImageOnly.value = false;
        emit('update:modelValue', file);
        emit('change', file);
    }
    // Reset input so the same file can be selected again if removed
    event.target.value = '';
};

const removeImage = () => {
    if (previewUrl.value && !initialImageOnly.value && previewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value);
    }
    
    const wasInitialImage = initialImageOnly.value;
    
    previewUrl.value = null;
    initialImageOnly.value = false;
    
    if (wasInitialImage) {
        emit('update:modelValue', 'DELETE');
        emit('change', 'DELETE');
    } else {
        emit('update:modelValue', null);
        emit('change', null);
    }
};
</script>

<style scoped>
.base-avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 2px dashed var(--border-clr);
    background-color: var(--surface-ground);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s ease;
}

.avatar-wrapper:not(.disabled):hover {
    border-color: var(--primary-color);
}

.avatar-wrapper.disabled {
    cursor: default;
    opacity: 0.9;
}

.avatar-preview {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: absolute;
    top: 0;
    left: 0;
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.avatar-wrapper:not(.disabled):hover .avatar-overlay {
    opacity: 1;
}

.avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
}

.d-none {
    display: none;
}

.avatar-ring-container {
    position: relative;
    border-radius: 50%;
    padding: 3px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.avatar-ring-container.is-loading::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: conic-gradient(transparent 60%, var(--primary-color) 100%);
    animation: rotate 1.2s linear infinite;
}

.avatar-ring-container > .avatar-wrapper {
    position: relative;
    z-index: 1;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
