<template>
    <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-10" style="max-width: 500px; width: 100%;">
            <div class="card gap-2" style="background-color: var(--surface-ground);">
                <div class="card-body p-3" style="background-color: var(--body-bg-color);">
                    <CategoryForm ref="reportCategoryFormRef" :initial-data="initialData" />
                </div>
                <div class="card-footer py-3 d-flex align-items-center gap-2"
                    style="background-color: var(--body-bg-color);">
                    <BaseButton variant="outline-primary" class="flex-fill" label="Cancel" @click="onCancel()" />
                    <BaseButton :isLoading="isLoading" class="flex-fill" label="Save" @click="handleSubmit()">
                        {{ isEdit ?
                            (isLoading ? 'Updating...' : 'Update') :
                            (isLoading ? 'Creating...' : 'Create')
                        }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CategoryForm from '@/components/forms/reports/CategoryForm.vue';
import { useReportCategoryStore } from '@/stores/reports/reportCategory';

const props = defineProps({
    initialData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close']);
const reportCategoryStore = useReportCategoryStore();
const reportCategoryFormRef = ref(null);
const isLoading = ref(false);

const isEdit = computed(() => !!props.initialData);

const onCancel = () => {
    emit('close');
};

const handleSubmit = async () => {
    const formRef = reportCategoryFormRef.value;
    if (!formRef) return;

    const payload = await formRef.validateForm();
    if (!payload) return;

    isLoading.value = true;
    const apiResult = ref(null);

    if (isEdit.value) {
        apiResult.value = await reportCategoryStore.updateReportCategory(props.initialData.id, payload);
    } else {
        apiResult.value = await reportCategoryStore.createReportCategory(payload);
    }

    isLoading.value = false;

    if (apiResult.value !== false) {
        if (reportCategoryFormRef.value && typeof reportCategoryFormRef.value.initForm === 'function') {
            reportCategoryFormRef.value.initForm();
        }
        reportCategoryStore.page = 1;
        await reportCategoryStore.getAllReportCategories({ forceRefresh: true });
        emit('close');
    }
};
</script>
