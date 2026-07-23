<template>
    <div class="card gap-2 mx-auto" style="background-color: var(--surface-ground);max-width: 600px; width: 100%;">
        <div class="card-body p-0" style="background-color: var(--body-bg-color);">
            <UserForm ref="userFormRef" />
        </div>
        <div class="card-footer py-3 d-flex align-items-center gap-2"
            style="background-color: var(--body-bg-color);">
            <BaseButton variant="outline-primary" class="flex-fill" label="Cancel" @click="onCancel()" />
            <BaseButton :isLoading="isLoading" class="flex-fill" label="Save" @click="handleSubmit()">
                {{ isLoading ? 'Creating...' : 'Create' }}
            </BaseButton>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import UserForm from '@/components/forms/users/UserForm.vue';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';

const emit = defineEmits(['close']);
const userStore = useUserStore();
const toastStore = useToastStore();
const userFormRef = ref(null);
const isLoading = ref(false);

const onCancel = () => {
    emit('close');
};

const handleSubmit = async () => {
    const formRef = userFormRef.value;
    if (!formRef) return;

    const payload = await formRef.validateForm();
    if (!payload) return;

    isLoading.value = true;
    const apiResult = ref(null);

    if (payload.mode === 'bulk') {
        apiResult.value = await userStore.bulkRegister({
            roleId: payload.roleId,
            users: payload.users
        });
    } else {
        const { mode, ...userData } = payload;
        apiResult.value = await userStore.createUser(userData);
    }

    isLoading.value = false;

    if (apiResult.value !== false) {
        if (userFormRef.value && typeof userFormRef.value.initForm === 'function') {
            userFormRef.value.initForm();
        }
        emit('close');
    }

    await userStore.getAllUsers({ showLoading: true });
    userStore.fetchRoleStats();
};
</script>
