<template>
    <form class="card p-3" style="background-color: var(--body-bg-color);">
        <div class="mb-3">
            <BaseSelect v-model="roomId" :disabled="disabled" :options="roomOptions" label="Room Name"
                placeholder="Select room" :error="errors.roomId" required />
        </div>
        <div class="mb-3 d-flex w-100 gap-3">
            <BaseDatePicker class="flex-grow-1" :disabled="disabled" v-model="date" label="Date" :error="errors.date" required />
            <BaseSelect class="flex-grow-1" :disabled="disabled" v-model="session"
                :options="roomStore.roomSessionTypes" label="Session" placeholder="Choose Session" :error="errors.session" required />
        </div>
        <div class="mb-3">
            <BaseSelect v-model="status" :options="roomStore.roomAvailabilityTypes" label="Status"
                placeholder="Select Status" :error="errors.status" required />
        </div>
        <div>
            <BaseInput type="textarea" :rows="2" :disabled="disabled" label="Note" placeholder="For scholarship student"
                v-model="note" :error="errors.note" />
        </div>
    </form>
</template>

<script setup>
import { useRoomStore } from '@/stores/rooms/room';
import { onMounted, ref, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { roomSchemas } from '@/utils/validations';

const roomStore = useRoomStore();
const roomOptions = ref([]);
const disabled = ref(false);

onMounted(async () => {
    await roomStore.getAllRooms();
    await roomStore.getAllRoomSessionType();
    await roomStore.getAllRoomAvailabilityType();
    roomOptions.value = roomStore.rooms.map(r => ({ label: r.name, value: r.id }));
});

const props = defineProps({
    initialData: Object
});

const { validate, setValues, errors, resetForm } = useForm({
    validationSchema: roomSchemas.session,
    initialValues: {
        roomId: null,
        date: "",
        session: "",
        status: "",
        note: ""
    }
});

const { value: roomId } = useField('roomId');
const { value: date } = useField('date');
const { value: session } = useField('session');
const { value: status } = useField('status');
const { value: note } = useField('note');

const initForm = () => {
    if (props.initialData) {
        disabled.value = true;
        setValues({
            roomId: props.initialData.room.id,
            date: props.initialData.date,
            session: props.initialData.session,
            status: props.initialData.status,
            note: props.initialData.note || ''
        });
    } else {
        disabled.value = false;
        resetForm();
    }
};

const validateForm = async () => {
    const { valid } = await validate();
    if (valid) {
        return {
            roomId: roomId.value,
            date: date.value,
            session: session.value,
            status: status.value,
            note: note.value || ''
        };
    }
    return false;
};

watch(() => props.initialData, () => {
    initForm();
}, { deep: true, immediate: true });

defineExpose({ validateForm, initForm, resetForm });
</script>