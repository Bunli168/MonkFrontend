<template>
    <div style="background-color: var(--surface-ground);">
        <div class="mb-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 w-100">
            <!-- Left Side: Filters -->
            <div class="d-flex align-items-center w-100 w-lg-auto">
                <BaseFilter v-model="activeFilter" :options="filterOptions" :wrap="true" />
            </div>
            
            <!-- Right Side: Search, Status, Buttons -->
            <div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 justify-content-end w-100 w-lg-auto">
                <div class="search-input w-100">
                    <BaseInput 
                        v-model="searchQuery" 
                        placeholder="Search users..." 
                        :prefixIcon="Search"
                        clearable
                    />
                </div>
                
                <div class="d-flex gap-2 w-100 w-md-auto">
                    <div class="status-select flex-grow-1">
                        <BaseSelect 
                            v-model="filters.isActive" 
                            :options="statusOptions"
                            placeholder="Status"
                        >
                            <template #value="slotProps">
                                <BaseBadge v-if="slotProps.value === true" status="ACTIVE" pill size="sm" />
                                <BaseBadge v-else-if="slotProps.value === false" status="INACTIVE" pill size="sm" />
                                <span v-else class="text-muted">Status</span>
                            </template>
                            <template #option="slotProps">
                                <BaseBadge v-if="slotProps.option.value === true" status="ACTIVE" pill size="sm" />
                                <BaseBadge v-else-if="slotProps.option.value === false" status="INACTIVE" pill size="sm" />
                                <span v-else>{{ slotProps.option.label }}</span>
                            </template>
                        </BaseSelect>
                    </div>
                
                    <div class="kut-select flex-grow-1" v-if="authStore.isSuperAdmin">
                        <BaseSelect 
                            v-model="filters.kutId" 
                            :options="kutOptions"
                            placeholder="Kudi / កុដិ"
                        />
                    </div>
                </div>
                
                <div class="d-flex gap-2 w-100 w-md-auto">
                    <input type="file" accept=".csv" ref="csvInputRef" @change="onFileSelected" style="display: none;" />
                    <BaseButton :disabled="userStore.isLoading" @click="triggerFileInput" variant="outline-primary"
                        class="btn d-flex align-items-center justify-content-center px-3 flex-shrink-0" v-tooltip="'Import CSV'">
                        <FileDown class="text-success" :size="16" />
                    </BaseButton>
                    <BaseButton :disabled="userStore.isLoading" @click="$emit('new')"
                        class="btn btn-primary text-nowrap d-flex align-items-center justify-content-center px-4 flex-grow-1">
                        Add New User
                    </BaseButton>
                </div>
            </div>
        </div>
        <BaseTable :columns="colDefs" :rows="userStore.users" :loading="userStore.isLoading"
            :total-records="userStore.totalItems" v-model:page="userStore.page" v-model:per-page="userStore.perPage"
            v-model:sort-by="userStore.sortBy" v-model:sort-order="userStore.sortOrder"
            @refresh-data="userStore.getAllUsers"
            :rowClass="getUserRowClass">

            <template #username="{ data }">
                <div class="d-flex align-items-center gap-3">
                    <div>
                    <div class="user-profile-avatar d-flex align-items-center justify-content-center text-muted"
                        style="border-radius: 50%;">
                        <img v-if="data?.profile?.avatarUrl" :src="$authImg(data.profile.avatarUrl)" class="img-fluid"
                            style="border-radius: 50%;">
                        <User v-else :size="20" />
                    </div>
                    </div>
                    <div class="d-flex flex-column align-items-start" style="min-width: 0;">
                        <span class="fw-medium truncate-1-line" :title="data?.firstName + ' ' + data?.lastName">{{ data?.firstName + " " + data?.lastName }}</span>
                    </div>
                </div>
            </template>

            <template #email="{ data }">
                <span :class="[`text-${getRoleVariant(data?.role?.id)}`]" class="truncate-1-line" :title="data?.email">
                    {{ data?.email }}
                </span>
            </template>

            <template #kut="{ data }">
                <span>{{ data?.profile?.kut?.name || data?.profile?.kut?.number || '-' }}</span>
            </template>

            <template #rowAndSeat="{ data }">
                <span v-if="data?.profile?.seatingRowId || data?.profile?.seating_row_id">
                    Row {{ data?.profile?.seatingRow?.row_num || data?.profile?.seatingRowId || data?.profile?.seating_row_id }} 
                    <span v-if="data?.profile?.seatNumber || data?.profile?.seat_number">
                        (Seat {{ data?.profile?.seatNumber || data?.profile?.seat_number }})
                    </span>
                </span>
                <span v-else class="text-muted">-</span>
            </template>

            <template #role="{ data }">
                <BaseBadge 
                    v-if="data?.role"
                    :variant="getRoleVariant(data.role.id)" 
                    :label="getRoleLabel(data.role.id, data.role.name)" 
                    :icon="getRoleIcon(data.role.id)" 
                    pill 
                    size="sm" 
                />
            </template>

            <template #createdAt="{ data }">
                <span v-if="data?.createdAt">{{ formatDate(data.createdAt) }}</span>
            </template>
            <template #isActive="{ data }">
                <BaseBadge 
                    :status="data?.isActive ? 'ACTIVE' : 'INACTIVE'" 
                    pill 
                    size="sm" 
                    :loading="targetStatusUser?.id === data.id && isUpdatingStatus"
                />
            </template>

            <template #dob="{ data }">
                <span>{{ data?.dob || '-' }}</span>
            </template>
            <template #gender="{ data }">
                <span>{{ data?.gender || '-' }}</span>
            </template>
            <template #pob="{ data }">
                <span>{{ data?.pob || '-' }}</span>
            </template>
            <template #phone="{ data }">
                <span>{{ data?.UserProfile?.phone_number || data?.profile?.phone || '-' }}</span>
            </template>
            <template #school="{ data }">
                <span>{{ data?.UserProfile?.university_name || data?.profile?.university_name || '-' }}</span>
            </template>
            <template #year="{ data }">
                <span>{{ getYearLabel(data?.UserProfile?.university_year || data?.profile?.university_year) }}</span>
            </template>

            <template #action="{ data }">
                <BaseActionMenu :items="getActionItems(data)" />
            </template>
        </BaseTable>
    </div>

    <BaseDrawer v-model="showUserDetail" title="Details" width="30rem">
        <UserDetailView v-if="showUserDetail" :user="userDetail" />
    </BaseDrawer>

    <BaseModal v-model="showResetModal" title="Reset Password" size="sm">
        <div class="text-center">
            <p class="mb-4 fw-medium text-muted">Are you sure you want to reset this user's password?</p>
            <div class="d-flex gap-2">
                <BaseButton variant="outline-warning" type="button" class="flex-grow-1"
                    @click="cancelResetPassword()">
                    Cancel
                </BaseButton>
                <BaseButton variant="warning" type="button" class="flex-grow-1" @click="confirmResetPassword()" :isLoading="isReseting">
                    {{ isReseting ? 'Reseting...' : 'Reset Now' }}
                </BaseButton>
            </div>
        </div>
    </BaseModal>

    <BaseModal v-model="showStatusModal" :title="targetStatusUser?.isActive ? 'Deactivate User' : 'Activate User'" size="sm">
        <div class="text-center">
            <div class="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" 
                 :class="targetStatusUser?.isActive ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'" 
                 style="width: 60px; height: 60px;">
                <X v-if="targetStatusUser?.isActive" :size="28" />
                <Check v-else :size="28" />
            </div>
            <p class="mb-4 fw-medium text-muted">
                Are you sure you want to {{ targetStatusUser?.isActive ? 'deactivate' : 'activate' }}
                <strong class="text-base">{{ targetStatusUser?.firstName }} {{ targetStatusUser?.lastName }}</strong>?
            </p>
            <div class="d-flex gap-2">
                <BaseButton :variant="targetStatusUser?.isActive ? 'outline-danger' : 'outline-success'" type="button" class="flex-grow-1"
                    @click="showStatusModal = false">
                    Cancel
                </BaseButton>
                <BaseButton :variant="targetStatusUser?.isActive ? 'danger' : 'success'" type="button" class="flex-grow-1" 
                    @click="confirmStatusChange()" :is-Loading="isUpdatingStatus">
                    {{ isUpdatingStatus ? 'Updating...' : (targetStatusUser?.isActive ? 'Deactivate Now' : 'Activate Now') }}
                </BaseButton>
            </div>
        </div>
    </BaseModal>

    <BaseModal v-model="showChangeRoleModal" title="Change Role" size="sm">
        <div class="text-center">
            <div class="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info" 
                 style="width: 60px; height: 60px;">
                <User :size="28" />
            </div>
            <p class="mb-3 fw-medium text-muted">
                Select a new role for <strong class="text-base">{{ targetChangeRoleUser?.first_name }} {{ targetChangeRoleUser?.last_name }}</strong>:
            </p>
            <div class="mb-4 text-start">
                <BaseSelect 
                    v-model="targetChangeRoleId" 
                    :options="roleChangeOptions"
                    placeholder="Select Role"
                    class="w-100"
                />
            </div>
            <div class="d-flex gap-2">
                <BaseButton variant="outline-secondary" type="button" class="flex-grow-1"
                    @click="showChangeRoleModal = false">
                    Cancel
                </BaseButton>
                <BaseButton variant="info" type="button" class="flex-grow-1 text-white" 
                    @click="confirmChangeRole()" :is-Loading="isChangingRole">
                    {{ isChangingRole ? 'Updating...' : 'Change Now' }}
                </BaseButton>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
const emit = defineEmits(['new', 'edit', 'import', 'preview-bulk']);
import { useUserStore } from '@/stores/users/user.js';
import { onMounted, ref, computed, watch } from 'vue';
import { formatDate } from '@/utils/dateFormat';
import { BadgeCheck, Info, User, KeyRound, Search, FileDown, Check, X, BookOpen, GraduationCap, QrCode } from '@lucide/vue';
import UserDetailView from './UserDetailView.vue';
import { useAuthStore } from '@/stores/auth.js';
import { useToastStore } from '@/stores/toast.js';
import { useUserList } from '@/composables/users/useUserList.js';
import Papa from 'papaparse';

import api from '@/api/api.js';

const userStore = useUserStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const {
    showResetModal,
    showUserDetail,
    userDetail,
    isLoading,
    onViewDetail,
    onResetPassword,
    handleResetPassword,
    onCancelReset,
    searchAndFilter
} = useUserList(userStore, authStore, toastStore);

const searchQuery = searchAndFilter?.searchQuery || ref('');
const filters = searchAndFilter?.filters || ref({ roleId: null, isActive: null, kutId: null });

const activeFilter = computed({
    get: () => filters.value.roleId,
    set: (val) => {
        filters.value.roleId = val;
    }
});

const kuts = ref([]);
const kutOptions = computed(() => {
    const sortedKuts = [...kuts.value].sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.name.replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name);
    });
    return [
        { label: 'Kudi / កុដិទាំងអស់', value: null },
        ...sortedKuts.map(k => ({
            label: k.name,
            value: k.id
        }))
    ];
});

onMounted(async () => {
    try {
        const res = await api.get('/kuts');
        if (res.data?.success) {
            kuts.value = res.data.data;
        }
    } catch (error) {
        console.error("Failed to fetch kuts", error);
    }
});

const hasActiveFilters = computed(() => {
    return !!searchQuery.value || 
           filters.value.isActive !== null || 
           filters.value.roleId !== null ||
           filters.value.kutId !== null;
});

const resetFilters = () => {
    searchQuery.value = '';
    filters.value.isActive = null;
    filters.value.roleId = null;
    filters.value.kutId = null;
};

const csvInputRef = ref(null);

const triggerFileInput = () => {
    if (csvInputRef.value) {
        csvInputRef.value.click();
    }
};

const onFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toastStore.showToast('Only CSV files are allowed.', 'danger');
        e.target.value = '';
        return;
    }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            if (results.errors.length) {
                toastStore.showToast('Error parsing CSV file.', 'danger');
                e.target.value = '';
                return;
            }
            
            const khmerToEnglishDigits = (str) => {
                const map = {
                    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
                    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
                };
                return str.replace(/[០-៩]/g, m => map[m]);
            };

            const getKhmerMonthNumber = (monthStr) => {
                const months = {
                    'មករា': '01', 'កុម្ភៈ': '02', 'មីនា': '03', 'មេសា': '04',
                    'ឧសភា': '05', 'មិថុនា': '06', 'កក្កដា': '07', 'សីហា': '08',
                    'កញ្ញា': '09', 'តុលា': '10', 'វិច្ឆិកា': '11', 'ធ្នូ': '12'
                };
                for (const m in months) {
                    if (monthStr.includes(m)) return months[m];
                }
                return null;
            };

            const findVal = (row, keywords, excludeKeywords = []) => {
                const keys = Object.keys(row);
                for (const key of keys) {
                    const cleanKey = key.trim().toLowerCase();
                    
                    // Skip if key matches any exclusion keyword
                    let excluded = false;
                    for (const ex of excludeKeywords) {
                        if (cleanKey.includes(ex.toLowerCase())) {
                            excluded = true;
                            break;
                        }
                    }
                    if (excluded) continue;

                    for (const kw of keywords) {
                        if (cleanKey.includes(kw.toLowerCase())) {
                            return row[key];
                        }
                    }
                }
                return null;
            };

            const users = results.data
                .map(row => {
                    // 1. Parse Name
                    const nameVal = findVal(row, ['គោត្តនាម-នាម', 'full name', 'name', 'ឈ្មោះ']) || '';
                    let firstName = findVal(row, ['firstName', 'firstNameKh']) || '';
                    let lastName = findVal(row, ['lastName', 'lastNameKh']) || '';
                    
                    if (nameVal && !firstName && !lastName) {
                        const parts = String(nameVal).trim().split(/\s+/);
                        if (parts.length > 1) {
                            lastName = parts[0];
                            firstName = parts.slice(1).join(' ');
                        } else {
                            lastName = parts[0] || '';
                            firstName = '';
                        }
                    }

                    // 2. Parse Date of Birth
                    const rawDob = findVal(row, ['ថ្ងៃខែឆ្នាំកំណើត', 'date of birth', 'dob', 'កំណើត']) || '';
                    let dob = null;
                    if (rawDob) {
                        const cleanedDob = khmerToEnglishDigits(String(rawDob).trim());
                        const parts = cleanedDob.split(/[\s\.\-\/]+/);
                        if (parts.length === 3) {
                            let day = parts[0].padStart(2, '0');
                            let month = parts[1];
                            let year = parts[2];
                            
                            const khMonth = getKhmerMonthNumber(month);
                            if (khMonth) {
                                month = khMonth;
                            } else {
                                month = month.padStart(2, '0');
                            }

                            if (year.length === 2) {
                                year = parseInt(year, 10) > 50 ? '19' + year : '20' + year;
                            }
                            
                            if (year.length === 4 && !isNaN(day) && !isNaN(month)) {
                                dob = `${year}-${month}-${day}`;
                            }
                        }
                    }

                    // 3. Parse Other Fields
                    const chhaya_number = findVal(row, ['លេខឆាយា', 'เลขฉายา', 'លេខអត្តសញ្ញាណប័ណ្ណ', 'អត្តសញ្ញាណ', 'chhaya', 'ឆាយា', 'id number']) || '';
                    const phone_number = findVal(row, ['លេខទូរស័ព្ទ', 'phone', 'ទូរស័ព្ទ', 'ទូរសព្ទ']) || '';
                    const university_name = findVal(row, ['រៀននៅ', 'school', 'university', 'សាលា']) || '';
                    const university_year = findVal(row, ['ឆ្នាំទី', 'year'], ['កំណើត', 'birth']) || ''; // Exclude generic "birth/birthdate" keywords from year field

                    const commune = findVal(row, ['ឃុំ', 'commune']) || '';
                    const district = findVal(row, ['ស្រុក', 'district']) || '';
                    const province = findVal(row, ['ខេត្ត', 'province']) || '';
                    const from_wat = findVal(row, ['មកពីវត្ត', 'from_wat', 'wat', 'វត្ត']) || '';

                    return {
                        name: `${lastName} ${firstName}`.trim(),
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        dob,
                        chhaya_number: chhaya_number.trim(),
                        phone_number: phone_number.trim(),
                        university_name: university_name.trim(),
                        university_year: university_year.trim(),
                        from_wat: from_wat.trim(),
                        commune: commune.trim(),
                        district: district.trim(),
                        province: province.trim()
                    };
                })
                .filter(u => u.firstName && u.lastName);
            
            if (users.length === 0) {
                toastStore.showToast('No valid users containing name found in CSV.', 'danger');
                e.target.value = '';
                return;
            }

            userStore.parsedBulkUsers = users;
            emit('preview-bulk');
            e.target.value = '';
        },
        error: () => {
            toastStore.showToast('Error reading the file.', 'danger');
            e.target.value = '';
        }
    });
};

const filterOptions = computed(() => {
    const options = [
        { label: 'All Users', value: null, badge: userStore.roleStats['all'], variant: 'primary' },
        { label: 'មេកុដិ', value: 2, badge: userStore.roleStats[2], variant: 'success' },
        { label: 'ភិក្ខុ', value: 7, badge: userStore.roleStats[7], variant: 'warning' },
        { label: 'សាមណេរ', value: 3, badge: userStore.roleStats[3], variant: 'info' },
        { label: 'សិស្សនិស្សិត', value: 4, badge: userStore.roleStats[4], variant: 'secondary' }
    ];
    
    return options;
});

const roleChangeOptions = computed(() => {
    return [
        { label: 'មេកុដិ', value: 2 },
        { label: 'ភិក្ខុ', value: 7 },
        { label: 'សាមណេរ', value: 3 },
        { label: 'សិស្សនិស្សិត', value: 4 }
    ];
});

const statusOptions = ref([
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
]);

const getRoleLabel = (roleId, defaultName) => {
    switch(roleId) {
        case 1: return 'Super Admin';
        case 2: return 'មេកុដិ';
        case 7: return 'ភិក្ខុ';
        case 3: return 'សាមណេរ';
        case 4: return 'សិស្សនិស្សិត';
        default: return defaultName || '-';
    }
};

const getRoleVariant = (roleId) => {
    switch(roleId) {
        case 1: return 'danger'; // SuperAdmin
        case 2: return 'success'; // Admin/Mekudi
        case 7: return 'warning'; // Bhikkhu
        case 3: return 'info'; // Samaner
        case 4: return 'secondary'; // Student
        default: return 'secondary';
    }
};

const getRoleIcon = (roleId) => {
    switch(roleId) {
        case 1: return BadgeCheck;
        case 2: return BookOpen;
        case 3: return User;
        default: return User;
    }
};

const getUserRowClass = (data) => {
    return (data && data.id && data.isActive === false) ? 'row-border-secondary opacity-75' : '';
};

const isReseting = ref(false);

const toggleReset = (event, id) => {
    onResetPassword(id);
    showResetModal.value = true;
}

const getActionItems = (data) => {
    const items = [
        {
            label: 'View Details',
            icon: Info,
            command: () => onViewDetail(data),
        },
        {
            label: data.isActive ? 'Deactivate User' : 'Activate User',
            icon: data.isActive ? X : Check,
            command: () => promptToggleStatus(data),
            iconClass: data.isActive ? 'text-danger' : 'text-success'
        },
        {
            label: 'Reset Password',
            icon: KeyRound,
            command: ({ originalEvent }) => toggleReset(originalEvent, data.id),
            iconClass: 'text-warning'
        }
    ];

    if ((authStore.isAdmin || authStore.isSuperAdmin) && data.role) {
        items.push({
            label: 'Change Role',
            icon: User,
            command: () => promptChangeRole(data),
            iconClass: 'text-info'
        });
    }

    return items;
};

const confirmResetPassword = async () => {
    isReseting.value = true;
    await handleResetPassword();
    isReseting.value = false;
    showResetModal.value = false;
}

const cancelResetPassword = () => {
    onCancelReset();
    showResetModal.value = false;
}

const showStatusModal = ref(false);
const targetStatusUser = ref(null);
const isUpdatingStatus = ref(false);

const showChangeRoleModal = ref(false);
const targetChangeRoleUser = ref(null);
const targetChangeRoleId = ref(null);
const isChangingRole = ref(false);

const promptChangeRole = (data) => {
    const isCurrentUser = (authStore?.user?.id === data?.id);
    if (isCurrentUser) {
        toastStore.showToast("Cannot change your own role here", 'warning');
        return;
    }
    targetChangeRoleUser.value = data;
    targetChangeRoleId.value = data.role?.id || null;
    showChangeRoleModal.value = true;
};

const confirmChangeRole = async () => {
    if (!targetChangeRoleUser.value || !targetChangeRoleId.value) return;
    const data = targetChangeRoleUser.value;
    
    isChangingRole.value = true;
    const result = await userStore.changeUserRole(data.id, targetChangeRoleId.value);
    isChangingRole.value = false;

    if (result && result.success) {
        showChangeRoleModal.value = false;
        const index = userStore.users.findIndex(u => u.id === data.id);
        if (index !== -1) {
            userStore.users[index].role = result.data?.Role || result.data?.role;
            userStore.users[index].role_id = targetChangeRoleId.value;
        }
    }
};

const promptToggleStatus = (data) => {
    const isCurrentUser = (authStore?.user?.id === data?.id) && (authStore?.user?.role?.id === 1);
    if (isCurrentUser) {
        toastStore.showToast("Cannot update current user's status", 'warning');
        return;
    }
    targetStatusUser.value = data;
    showStatusModal.value = true;
};

const confirmStatusChange = async () => {
    if (!targetStatusUser.value) return;
    const data = targetStatusUser.value;
    
    isUpdatingStatus.value = true;

    const originalStatus = data.isActive;
    const newStatus = !originalStatus;

    const payload = {
        is_active: newStatus
    };

    const result = await userStore.updateUser(data.id, payload);

    if (result !== false) {
        data.isActive = newStatus;
        userStore.fetchRoleStats(true, filters.value.isActive);
    }

    isUpdatingStatus.value = false;
    showStatusModal.value = false;
    targetStatusUser.value = null;
};

onMounted(async () => {
    userStore.fetchRoleStats(true, filters.value.isActive);
    await Promise.all([
        userStore.getAllUsers(),
        userStore.getUserRoles()
    ]);
});

watch(() => filters.value.isActive, (newIsActive) => {
    userStore.fetchRoleStats(true, newIsActive);
});

const yearOptions = [
    { label: 'Year 1', value: '1' },
    { label: 'Year 2', value: '2' },
    { label: 'Year 3', value: '3' },
    { label: 'Year 4', value: '4' },
    { label: 'Other', value: 'other' }
];

const getYearLabel = (value) => {
    if (!value) return '-';
    const opt = yearOptions.find(o => o.value === String(value));
    return opt ? opt.label : value;
};

const colDefs = computed(() => {
    const cols = [
        { field: 'username', header: 'Full Name' },
        { field: 'email', header: 'Email Address' }
    ];
    cols.push(
        { field: 'kut', header: 'Kudi' },
        { field: 'role', header: 'Role (តួនាទី)' },
        { field: 'phone', header: 'Phone Number' },
        { field: 'school', header: 'School / University' },
        { field: 'year', header: 'Year' },
        { field: 'action', header: '', sortable: false }
    );
    return cols;
});
</script>

<style scoped>
.user-profile-avatar {
    width: 35px;
    height: 35px;
    background-color: var(--surface-ground);
    border-radius: 50px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--border-width) solid var(--border-clr);
}

.user-profile-avatar img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.status-select,
.search-input,
.kut-select {
    width: 100%;
}

@media (min-width: 576px) {
    .status-select {
        width: 130px;
    }
    .kut-select {
        width: 130px;
    }
    .search-input {
        width: 250px;
    }
}
</style>