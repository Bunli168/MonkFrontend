<template>
    <form class="card p-3" style="background-color: var(--body-bg-color);">
        <div class="mb-3">
            <BaseInput type="text" label="Room name" placeholder="Room 201" v-model="name" :error="errors.name" required />
        </div>
        <div class="mb-3">
            <BaseInput type="text" label="Room code" placeholder="R201" v-model="code" :error="errors.code" required />
        </div>
        <div class="mb-3">
            <BaseInput type="text" label="Building" placeholder="Front building" v-model="building"
                :error="errors.building" />
        </div>
        <div class="mb-3">
            <BaseInput type="number" label="Floor" placeholder="Floor 1" v-model="floor" :error="errors.floor" />
        </div>
        <div class="mb-3">
            <BaseInput type="number" label="Capacity" placeholder="20" v-model="capacity" :error="errors.capacity" required />
        </div>
        <div class="mb-3">
            <BaseSelect v-model="type" :options="roomStore.roomTypes" label="Room Type" placeholder="Select type"
                :error="errors.type" required />
        </div>
        <div class="mb-3">
            <BaseInput type="text" label="Description" placeholder="For scholarship student" v-model="description"
                :error="errors.description" />
        </div>
        <div>
            <BaseInput type="text" label="Facilities" placeholder="TV, AC, Whiteboard" v-model="facilities"
                :error="errors.facilities" />
        </div>
    </form>
</template>

<script setup>
import { useRoomStore } from '@/stores/rooms/room';
import { ref, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { roomSchemas } from '@/utils/validations';

const roomStore = useRoomStore();

const props = defineProps({
    initialData: Object
});

const { validate, setValues, errors, resetForm } = useForm({
    validationSchema: roomSchemas.room,
    initialValues: {
        name: "",
        code: "",
        building: "",
        floor: null,
        capacity: null,
        type: '',
        description: "",
        facilities: ""
    }
});

const { value: name } = useField('name');
const { value: code } = useField('code');
const { value: building } = useField('building');
const { value: floor } = useField('floor');
const { value: capacity } = useField('capacity');
const { value: type } = useField('type');
const { value: description } = useField('description');
const { value: facilities } = useField('facilities');

const initForm = () => {
    if (props.initialData) {
        setValues({
            name: props.initialData.name || '',
            code: props.initialData.code || '',
            building: props.initialData.building || '',
            floor: props.initialData.floor || null,
            capacity: props.initialData.capacity || null,
            type: props.initialData?.type || '',
            description: props.initialData.description || '',
            facilities: props.initialData.facilities || ''
        });
    } else {
        resetForm();
    }
};

const validateForm = async () => {
    const { valid } = await validate();
    if (valid) {
        return {
            name: name.value.trim(),
            code: code.value.trim(),
            building: building.value.trim(),
            floor: floor.value ? Number(floor.value) : null,
            capacity: capacity.value ? Number(capacity.value) : null,
            type: type.value,
            description: description.value.trim(),
            facilities: facilities.value.trim(),
            isActive: props.initialData ? props.initialData.isActive : true
        };
    }
    return false;
};

watch(() => props.initialData, () => {
    initForm();
}, { deep: true, immediate: true });

defineExpose({ validateForm, initForm });
</script>