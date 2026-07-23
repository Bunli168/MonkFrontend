<template>
    <div class="room-session-form-view mx-auto w-100" style="max-width: 600px;">
        <div class="card p-3 mb-3" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
            <RoomSessionForm ref="roomSessionFormRef" :initial-data="initialData" />
            <div class="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                <BaseButton variant="outline-primary" @click="onCancel">Cancel</BaseButton>
                <BaseButton type="submit" @click="handleSubmit" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isSubmitting ? 'Saving...' : 'Save Session' }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoomStore } from '@/stores/rooms/room';
import RoomSessionForm from '@/components/forms/rooms/RoomSessionForm.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
    initialData: Object
});

const emit = defineEmits(['close']);

const roomStore = useRoomStore();
const roomSessionFormRef = ref(null);
const isSubmitting = ref(false);

const onCancel = () => {
    emit('close');
};

const handleSubmit = async () => {
    const formRef = roomSessionFormRef.value;
    if (!formRef) return;

    const payload = await formRef.validateForm();
    if (!payload) return;

    isSubmitting.value = true;
    try {
        let apiResult = null;
        if (props.initialData) {
            const updatePayload = { status: payload.status };
            apiResult = await roomStore.updateRoomSession(props.initialData.id, updatePayload);
        } else {
            apiResult = await roomStore.createRoomSession(payload);
        }

        if (apiResult !== false) {
            if (formRef.resetForm) formRef.resetForm();
            emit('close');
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>
