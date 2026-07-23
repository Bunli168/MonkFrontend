<template>
    <form @submit.prevent>
        <div class="mb-3">
            <BaseInput label="Category Name" type="text" placeholder="Enter category name" v-model="name"
                :error="errors.name" required/>
        </div>

        <div>
            <BaseInput label="Description" type="textarea" :rows="4" placeholder="Enter category description"
                v-model="description" :error="errors.description">
            </BaseInput>
        </div>
    </form>
</template>

<script setup>
import { watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { reportSchemas } from '@/utils/validations';

const props = defineProps({
    initialData: Object
});

const { validate, setValues, errors, resetForm } = useForm({
    validationSchema: reportSchemas.category,
    initialValues: {
        name: '',
        description: ''
    }
});

const { value: name } = useField('name');
const { value: description } = useField('description');

const initForm = () => {
    if (props.initialData) {
        setValues({
            name: props.initialData.name || '',
            description: props.initialData.description || '',
        });
        return;
    }
    resetForm();
};

const validateForm = async () => {
    const { valid } = await validate();
    if (valid) {
        return {
            name: name.value.trim(),
            description: description.value.trim()
        };
    }
    return false;
};

watch(() => props.initialData, () => {
    initForm();
}, { deep: true, immediate: true });

defineExpose({ validateForm, initForm });
</script>