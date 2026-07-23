<template>
    <form>
        <div class="mb-3 d-flex flex-column align-items-center">
            <span class="text-muted small mb-2 fw-medium" v-if="!disabled">How was the resolution?</span>
            <Rating v-model="formData.rating" :readonly="disabled" :cancel="false" class="modern-rating">
                <template #onicon>
                    <Star class="rating-icon active-icon" fill="currentColor" :size="32" />
                </template>
                <template #officon>
                    <Star class="rating-icon inactive-icon" :size="32" />
                </template>
            </Rating>
        </div>
        <div>
            <BaseInput v-model="formData.comment" :disabled="disabled" type="textarea" :rows="1"
                placeholder="Leave a comment (optional)..." />
        </div>
    </form>
</template>

<script setup>
import { Rating } from 'primevue';
import { Star } from '@lucide/vue';
import { ref, watch } from 'vue'

const formData = ref({
    rating: 0,
    comment: ''
})

const props = defineProps({
    initialData: Object,
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:validity'])

const initForm = () => {
    if (props.initialData) {
        formData.value = {
            rating: props.initialData.rating || 0,
            comment: props.initialData.comment || '',
        }
    } else {
        formData.value = {
            rating: 0,
            comment: '',
        }
    }
}

watch(() => props.initialData, () => {
    initForm()
}, { deep: true, immediate: true })

import { computed } from 'vue';

const isValid = computed(() => {
    return formData.value.rating > 0 || (formData.value.comment && formData.value.comment.trim().length > 0);
});

watch(isValid, (newVal) => {
    emit('update:validity', newVal);
}, { immediate: true });

defineExpose({ formData, isValid })
</script>

<style scoped>

.inactive-icon {
    color: var(--border-clr);
}

.active-icon {
    color: var(--warning-color);
}
</style>