<template>
    <div>
        <div>
            <label class="form-label d-block mb-3">
                Enter 6-digit OTP Code
                <span style="color: var(--danger-color)">*</span>
            </label>
            <div class="d-flex justify-content-center">
                <InputOtp integerOnly label="Enter 6-digit OTP Code" v-model="otpCode" :length="6"
                    :invalid="!!errors.otpCode" class="gap-1 gap-md-2 gap-xl-3" />
            </div>
            <div v-if="errors.otpCode" class="text-danger mt-2 text-center small">{{ errors.otpCode }}</div>
        </div>
    </div>
</template>

<script setup>
import { useForm, useField } from 'vee-validate';
import { authSchemas } from '@/utils/validations';
import InputOtp from 'primevue/inputotp';

const { validate, errors } = useForm({
    validationSchema: authSchemas.otp,
    initialValues: { otpCode: '' }
});

const { value: otpCode } = useField('otpCode');

const validateForm = async () => {
    const { valid } = await validate();
    return valid ? otpCode.value : false;
};

defineExpose({ validateForm })
</script>

<style scoped>
:deep(.p-inputotp-input) {
    width: 100%;
    height: 60px;
    font-size: 1.25rem;
    text-align: center;
    border-radius: var(--border-inner-radius);
    border: var(--border-width) solid var(--border-clr);
    background-color: transparent;
    color: var(--text-heading-color);
    box-shadow: none;
}

:deep(.p-inputotp-input:hover) {
    border-color: var(--border-hover-color);
}

:deep(.p-inputotp-input:focus) {
    border-color: var(--primary-color);
}
</style>