<template>
    <form @submit.prevent="onSubmit" id="login-form" novalidate>
        <div class="mb-3">
            <BaseInput required type="email" label="Email" v-model="email" :error="errors.email" placeholder="Enter your email" />
        </div>
        <div>
            <BaseInput required type="password" label="Password" v-model="password" :error="errors.password" placeholder="Enter your password" />
        </div>
    </form>
</template>

<script setup>
import { useForm, useField } from 'vee-validate';
import { authSchemas } from '@/utils/validations';

const emit = defineEmits(['submit']);

const { handleSubmit, errors, setFieldValue } = useForm({
    validationSchema: authSchemas.login,
    initialValues: {
        email: '',
        password: ''
    }
});

const { value: email } = useField('email');
const { value: password } = useField('password');

const onSubmit = handleSubmit((values) => {
    emit('submit', values);
});

defineExpose({ setFieldValue });
</script>