<template>
    <form class="card p-3" style="background-color: var(--body-bg-color);">
        <div class="mb-3" v-if="!initialData && authStore.isSuperAdmin">
            <BaseSelectButton v-model="creationMode" :options="modeOptions" />
        </div>

        <div v-if="creationMode === 'email'">
            <div class="mb-3">
                <BaseInput type="text" placeholder="example@gmail.com" :disabled="initialData ? true : false" label="Email *"
                    v-model="email" :error="errors.email" required />
            </div>
            <div class="mb-3">
                <BaseSelect :disabled="initialData ? true : false" v-model="roleId" :options="roles"
                    label="User Role" placeholder="Select Role" required :error="errors.roleId" />
            </div>
            <div class="mb-3" v-if="authStore.isSuperAdmin">
                <BaseSelect v-model="kut_id" :options="kutsOptions"
                    label="Kudi *" placeholder="Select Kudi" required :error="errors.kut_id" />
            </div>

        </div>

        <div v-else>
            <div class="row g-3 mb-3">
                <div class="col-sm-6 mb-3 mb-sm-0">
                    <BaseInput type="text" placeholder="Bunli" label="First Name *" v-model="firstName" :maxlength="30" :error="errors.firstName" required />
                </div>
                <div class="col-sm-6">
                    <BaseInput type="text" placeholder="Phi" label="Last Name *" v-model="lastName" :maxlength="30" :error="errors.lastName" required />
                </div>
            </div>
            <div class="mb-3">
                <BaseSelect v-model="roleId" :options="autoRoles"
                    label="User Role *" placeholder="Select Role" required :error="errors.roleId" />
            </div>
            <div class="mb-3" v-if="authStore.isSuperAdmin">
                <BaseSelect v-model="kut_id" :options="kutsOptions"
                    label="Kudi *" placeholder="Select Kudi" required :error="errors.kut_id" />
            </div>

        </div>
    </form>
</template>

<script setup>
import { useUserStore } from '@/stores/users/user';
import { ref, watch, computed, onMounted } from 'vue';
import { useForm, useField } from 'vee-validate';
import { userSchemas } from '@/utils/validations';
import api from '@/api/api';

import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const userStore = useUserStore();

const kuts = ref([]);
const kutsOptions = computed(() => kuts.value.map(k => ({ label: k.name, value: k.id })));

const { value: kut_id } = useField('kut_id');

const fetchKuts = async () => {
    try {
        const response = await api.get('/kuts');
        const data = response.data?.data || response.data || [];
        kuts.value = data.slice().sort((a, b) => {
            const aNum = parseFloat(a.name);
            const bNum = parseFloat(b.name);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return (a.name || '').localeCompare(b.name || '');
        });
    } catch (error) {
        console.error('Error fetching kuts:', error);
    }
};



onMounted(() => {
    if (authStore.isSuperAdmin) {
        fetchKuts();
    }
});


const roleKhmerTranslations = {
    'SuperAdmin': 'អ្នកគ្រប់គ្រងកំពូល (SuperAdmin)',
    'Admin': 'មេកុដិ (Admin)',
    'Monk': 'សាមណេរ (Samanera)',
    'Student': 'សិស្ស/និស្សិត (Student)',
    'AttendanceTaker': 'អ្នកស្រង់អវត្តមាន (Attendance Taker)',
    'Bhikkhu': 'ភិក្ខុ (Bhikkhu)'
};

const getRoleLabel = (r) => {
    return roleKhmerTranslations[r.name] || (r.description ? `${r.name} (${r.description.split('—')[0].trim()})` : r.name);
};

const roles = computed(() => {
    let availableRoles = userStore.userRoles;
    
    if (!authStore.isSuperAdmin) {
        // Admins and non-admins can only create Monk (3), Student (4), or Bhikkhu (7)
        availableRoles = availableRoles.filter(r => r.id === 3 || r.id === 4 || r.id === 7);
    }
    
    const roleOrder = ['SuperAdmin', 'Admin', 'Bhikkhu', 'Monk', 'Student', 'AttendanceTaker'];
    availableRoles = availableRoles.slice().sort((a, b) => {
        let indexA = roleOrder.indexOf(a.name);
        let indexB = roleOrder.indexOf(b.name);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
    });

    return availableRoles.map(r => ({ 
        label: getRoleLabel(r), 
        value: r.id 
    }));
});

const autoRoles = computed(() => {
    let availableRoles = userStore.userRoles;
    
    if (!authStore.isSuperAdmin) {
        // Admins can only auto-generate Monk (3), Student (4), Bhikkhu (7)
        availableRoles = availableRoles.filter(r => r.id === 3 || r.id === 4 || r.id === 7);
    } else {
        // SuperAdmin cannot be auto-generated (must use Custom Email)
        availableRoles = availableRoles.filter(r => r.id !== 1 && r.name !== 'SuperAdmin');
    }
    
    const roleOrder = ['SuperAdmin', 'Admin', 'Bhikkhu', 'Monk', 'Student', 'AttendanceTaker'];
    availableRoles = availableRoles.slice().sort((a, b) => {
        let indexA = roleOrder.indexOf(a.name);
        let indexB = roleOrder.indexOf(b.name);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
    });

    return availableRoles.map(r => ({ 
        label: getRoleLabel(r), 
        value: r.id 
    }));
});

const creationMode = ref(authStore.isSuperAdmin ? 'email' : 'auto');
const modeOptions = computed(() => {
    if (authStore.isSuperAdmin) {
        return [
            { label: 'Custom Email', value: 'email' },
            { label: 'Auto Generate', value: 'auto' }
        ];
    }
    return [
        { label: 'Auto Generate', value: 'auto' }
    ];
});

const props = defineProps({
    initialData: Object
});

const dynamicSchema = computed(() => creationMode.value === 'email' ? userSchemas.create : userSchemas.createAuto);

const { validate, setValues, errors, resetForm } = useForm({
    validationSchema: dynamicSchema,
    initialValues: {
        email: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        pob: "",
        roleId: 3,
        kut_id: null,
        seating_row_id: null,
        seat_number: null
    }
});

const { value: email } = useField('email');
const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: dob } = useField('dob');
const { value: gender } = useField('gender');
const { value: pob } = useField('pob');
const { value: roleId } = useField('roleId');
const { value: seating_row_id } = useField('seating_row_id');
const { value: seat_number } = useField('seat_number');

watch(creationMode, (newMode) => {
    resetForm({
        values: {
            email: "",
            firstName: "",
            lastName: "",
            dob: "",
            gender: "Male",
            pob: "",
            roleId: newMode === 'auto' ? 3 : 3,
            kut_id: null,
            seating_row_id: null,
            seat_number: null
        }
    });
});

const initForm = () => {
    if (props.initialData) {
        setValues({
            email: props.initialData.email || '',
            firstName: '',
            lastName: '',
            dob: '',
            gender: 'Male',
            pob: '',
            roleId: props.initialData?.role?.id || 3,
            kut_id: authStore.user?.profile?.kut_id || 1,
            seating_row_id: props.initialData?.seating_row_id || props.initialData?.profile?.seating_row_id || null,
            seat_number: props.initialData?.seat_number || props.initialData?.profile?.seat_number || null
        });
    } else {
        creationMode.value = authStore.isSuperAdmin ? 'email' : 'auto';
        resetForm();
    }
};

const validateForm = async () => {
    const { valid } = await validate();
    if (valid) {
        if (creationMode.value === 'email') {
            return {
                mode: 'single',
                email: email.value.trim(),
                roleId: Number(roleId.value),
                kut_id: kut_id.value ? Number(kut_id.value) : null,
                seating_row_id: seating_row_id.value ? Number(seating_row_id.value) : null,
                seat_number: seat_number.value ? Number(seat_number.value) : null
            };
        } else {
            return {
                mode: 'bulk',
                roleId: Number(roleId.value),
                users: [
                    { 
                        name: `${firstName.value.trim()} ${lastName.value.trim()}`.trim(),
                        dob: dob.value,
                        gender: gender.value,
                        pob: pob.value.trim(),
                        kut_id: kut_id.value ? Number(kut_id.value) : null,
                        seating_row_id: seating_row_id.value ? Number(seating_row_id.value) : null,
                        seat_number: seat_number.value ? Number(seat_number.value) : null
                    }
                ]
            };
        }
    }
    return false;
};

watch(() => props.initialData, () => {
    initForm();
}, { deep: true, immediate: true });

defineExpose({ validateForm, initForm });
</script>