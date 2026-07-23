<template>
    <div>
        <div class="mb-3">
            <BaseInput required label="New Password" type="password" v-model="password" :error="errors.password"
                placeholder="Min 6 chars, uppercase, lowercase, number, special char" />
        </div>
        <div>
            <BaseInput required label="Confirm Password" type="password" v-model="confirmPassword" :error="errors.confirmPassword"
                placeholder="Re-enter your new password" />
        </div>
    </div>
</template>

<script setup>
import { useForm, useField } from 'vee-validate';
import { authSchemas } from '@/utils/validations';

const { validate, errors } = useForm({
    validationSchema: authSchemas.changePassword,
    initialValues: { password: '', confirmPassword: '' }
});

const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');

const validateForm = async () => {
    const { valid } = await validate();
    return valid ? { password: password.value, confirmPassword: confirmPassword.value } : false;
};

defineExpose({ validateForm })

</script>