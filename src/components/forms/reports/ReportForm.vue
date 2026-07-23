<template>
    <form>
        <div class="mb-3">
            <BaseInput label="Report Title" type="textarea" :rows="1" placeholder="Enter report title" v-model="title"
                :error="errors.title" :maxlength="50" required/>
        </div>

        <div class="mb-3">
            <BaseInput :rows="4" label="Description" placeholder="Enter report description" v-model="description" type="textarea"
                :error="errors.description" :maxlength="256" required>
            </BaseInput>
        </div>

        <div class="mb-3">
            <BaseSelect label="Report Category" placeholder="Select Category" :options="categories" v-model="categoryId"
                :error="errors.categoryId" :loading="reportCategoryStore.isLoading || isLoadingMoreCategories"
                @load-more="onLoadMoreCategories" required>
            </BaseSelect>
        </div>

        <div class="mb-3">
            <BaseSelect label="Report Target" placeholder="Select Target" :options="targetOptions" v-model="target" required>
            </BaseSelect>
        </div>

        <div class="mb-3">
            <label class="form-label">Report Images</label>
            <BaseFileUpload v-model="images" :maxFiles="1" :maxFileSize="5000000" :isLoading="isLoading" />
        </div>
    </form>
</template>

<script setup>
import { useReportCategoryStore } from '@/stores/reports/reportCategory';
import { onMounted, ref, computed, watch } from 'vue';

import { useForm, useField } from 'vee-validate';
import { reportSchemas } from '@/utils/validations';

const reportCategoryStore = useReportCategoryStore();

const categories = computed(() => {
    return reportCategoryStore.reportCategories.map(c => ({ label: c.name, value: c.id }));
});

const isLoadingMoreCategories = ref(false);

const targetOptions = ref([
    { label: 'My Kudi', value: 'kudi' },
    { label: 'Super Admin', value: 'super_admin' }
]);
const target = ref('kudi');

const onLoadMoreCategories = async () => {
    if (isLoadingMoreCategories.value || reportCategoryStore.isLoading || reportCategoryStore.page >= (reportCategoryStore.totalPages || 1)) return;
    isLoadingMoreCategories.value = true;
    reportCategoryStore.page++;
    await reportCategoryStore.getAllReportCategories({ append: true });
    isLoadingMoreCategories.value = false;
};

onMounted(async () => {
    if (reportCategoryStore.reportCategories.length === 0) {
        reportCategoryStore.page = 1;
        await reportCategoryStore.getAllReportCategories();
    }
});

const props = defineProps({
    initialData: Object,
    isLoading: { type: Boolean, default: false }
});

const { validate, setValues, errors, resetForm } = useForm({
    validationSchema: reportSchemas.create,
    initialValues: {
        title: '',
        description: '',
        categoryId: null,
        images: []
    }
});

const { value: title } = useField('title');
const { value: description } = useField('description');
const { value: categoryId } = useField('categoryId');
const { value: images } = useField('images');

const initForm = () => {
    if (props.initialData) {
        setValues({
            title: props.initialData.title || '',
            description: props.initialData.content || props.initialData.description || '',
            categoryId: props.initialData.category?.id || null,
            images: props.initialData.images ? [...props.initialData.images] : [],
        });
        target.value = props.initialData.kut_id ? 'kudi' : 'super_admin';
        return;
    }
    resetForm();
    target.value = 'kudi';
};

const validateForm = async () => {
    const { valid } = await validate();
    if (valid) {
        return {
            title: title.value.trim(),
            description: description.value.trim(),
            category_id: categoryId.value,
            images: images.value,
            target: target.value
        };
    }
    return false;
};

watch(() => props.initialData, () => {
    initForm();
}, { immediate: true });

defineExpose({
    initForm,
    validateForm
});
</script>
