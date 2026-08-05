import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/views/admin/users/UserListView.vue");const Papa = __vite__cjsImport9_papaparse;/* Injection by vite-plugin-vue-inspector Start */
import { createVNode as __createVNode,createElementVNode as __createElementVNode,createBlock as __createBlock,createElementBlock as __createElementBlock } from "/node_modules/.vite/deps/vue.js?v=3e5a51f0"
function _interopVNode(vnode) {
  if (vnode && vnode.props && 'data-v-inspector' in vnode.props) {
    const data = vnode.props['data-v-inspector']
    delete vnode.props['data-v-inspector']
    Object.defineProperty(vnode.props, '__v_inspector', { value: data, enumerable: false })
  }
  return vnode
}
function _createVNode(...args) { return _interopVNode(__createVNode(...args)) }
function _createElementVNode(...args) { return _interopVNode(__createElementVNode(...args)) }
function _createBlock(...args) { return _interopVNode(__createBlock(...args)) }
function _createElementBlock(...args) { return _interopVNode(__createElementBlock(...args)) }
/* Injection by vite-plugin-vue-inspector End */
import { useUserStore } from "/src/stores/users/user.js?t=1785913001078";
import { onMounted, ref, computed, watch } from "/node_modules/.vite/deps/vue.js?v=3e5a51f0";
import { formatDate } from "/src/utils/dateFormat.js";
import { BadgeCheck, Info, User, KeyRound, Search, FileDown, Check, X, BookOpen, GraduationCap } from "/node_modules/.vite/deps/@lucide_vue.js?v=3e5a51f0";
import UserDetailView from "/src/views/admin/users/UserDetailView.vue";
import { useAuthStore } from "/src/stores/auth.js";
import { useToastStore } from "/src/stores/toast.js";
import { useUserList } from "/src/composables/users/useUserList.js";
import __vite__cjsImport9_papaparse from "/node_modules/.vite/deps/papaparse.js?v=3e5a51f0";

import api from "/src/api/api.js";


const _sfc_main = {
  __name: 'UserListView',
  emits: ['new', 'edit', 'import', 'preview-bulk'],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const userStore = useUserStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const userListResult = useUserList(userStore, authStore, toastStore);
console.log('userListResult:', userListResult);
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
} = userListResult;
console.log('searchAndFilter:', searchAndFilter);

const activeFilter = computed({
    get: () => searchAndFilter.filters.value.roleId,
    set: (val) => {
        searchAndFilter.filters.value.roleId = val;
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
    return !!searchAndFilter.searchQuery.value || 
           searchAndFilter.filters.value.isActive !== null || 
           searchAndFilter.filters.value.roleId !== null ||
           searchAndFilter.filters.value.kutId !== null;
});

const resetFilters = () => {
    searchAndFilter.searchQuery.value = '';
    searchAndFilter.filters.value.isActive = null;
    searchAndFilter.filters.value.roleId = null;
    searchAndFilter.filters.value.kutId = null;
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
        { label: 'All Users', value: null, badge: userStore.roleStats['all'], variant: 'primary' }
    ];
    
    if (authStore.isSuperAdmin) {
        options.push({ label: 'មេកុដិ', value: 2, badge: userStore.roleStats[2], variant: 'success' });
    }
    
    options.push(
        { label: 'ភិក្ខុ', value: 7, badge: userStore.roleStats[7], variant: 'warning' },
        { label: 'សាមណេរ', value: 3, badge: userStore.roleStats[3], variant: 'info' },
        { label: 'សិស្សនិស្សិត', value: 4, badge: userStore.roleStats[4], variant: 'secondary' }
    );
    
    return options;
});

const statusOptions = ref([
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
]);

const getRoleVariant = (roleId) => {
    switch(roleId) {
        case 1: return 'danger'; // SuperAdmin
        case 2: return 'success'; // Admin/Mekudi
        case 3: return 'info'; // Monk
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
        if (data.role.id === 3 || data.role.id === 7) {
            items.push({
                label: 'Change to Student',
                icon: GraduationCap,
                command: () => promptChangeRole(data, 4),
                iconClass: 'text-info'
            });
        } else if (data.role.id === 4) {
            items.push({
                label: 'Change to Monk',
                icon: User,
                command: () => promptChangeRole(data, 3),
                iconClass: 'text-info'
            });
        }
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

const promptChangeRole = (data, roleId) => {
    const isCurrentUser = (authStore?.user?.id === data?.id);
    if (isCurrentUser) {
        toastStore.showToast("Cannot change your own role here", 'warning');
        return;
    }
    targetChangeRoleUser.value = data;
    targetChangeRoleId.value = roleId;
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
        userStore.fetchRoleStats(true, searchAndFilter.filters.value.isActive);
    }

    isUpdatingStatus.value = false;
    showStatusModal.value = false;
    targetStatusUser.value = null;
};

onMounted(async () => {
    userStore.fetchRoleStats(true, searchAndFilter.filters.value.isActive);
    await Promise.all([
        userStore.getAllUsers(),
        userStore.getUserRoles()
    ]);
});

watch(() => searchAndFilter.filters.value.isActive, (newIsActive) => {
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
        { field: 'rowAndSeat', header: 'Row/Seat' },
        { field: 'phone', header: 'Phone Number' },
        { field: 'school', header: 'School / University' },
        { field: 'year', header: 'Year' },
        { field: 'action', header: '', sortable: false }
    );
    return cols;
});

const __returned__ = { emit, userStore, authStore, toastStore, userListResult, showResetModal, showUserDetail, userDetail, isLoading, onViewDetail, onResetPassword, handleResetPassword, onCancelReset, searchAndFilter, activeFilter, kuts, kutOptions, hasActiveFilters, resetFilters, csvInputRef, triggerFileInput, onFileSelected, filterOptions, statusOptions, getRoleVariant, getRoleIcon, getUserRowClass, isReseting, toggleReset, getActionItems, confirmResetPassword, cancelResetPassword, showStatusModal, targetStatusUser, isUpdatingStatus, showChangeRoleModal, targetChangeRoleUser, targetChangeRoleId, isChangingRole, promptChangeRole, confirmChangeRole, promptToggleStatus, confirmStatusChange, yearOptions, getYearLabel, colDefs, get useUserStore() { return useUserStore }, onMounted, ref, computed, watch, get formatDate() { return formatDate }, get BadgeCheck() { return BadgeCheck }, get Info() { return Info }, get User() { return User }, get KeyRound() { return KeyRound }, get Search() { return Search }, get FileDown() { return FileDown }, get Check() { return Check }, get X() { return X }, get BookOpen() { return BookOpen }, get GraduationCap() { return GraduationCap }, UserDetailView, get useAuthStore() { return useAuthStore }, get useToastStore() { return useToastStore }, get useUserList() { return useUserList }, get Papa() { return Papa }, get api() { return api } }
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
return __returned__
}

}
import { createCommentVNode as _createCommentVNode, resolveComponent as _resolveComponent,   openBlock as _openBlock,   toDisplayString as _toDisplayString, withCtx as _withCtx, resolveDirective as _resolveDirective, withDirectives as _withDirectives, createTextVNode as _createTextVNode, normalizeClass as _normalizeClass, Fragment as _Fragment } from "/node_modules/.vite/deps/vue.js?v=3e5a51f0"

const _hoisted_1 = {
  style: {"background-color":"var(--surface-ground)"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:2:5"
}
const _hoisted_2 = {
  class: "mb-3 d-flex flex-wrap flex-lg-nowrap align-items-center justify-content-between gap-2 w-100",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:3:9"
}
const _hoisted_3 = {
  class: "d-flex align-items-center w-100 w-lg-auto",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:5:13"
}
const _hoisted_4 = {
  class: "d-flex flex-wrap flex-md-nowrap align-items-center gap-2 justify-content-end w-100 w-lg-auto",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:10:13"
}
const _hoisted_5 = {
  class: "search-input",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:11:17"
}
const _hoisted_6 = {
  class: "status-select flex-shrink-0",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:20:17"
}
const _hoisted_7 = {
  key: 2,
  class: "text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:29:29"
}
const _hoisted_8 = {
  key: 2,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:34:29"
}
const _hoisted_9 = {
  key: 0,
  class: "kut-select flex-shrink-0",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:39:17"
}
const _hoisted_10 = {
  class: "d-flex gap-2 flex-shrink-0",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:47:17"
}
const _hoisted_11 = {
  class: "d-flex align-items-center gap-3",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:67:17"
}
const _hoisted_12 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:68:21" }
const _hoisted_13 = {
  class: "user-profile-avatar d-flex align-items-center justify-content-center text-muted",
  style: {"border-radius":"50%"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:69:21"
}
const _hoisted_14 = ["src"]
const _hoisted_15 = {
  class: "d-flex flex-column align-items-start",
  style: {"min-width":"0"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:76:21"
}
const _hoisted_16 = ["title"]
const _hoisted_17 = ["title"]
const _hoisted_18 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:89:17" }
const _hoisted_19 = {
  key: 0,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:93:17"
}
const _hoisted_20 = {
  key: 0,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:95:21"
}
const _hoisted_21 = {
  key: 1,
  class: "text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:99:17"
}
const _hoisted_22 = {
  key: 0,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:114:17"
}
const _hoisted_23 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:126:17" }
const _hoisted_24 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:129:17" }
const _hoisted_25 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:132:17" }
const _hoisted_26 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:135:17" }
const _hoisted_27 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:138:17" }
const _hoisted_28 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:141:17" }
const _hoisted_29 = {
  class: "text-center",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:155:9"
}
const _hoisted_30 = {
  class: "d-flex gap-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:157:13"
}
const _hoisted_31 = {
  class: "text-center",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:170:9"
}
const _hoisted_32 = {
  class: "mb-4 fw-medium text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:177:13"
}
const _hoisted_33 = {
  class: "text-base",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:179:17"
}
const _hoisted_34 = {
  class: "d-flex gap-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:181:13"
}
const _hoisted_35 = {
  class: "text-center",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:195:9"
}
const _hoisted_36 = {
  class: "mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info",
  style: {"width":"60px","height":"60px"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:196:13"
}
const _hoisted_37 = {
  class: "mb-4 fw-medium text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:201:13"
}
const _hoisted_38 = {
  class: "text-base",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:203:17"
}
const _hoisted_39 = {
  class: "d-flex gap-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:205:13"
}

function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_BaseFilter = _resolveComponent("BaseFilter")
  const _component_BaseInput = _resolveComponent("BaseInput")
  const _component_BaseBadge = _resolveComponent("BaseBadge")
  const _component_BaseSelect = _resolveComponent("BaseSelect")
  const _component_BaseButton = _resolveComponent("BaseButton")
  const _component_BaseActionMenu = _resolveComponent("BaseActionMenu")
  const _component_BaseTable = _resolveComponent("BaseTable")
  const _component_BaseDrawer = _resolveComponent("BaseDrawer")
  const _component_BaseModal = _resolveComponent("BaseModal")
  const _directive_tooltip = _resolveDirective("tooltip")

  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _createElementVNode("div", _hoisted_1, [
      _createElementVNode("div", _hoisted_2, [
        _createCommentVNode(" Left Side: Filters "),
        _createElementVNode("div", _hoisted_3, [
          _createVNode(_component_BaseFilter, {
            modelValue: $setup.activeFilter,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($setup.activeFilter) = $event)),
            options: $setup.filterOptions,
            wrap: true,
            "data-v-inspector": "src/views/admin/users/UserListView.vue:6:17"
          }, null, 8 /* PROPS */, ["modelValue", "options"])
        ]),
        _createCommentVNode(" Right Side: Search, Status, Buttons "),
        _createElementVNode("div", _hoisted_4, [
          _createElementVNode("div", _hoisted_5, [
            _createVNode(_component_BaseInput, {
              modelValue: $setup.searchAndFilter.searchQuery.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($setup.searchAndFilter.searchQuery.value) = $event)),
              placeholder: "Search users...",
              prefixIcon: $setup.Search,
              clearable: "",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:12:21"
            }, null, 8 /* PROPS */, ["modelValue", "prefixIcon"])
          ]),
          _createElementVNode("div", _hoisted_6, [
            _createVNode(_component_BaseSelect, {
              modelValue: $setup.searchAndFilter.filters.value.isActive,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => (($setup.searchAndFilter.filters.value.isActive) = $event)),
              options: $setup.statusOptions,
              placeholder: "Status",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:21:21"
            }, {
              value: _withCtx((slotProps) => [
                (slotProps.value === true)
                  ? (_openBlock(), _createBlock(_component_BaseBadge, {
                      key: 0,
                      status: "ACTIVE",
                      pill: "",
                      size: "sm",
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:27:29"
                    }))
                  : (slotProps.value === false)
                    ? (_openBlock(), _createBlock(_component_BaseBadge, {
                        key: 1,
                        status: "INACTIVE",
                        pill: "",
                        size: "sm",
                        "data-v-inspector": "src/views/admin/users/UserListView.vue:28:29"
                      }))
                    : (_openBlock(), _createElementBlock("span", _hoisted_7, "Status"))
              ]),
              option: _withCtx((slotProps) => [
                (slotProps.option.value === true)
                  ? (_openBlock(), _createBlock(_component_BaseBadge, {
                      key: 0,
                      status: "ACTIVE",
                      pill: "",
                      size: "sm",
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:32:29"
                    }))
                  : (slotProps.option.value === false)
                    ? (_openBlock(), _createBlock(_component_BaseBadge, {
                        key: 1,
                        status: "INACTIVE",
                        pill: "",
                        size: "sm",
                        "data-v-inspector": "src/views/admin/users/UserListView.vue:33:29"
                      }))
                    : (_openBlock(), _createElementBlock("span", _hoisted_8, _toDisplayString(slotProps.option.label), 1 /* TEXT */))
              ]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["modelValue", "options"])
          ]),
          ($setup.authStore.isSuperAdmin)
            ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
                _createVNode(_component_BaseSelect, {
                  modelValue: $setup.searchAndFilter.filters.value.kutId,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => (($setup.searchAndFilter.filters.value.kutId) = $event)),
                  options: $setup.kutOptions,
                  placeholder: "Kudi / កុដិ",
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:40:21"
                }, null, 8 /* PROPS */, ["modelValue", "options"])
              ]))
            : _createCommentVNode("v-if", true),
          _createElementVNode("div", _hoisted_10, [
            _createElementVNode("input", {
              type: "file",
              accept: ".csv",
              ref: "csvInputRef",
              onChange: $setup.onFileSelected,
              style: {"display":"none"},
              "data-v-inspector": "src/views/admin/users/UserListView.vue:48:21"
            }, null, 544 /* NEED_HYDRATION, NEED_PATCH */),
            _withDirectives((_openBlock(), _createBlock(_component_BaseButton, {
              disabled: $setup.userStore.isLoading,
              onClick: $setup.triggerFileInput,
              variant: "outline-primary",
              class: "btn d-flex align-items-center justify-content-center px-3",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:49:21"
            }, {
              default: _withCtx(() => [
                _createVNode($setup["FileDown"], {
                  class: "text-success",
                  size: 16,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:51:25"
                })
              ]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["disabled"])), [
              [_directive_tooltip, 'Import CSV']
            ]),
            _createVNode(_component_BaseButton, {
              disabled: $setup.userStore.isLoading,
              onClick: _cache[4] || (_cache[4] = $event => (_ctx.$emit('new'))),
              class: "btn btn-primary text-nowrap d-flex align-items-center justify-content-center px-4",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:53:21"
            }, {
              default: _withCtx(() => [...(_cache[19] || (_cache[19] = [
                _createTextVNode(" Add New User ", -1 /* CACHED */)
              ]))]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["disabled"])
          ])
        ])
      ]),
      _createVNode(_component_BaseTable, {
        columns: $setup.colDefs,
        rows: $setup.userStore.users,
        loading: $setup.userStore.isLoading,
        "total-records": $setup.userStore.totalItems,
        page: $setup.userStore.page,
        "onUpdate:page": _cache[5] || (_cache[5] = $event => (($setup.userStore.page) = $event)),
        "per-page": $setup.userStore.perPage,
        "onUpdate:perPage": _cache[6] || (_cache[6] = $event => (($setup.userStore.perPage) = $event)),
        "sort-by": $setup.userStore.sortBy,
        "onUpdate:sortBy": _cache[7] || (_cache[7] = $event => (($setup.userStore.sortBy) = $event)),
        "sort-order": $setup.userStore.sortOrder,
        "onUpdate:sortOrder": _cache[8] || (_cache[8] = $event => (($setup.userStore.sortOrder) = $event)),
        onRefreshData: $setup.userStore.getAllUsers,
        rowClass: $setup.getUserRowClass,
        "data-v-inspector": "src/views/admin/users/UserListView.vue:60:9"
      }, {
        username: _withCtx(({ data }) => [
          _createElementVNode("div", _hoisted_11, [
            _createElementVNode("div", _hoisted_12, [
              _createElementVNode("div", _hoisted_13, [
                (data?.profile?.avatarUrl)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 0,
                      src: _ctx.$authImg(data.profile.avatarUrl),
                      class: "img-fluid",
                      style: {"border-radius":"50%"},
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:71:25"
                    }, null, 8 /* PROPS */, _hoisted_14))
                  : (_openBlock(), _createBlock($setup["User"], {
                      key: 1,
                      size: 20,
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:73:25"
                    }))
              ])
            ]),
            _createElementVNode("div", _hoisted_15, [
              _createElementVNode("span", {
                class: "fw-medium truncate-1-line",
                title: data?.firstName + ' ' + data?.lastName,
                "data-v-inspector": "src/views/admin/users/UserListView.vue:77:25"
              }, _toDisplayString(data?.firstName + " " + data?.lastName), 9 /* TEXT, PROPS */, _hoisted_16)
            ])
          ])
        ]),
        email: _withCtx(({ data }) => [
          _createElementVNode("span", {
            class: _normalizeClass([[`text-${$setup.getRoleVariant(data?.role?.id)}`], "truncate-1-line"]),
            title: data?.email,
            "data-v-inspector": "src/views/admin/users/UserListView.vue:83:17"
          }, _toDisplayString(data?.email), 11 /* TEXT, CLASS, PROPS */, _hoisted_17)
        ]),
        kut: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_18, _toDisplayString(data?.profile?.kut?.name || data?.profile?.kut?.number || '-'), 1 /* TEXT */)
        ]),
        rowAndSeat: _withCtx(({ data }) => [
          (data?.profile?.seatingRowId || data?.profile?.seating_row_id)
            ? (_openBlock(), _createElementBlock("span", _hoisted_19, [
                _createTextVNode(" Row " + _toDisplayString(data?.profile?.seatingRow?.row_num || data?.profile?.seatingRowId || data?.profile?.seating_row_id) + " ", 1 /* TEXT */),
                (data?.profile?.seatNumber || data?.profile?.seat_number)
                  ? (_openBlock(), _createElementBlock("span", _hoisted_20, " (Seat " + _toDisplayString(data?.profile?.seatNumber || data?.profile?.seat_number) + ") ", 1 /* TEXT */))
                  : _createCommentVNode("v-if", true)
              ]))
            : (_openBlock(), _createElementBlock("span", _hoisted_21, "-"))
        ]),
        role: _withCtx(({ data }) => [
          (data?.role)
            ? (_openBlock(), _createBlock(_component_BaseBadge, {
                key: 0,
                variant: $setup.getRoleVariant(data.role.id),
                label: data.role.name,
                icon: $setup.getRoleIcon(data.role.id),
                pill: "",
                size: "sm",
                "data-v-inspector": "src/views/admin/users/UserListView.vue:103:17"
              }, null, 8 /* PROPS */, ["variant", "label", "icon"]))
            : _createCommentVNode("v-if", true)
        ]),
        createdAt: _withCtx(({ data }) => [
          (data?.createdAt)
            ? (_openBlock(), _createElementBlock("span", _hoisted_22, _toDisplayString($setup.formatDate(data.createdAt)), 1 /* TEXT */))
            : _createCommentVNode("v-if", true)
        ]),
        isActive: _withCtx(({ data }) => [
          _createVNode(_component_BaseBadge, {
            status: data?.isActive ? 'ACTIVE' : 'INACTIVE',
            pill: "",
            size: "sm",
            loading: $setup.targetStatusUser?.id === data.id && $setup.isUpdatingStatus,
            "data-v-inspector": "src/views/admin/users/UserListView.vue:117:17"
          }, null, 8 /* PROPS */, ["status", "loading"])
        ]),
        dob: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_23, _toDisplayString(data?.dob || '-'), 1 /* TEXT */)
        ]),
        gender: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_24, _toDisplayString(data?.gender || '-'), 1 /* TEXT */)
        ]),
        pob: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_25, _toDisplayString(data?.pob || '-'), 1 /* TEXT */)
        ]),
        phone: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_26, _toDisplayString(data?.UserProfile?.phone_number || data?.profile?.phone || '-'), 1 /* TEXT */)
        ]),
        school: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_27, _toDisplayString(data?.UserProfile?.university_name || data?.profile?.university_name || '-'), 1 /* TEXT */)
        ]),
        year: _withCtx(({ data }) => [
          _createElementVNode("span", _hoisted_28, _toDisplayString($setup.getYearLabel(data?.UserProfile?.university_year || data?.profile?.university_year)), 1 /* TEXT */)
        ]),
        action: _withCtx(({ data }) => [
          _createVNode(_component_BaseActionMenu, {
            items: $setup.getActionItems(data),
            "data-v-inspector": "src/views/admin/users/UserListView.vue:145:17"
          }, null, 8 /* PROPS */, ["items"])
        ]),
        _: 1 /* STABLE */
      }, 8 /* PROPS */, ["columns", "rows", "loading", "total-records", "page", "per-page", "sort-by", "sort-order", "onRefreshData"])
    ]),
    _createVNode(_component_BaseDrawer, {
      modelValue: $setup.showUserDetail,
      "onUpdate:modelValue": _cache[9] || (_cache[9] = $event => (($setup.showUserDetail) = $event)),
      title: "Details",
      width: "30rem",
      "data-v-inspector": "src/views/admin/users/UserListView.vue:150:5"
    }, {
      default: _withCtx(() => [
        ($setup.showUserDetail)
          ? (_openBlock(), _createBlock($setup["UserDetailView"], {
              key: 0,
              user: $setup.userDetail,
              "data-v-inspector": "src/views/admin/users/UserListView.vue:151:9"
            }, null, 8 /* PROPS */, ["user"]))
          : _createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["modelValue"]),
    _createVNode(_component_BaseModal, {
      modelValue: $setup.showResetModal,
      "onUpdate:modelValue": _cache[12] || (_cache[12] = $event => (($setup.showResetModal) = $event)),
      title: "Reset Password",
      size: "sm",
      "data-v-inspector": "src/views/admin/users/UserListView.vue:154:5"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_29, [
          _cache[21] || (_cache[21] = _createElementVNode("p", {
            class: "mb-4 fw-medium text-muted",
            "data-v-inspector": "src/views/admin/users/UserListView.vue:156:13"
          }, "Are you sure you want to reset this user's password?", -1 /* CACHED */)),
          _createElementVNode("div", _hoisted_30, [
            _createVNode(_component_BaseButton, {
              variant: "outline-warning",
              type: "button",
              class: "flex-grow-1",
              onClick: _cache[10] || (_cache[10] = $event => ($setup.cancelResetPassword())),
              "data-v-inspector": "src/views/admin/users/UserListView.vue:158:17"
            }, {
              default: _withCtx(() => [...(_cache[20] || (_cache[20] = [
                _createTextVNode(" Cancel ", -1 /* CACHED */)
              ]))]),
              _: 1 /* STABLE */
            }),
            _createVNode(_component_BaseButton, {
              variant: "warning",
              type: "button",
              class: "flex-grow-1",
              onClick: _cache[11] || (_cache[11] = $event => ($setup.confirmResetPassword())),
              isLoading: $setup.isReseting,
              "data-v-inspector": "src/views/admin/users/UserListView.vue:162:17"
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString($setup.isReseting ? 'Reseting...' : 'Reset Now'), 1 /* TEXT */)
              ]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["isLoading"])
          ])
        ])
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["modelValue"]),
    _createVNode(_component_BaseModal, {
      modelValue: $setup.showStatusModal,
      "onUpdate:modelValue": _cache[15] || (_cache[15] = $event => (($setup.showStatusModal) = $event)),
      title: $setup.targetStatusUser?.isActive ? 'Deactivate User' : 'Activate User',
      size: "sm",
      "data-v-inspector": "src/views/admin/users/UserListView.vue:169:5"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_31, [
          _createElementVNode("div", {
            class: _normalizeClass(["mb-3 d-inline-flex align-items-center justify-content-center rounded-circle", $setup.targetStatusUser?.isActive ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success']),
            style: {"width":"60px","height":"60px"},
            "data-v-inspector": "src/views/admin/users/UserListView.vue:171:13"
          }, [
            ($setup.targetStatusUser?.isActive)
              ? (_openBlock(), _createBlock($setup["X"], {
                  key: 0,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:174:17"
                }))
              : (_openBlock(), _createBlock($setup["Check"], {
                  key: 1,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:175:17"
                }))
          ], 2 /* CLASS */),
          _createElementVNode("p", _hoisted_32, [
            _createTextVNode(" Are you sure you want to " + _toDisplayString($setup.targetStatusUser?.isActive ? 'deactivate' : 'activate') + " ", 1 /* TEXT */),
            _createElementVNode("strong", _hoisted_33, _toDisplayString($setup.targetStatusUser?.firstName) + " " + _toDisplayString($setup.targetStatusUser?.lastName), 1 /* TEXT */),
            _cache[22] || (_cache[22] = _createTextVNode("? ", -1 /* CACHED */))
          ]),
          _createElementVNode("div", _hoisted_34, [
            _createVNode(_component_BaseButton, {
              variant: $setup.targetStatusUser?.isActive ? 'outline-danger' : 'outline-success',
              type: "button",
              class: "flex-grow-1",
              onClick: _cache[13] || (_cache[13] = $event => ($setup.showStatusModal = false)),
              "data-v-inspector": "src/views/admin/users/UserListView.vue:182:17"
            }, {
              default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
                _createTextVNode(" Cancel ", -1 /* CACHED */)
              ]))]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["variant"]),
            _createVNode(_component_BaseButton, {
              variant: $setup.targetStatusUser?.isActive ? 'danger' : 'success',
              type: "button",
              class: "flex-grow-1",
              onClick: _cache[14] || (_cache[14] = $event => ($setup.confirmStatusChange())),
              "is-Loading": $setup.isUpdatingStatus,
              "data-v-inspector": "src/views/admin/users/UserListView.vue:186:17"
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString($setup.isUpdatingStatus ? 'Updating...' : ($setup.targetStatusUser?.isActive ? 'Deactivate Now' : 'Activate Now')), 1 /* TEXT */)
              ]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["variant", "is-Loading"])
          ])
        ])
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["modelValue", "title"]),
    _createVNode(_component_BaseModal, {
      modelValue: $setup.showChangeRoleModal,
      "onUpdate:modelValue": _cache[18] || (_cache[18] = $event => (($setup.showChangeRoleModal) = $event)),
      title: "Change Role",
      size: "sm",
      "data-v-inspector": "src/views/admin/users/UserListView.vue:194:5"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_35, [
          _createElementVNode("div", _hoisted_36, [
            ($setup.targetChangeRoleId === 4)
              ? (_openBlock(), _createBlock($setup["GraduationCap"], {
                  key: 0,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:198:17"
                }))
              : (_openBlock(), _createBlock($setup["User"], {
                  key: 1,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:199:17"
                }))
          ]),
          _createElementVNode("p", _hoisted_37, [
            _cache[24] || (_cache[24] = _createTextVNode(" Are you sure you want to change role to ", -1 /* CACHED */)),
            _createElementVNode("strong", _hoisted_38, _toDisplayString($setup.targetChangeRoleId === 4 ? 'Student' : 'Monk'), 1 /* TEXT */),
            _cache[25] || (_cache[25] = _createTextVNode("? ", -1 /* CACHED */))
          ]),
          _createElementVNode("div", _hoisted_39, [
            _createVNode(_component_BaseButton, {
              variant: "outline-secondary",
              type: "button",
              class: "flex-grow-1",
              onClick: _cache[16] || (_cache[16] = $event => ($setup.showChangeRoleModal = false)),
              "data-v-inspector": "src/views/admin/users/UserListView.vue:206:17"
            }, {
              default: _withCtx(() => [...(_cache[26] || (_cache[26] = [
                _createTextVNode(" Cancel ", -1 /* CACHED */)
              ]))]),
              _: 1 /* STABLE */
            }),
            _createVNode(_component_BaseButton, {
              variant: "info",
              type: "button",
              class: "flex-grow-1 text-white",
              onClick: _cache[17] || (_cache[17] = $event => ($setup.confirmChangeRole())),
              "is-Loading": $setup.isChangingRole,
              "data-v-inspector": "src/views/admin/users/UserListView.vue:210:17"
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString($setup.isChangingRole ? 'Updating...' : 'Change Now'), 1 /* TEXT */)
              ]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["is-Loading"])
          ])
        ])
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["modelValue"])
  ], 64 /* STABLE_FRAGMENT */))
}


import "/src/views/admin/users/UserListView.vue?vue&type=style&index=0&scoped=70eee575&lang.css"

_sfc_main.__hmrId = "70eee575"
typeof __VUE_HMR_RUNTIME__ !== 'undefined' && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main)
import.meta.hot.on('file-changed', ({ file }) => {
  __VUE_HMR_RUNTIME__.CHANGED_FILE = file
})
import.meta.hot.accept(mod => {
  if (!mod) return
  const { default: updated, _rerender_only } = mod
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render)
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)
  }
})
import _export_sfc from "/@id/__x00__plugin-vue:export-helper"
export default /*#__PURE__*/_export_sfc(_sfc_main, [['render',_sfc_render],['__scopeId',"data-v-70eee575"],['__file',"/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/users/UserListView.vue"]])
//# sourceMappingURL=data:application/json;base64,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QyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDOztBQUVoRCxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQ25ELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQ2xELENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUM7O0FBRUYsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDN0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUk7QUFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNwRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ3ZELENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDOUMsQ0FBQzs7QUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOztBQUU3QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDOztBQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU07O0FBRXJCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNkLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUosQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJO0FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25FLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUViLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM5RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUM5RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO0FBQ3pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFROztBQUUxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXBCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7QUFDdEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPO0FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUMxRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ25GLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXBCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2SixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFakssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWhHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQ2hELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdkQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5RixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDN0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDOztBQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSTtBQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUN4RixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPO0FBQ2xCLENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxDQUFDLENBQUM7O0FBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7O0FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVE7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7QUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7O0FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRyxDQUFDOztBQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7O0FBRTdCLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUMvQjs7QUFFQSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUk7QUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztBQUM3QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDdEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztBQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTztBQUNwRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRO0FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUMvRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO0FBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFTCxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYTtBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUk7QUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztBQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUk7QUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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QUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSztBQUN6QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJO0FBQ2hGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO0FBQ3JFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDOztBQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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QUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSztBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUNqQyxDQUFDOztBQUVELFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUMxRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUM7O0FBRUYsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUMvQyxDQUFDLENBQUM7O0FBRUYsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckMsQ0FBQzs7QUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSztBQUNsQyxDQUFDOztBQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSTtBQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFD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QUFtQjtjQUFVLGtCQUFnQixFQUFDOztnQ0FBZ0QsQ0FFMUc7aUNBRjBHLFVBRTFHOzs7O1lBQ0EsYUFHYTtjQUhELE9BQU8sRUFBQyxNQUFNO2NBQUMsSUFBSSxFQUFDLFFBQVE7Y0FBQyxLQUFLLEVBQUMsd0JBQXdCO2NBQ2xFLE9BQUsseUNBQUUsd0JBQWlCO2NBQUssWUFBVSxFQUFFLHFCQUFjO2NBQUUsa0JBQWdCLEVBQUM7O2dDQUMzRSxDQUFtRDtrREFBaEQscUJBQWMiLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIlVzZXJMaXN0Vmlldy52dWUiXSwic291cmNlc0NvbnRlbnQiOlsiPHRlbXBsYXRlPlxuICAgIDxkaXYgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zdXJmYWNlLWdyb3VuZCk7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjI6NVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWItMyBkLWZsZXggZmxleC13cmFwIGZsZXgtbGctbm93cmFwIGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtYmV0d2VlbiBnYXAtMiB3LTEwMFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTozOjlcIj5cbiAgICAgICAgICAgIDwhLS0gTGVmdCBTaWRlOiBGaWx0ZXJzIC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgdy0xMDAgdy1sZy1hdXRvXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjU6MTNcIj5cbiAgICAgICAgICAgICAgICA8QmFzZUZpbHRlciB2LW1vZGVsPVwiYWN0aXZlRmlsdGVyXCIgOm9wdGlvbnM9XCJmaWx0ZXJPcHRpb25zXCIgOndyYXA9XCJ0cnVlXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjY6MTdcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDwhLS0gUmlnaHQgU2lkZTogU2VhcmNoLCBTdGF0dXMsIEJ1dHRvbnMgLS0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGZsZXgtd3JhcCBmbGV4LW1kLW5vd3JhcCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTIganVzdGlmeS1jb250ZW50LWVuZCB3LTEwMCB3LWxnLWF1dG9cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTA6MTNcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VhcmNoLWlucHV0XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjExOjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlSW5wdXQgXG4gICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwic2VhcmNoQW5kRmlsdGVyLnNlYXJjaFF1ZXJ5LnZhbHVlXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCB1c2Vycy4uLlwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgOnByZWZpeEljb249XCJTZWFyY2hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJhYmxlIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMjoyMVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0dXMtc2VsZWN0IGZsZXgtc2hyaW5rLTBcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MjA6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgPEJhc2VTZWxlY3QgXG4gICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwic2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUuaXNBY3RpdmVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIDpvcHRpb25zPVwic3RhdHVzT3B0aW9uc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlN0YXR1c1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMToyMVwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjdmFsdWU9XCJzbG90UHJvcHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIHYtaWY9XCJzbG90UHJvcHMudmFsdWUgPT09IHRydWVcIiBzdGF0dXM9XCJBQ1RJVkVcIiBwaWxsIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyNzoyOVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VCYWRnZSB2LWVsc2UtaWY9XCJzbG90UHJvcHMudmFsdWUgPT09IGZhbHNlXCIgc3RhdHVzPVwiSU5BQ1RJVkVcIiBwaWxsIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyODoyOVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlIGNsYXNzPVwidGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyOToyOVwiPlN0YXR1czwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI29wdGlvbj1cInNsb3RQcm9wc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlQmFkZ2Ugdi1pZj1cInNsb3RQcm9wcy5vcHRpb24udmFsdWUgPT09IHRydWVcIiBzdGF0dXM9XCJBQ1RJVkVcIiBwaWxsIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTozMjoyOVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VCYWRnZSB2LWVsc2UtaWY9XCJzbG90UHJvcHMub3B0aW9uLnZhbHVlID09PSBmYWxzZVwiIHN0YXR1cz1cIklOQUNUSVZFXCIgcGlsbCBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MzM6MjlcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHYtZWxzZSBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MzQ6MjlcIj57eyBzbG90UHJvcHMub3B0aW9uLmxhYmVsIH19PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgICAgICAgICAgICAgPC9CYXNlU2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImt1dC1zZWxlY3QgZmxleC1zaHJpbmstMFwiIHYtaWY9XCJhdXRoU3RvcmUuaXNTdXBlckFkbWluXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjM5OjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlU2VsZWN0IFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cInNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLmt1dElkXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cImt1dE9wdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJLdWRpIC8g4Z6A4Z674Z6K4Z63XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjQwOjIxXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGdhcC0yIGZsZXgtc2hyaW5rLTBcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NDc6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiLmNzdlwiIHJlZj1cImNzdklucHV0UmVmXCIgQGNoYW5nZT1cIm9uRmlsZVNlbGVjdGVkXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo0ODoyMVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIDpkaXNhYmxlZD1cInVzZXJTdG9yZS5pc0xvYWRpbmdcIiBAY2xpY2s9XCJ0cmlnZ2VyRmlsZUlucHV0XCIgdmFyaWFudD1cIm91dGxpbmUtcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImJ0biBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGp1c3RpZnktY29udGVudC1jZW50ZXIgcHgtM1wiIHYtdG9vbHRpcD1cIidJbXBvcnQgQ1NWJ1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo0OToyMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEZpbGVEb3duIGNsYXNzPVwidGV4dC1zdWNjZXNzXCIgOnNpemU9XCIxNlwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo1MToyNVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gOmRpc2FibGVkPVwidXNlclN0b3JlLmlzTG9hZGluZ1wiIEBjbGljaz1cIiRlbWl0KCduZXcnKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSB0ZXh0LW5vd3JhcCBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGp1c3RpZnktY29udGVudC1jZW50ZXIgcHgtNFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo1MzoyMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgQWRkIE5ldyBVc2VyXG4gICAgICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPEJhc2VUYWJsZSA6Y29sdW1ucz1cImNvbERlZnNcIiA6cm93cz1cInVzZXJTdG9yZS51c2Vyc1wiIDpsb2FkaW5nPVwidXNlclN0b3JlLmlzTG9hZGluZ1wiXG4gICAgICAgICAgICA6dG90YWwtcmVjb3Jkcz1cInVzZXJTdG9yZS50b3RhbEl0ZW1zXCIgdi1tb2RlbDpwYWdlPVwidXNlclN0b3JlLnBhZ2VcIiB2LW1vZGVsOnBlci1wYWdlPVwidXNlclN0b3JlLnBlclBhZ2VcIlxuICAgICAgICAgICAgdi1tb2RlbDpzb3J0LWJ5PVwidXNlclN0b3JlLnNvcnRCeVwiIHYtbW9kZWw6c29ydC1vcmRlcj1cInVzZXJTdG9yZS5zb3J0T3JkZXJcIlxuICAgICAgICAgICAgQHJlZnJlc2gtZGF0YT1cInVzZXJTdG9yZS5nZXRBbGxVc2Vyc1wiXG4gICAgICAgICAgICA6cm93Q2xhc3M9XCJnZXRVc2VyUm93Q2xhc3NcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NjA6OVwiPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI3VzZXJuYW1lPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBnYXAtM1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo2NzoxN1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo2ODoyMVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWF2YXRhciBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGp1c3RpZnktY29udGVudC1jZW50ZXIgdGV4dC1tdXRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJvcmRlci1yYWRpdXM6IDUwJTtcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Njk6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgdi1pZj1cImRhdGE/LnByb2ZpbGU/LmF2YXRhclVybFwiIDpzcmM9XCIkYXV0aEltZyhkYXRhLnByb2ZpbGUuYXZhdGFyVXJsKVwiIGNsYXNzPVwiaW1nLWZsdWlkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJvcmRlci1yYWRpdXM6IDUwJTtcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NzE6MjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxVc2VyIHYtZWxzZSA6c2l6ZT1cIjIwXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjczOjI1XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGZsZXgtY29sdW1uIGFsaWduLWl0ZW1zLXN0YXJ0XCIgc3R5bGU9XCJtaW4td2lkdGg6IDA7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjc2OjIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZ3LW1lZGl1bSB0cnVuY2F0ZS0xLWxpbmVcIiA6dGl0bGU9XCJkYXRhPy5maXJzdE5hbWUgKyAnICcgKyBkYXRhPy5sYXN0TmFtZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo3NzoyNVwiPnt7IGRhdGE/LmZpcnN0TmFtZSArIFwiIFwiICsgZGF0YT8ubGFzdE5hbWUgfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICNlbWFpbD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gOmNsYXNzPVwiW2B0ZXh0LSR7Z2V0Um9sZVZhcmlhbnQoZGF0YT8ucm9sZT8uaWQpfWBdXCIgY2xhc3M9XCJ0cnVuY2F0ZS0xLWxpbmVcIiA6dGl0bGU9XCJkYXRhPy5lbWFpbFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo4MzoxN1wiPlxuICAgICAgICAgICAgICAgICAgICB7eyBkYXRhPy5lbWFpbCB9fVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAja3V0PVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6ODk6MTdcIj57eyBkYXRhPy5wcm9maWxlPy5rdXQ/Lm5hbWUgfHwgZGF0YT8ucHJvZmlsZT8ua3V0Py5udW1iZXIgfHwgJy0nIH19PC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICNyb3dBbmRTZWF0PVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiZGF0YT8ucHJvZmlsZT8uc2VhdGluZ1Jvd0lkIHx8IGRhdGE/LnByb2ZpbGU/LnNlYXRpbmdfcm93X2lkXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjkzOjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIFJvdyB7eyBkYXRhPy5wcm9maWxlPy5zZWF0aW5nUm93Py5yb3dfbnVtIHx8IGRhdGE/LnByb2ZpbGU/LnNlYXRpbmdSb3dJZCB8fCBkYXRhPy5wcm9maWxlPy5zZWF0aW5nX3Jvd19pZCB9fSBcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImRhdGE/LnByb2ZpbGU/LnNlYXROdW1iZXIgfHwgZGF0YT8ucHJvZmlsZT8uc2VhdF9udW1iZXJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6OTU6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIChTZWF0IHt7IGRhdGE/LnByb2ZpbGU/LnNlYXROdW1iZXIgfHwgZGF0YT8ucHJvZmlsZT8uc2VhdF9udW1iZXIgfX0pXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlIGNsYXNzPVwidGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo5OToxN1wiPi08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI3JvbGU9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxCYXNlQmFkZ2UgXG4gICAgICAgICAgICAgICAgICAgIHYtaWY9XCJkYXRhPy5yb2xlXCJcbiAgICAgICAgICAgICAgICAgICAgOnZhcmlhbnQ9XCJnZXRSb2xlVmFyaWFudChkYXRhLnJvbGUuaWQpXCIgXG4gICAgICAgICAgICAgICAgICAgIDpsYWJlbD1cImRhdGEucm9sZS5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgIDppY29uPVwiZ2V0Um9sZUljb24oZGF0YS5yb2xlLmlkKVwiIFxuICAgICAgICAgICAgICAgICAgICBwaWxsIFxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTAzOjE3XCIgXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjY3JlYXRlZEF0PVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiZGF0YT8uY3JlYXRlZEF0XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjExNDoxN1wiPnt7IGZvcm1hdERhdGUoZGF0YS5jcmVhdGVkQXQpIH19PC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjaXNBY3RpdmU9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxCYXNlQmFkZ2UgXG4gICAgICAgICAgICAgICAgICAgIDpzdGF0dXM9XCJkYXRhPy5pc0FjdGl2ZSA/ICdBQ1RJVkUnIDogJ0lOQUNUSVZFJ1wiIFxuICAgICAgICAgICAgICAgICAgICBwaWxsIFxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21cIiBcbiAgICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJ0YXJnZXRTdGF0dXNVc2VyPy5pZCA9PT0gZGF0YS5pZCAmJiBpc1VwZGF0aW5nU3RhdHVzXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjExNzoxN1wiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjZG9iPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTI2OjE3XCI+e3sgZGF0YT8uZG9iIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI2dlbmRlcj1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEyOToxN1wiPnt7IGRhdGE/LmdlbmRlciB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICNwb2I9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMzI6MTdcIj57eyBkYXRhPy5wb2IgfHwgJy0nIH19PC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjcGhvbmU9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMzU6MTdcIj57eyBkYXRhPy5Vc2VyUHJvZmlsZT8ucGhvbmVfbnVtYmVyIHx8IGRhdGE/LnByb2ZpbGU/LnBob25lIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI3NjaG9vbD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEzODoxN1wiPnt7IGRhdGE/LlVzZXJQcm9maWxlPy51bml2ZXJzaXR5X25hbWUgfHwgZGF0YT8ucHJvZmlsZT8udW5pdmVyc2l0eV9uYW1lIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI3llYXI9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNDE6MTdcIj57eyBnZXRZZWFyTGFiZWwoZGF0YT8uVXNlclByb2ZpbGU/LnVuaXZlcnNpdHlfeWVhciB8fCBkYXRhPy5wcm9maWxlPy51bml2ZXJzaXR5X3llYXIpIH19PC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICNhY3Rpb249XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxCYXNlQWN0aW9uTWVudSA6aXRlbXM9XCJnZXRBY3Rpb25JdGVtcyhkYXRhKVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNDU6MTdcIiAvPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgPC9CYXNlVGFibGU+XG4gICAgPC9kaXY+XG5cbiAgICA8QmFzZURyYXdlciB2LW1vZGVsPVwic2hvd1VzZXJEZXRhaWxcIiB0aXRsZT1cIkRldGFpbHNcIiB3aWR0aD1cIjMwcmVtXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1MDo1XCI+XG4gICAgICAgIDxVc2VyRGV0YWlsVmlldyB2LWlmPVwic2hvd1VzZXJEZXRhaWxcIiA6dXNlcj1cInVzZXJEZXRhaWxcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTUxOjlcIiAvPlxuICAgIDwvQmFzZURyYXdlcj5cblxuICAgIDxCYXNlTW9kYWwgdi1tb2RlbD1cInNob3dSZXNldE1vZGFsXCIgdGl0bGU9XCJSZXNldCBQYXNzd29yZFwiIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNTQ6NVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU1OjlcIj5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwibWItNCBmdy1tZWRpdW0gdGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNTY6MTNcIj5BcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQgdGhpcyB1c2VyJ3MgcGFzc3dvcmQ/PC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBnYXAtMlwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNTc6MTNcIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiB2YXJpYW50PVwib3V0bGluZS13YXJuaW5nXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleC1ncm93LTFcIlxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjYW5jZWxSZXNldFBhc3N3b3JkKClcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU4OjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiB2YXJpYW50PVwid2FybmluZ1wiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgtZ3Jvdy0xXCIgQGNsaWNrPVwiY29uZmlybVJlc2V0UGFzc3dvcmQoKVwiIDppc0xvYWRpbmc9XCJpc1Jlc2V0aW5nXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE2MjoxN1wiPlxuICAgICAgICAgICAgICAgICAgICB7eyBpc1Jlc2V0aW5nID8gJ1Jlc2V0aW5nLi4uJyA6ICdSZXNldCBOb3cnIH19XG4gICAgICAgICAgICAgICAgPC9CYXNlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvQmFzZU1vZGFsPlxuXG4gICAgPEJhc2VNb2RhbCB2LW1vZGVsPVwic2hvd1N0YXR1c01vZGFsXCIgOnRpdGxlPVwidGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmUgPyAnRGVhY3RpdmF0ZSBVc2VyJyA6ICdBY3RpdmF0ZSBVc2VyJ1wiIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNjk6NVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTcwOjlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYi0zIGQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGp1c3RpZnktY29udGVudC1jZW50ZXIgcm91bmRlZC1jaXJjbGVcIiBcbiAgICAgICAgICAgICAgICAgOmNsYXNzPVwidGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmUgPyAnYmctZGFuZ2VyLXN1YnRsZSB0ZXh0LWRhbmdlcicgOiAnYmctc3VjY2Vzcy1zdWJ0bGUgdGV4dC1zdWNjZXNzJ1wiIFxuICAgICAgICAgICAgICAgICBzdHlsZT1cIndpZHRoOiA2MHB4OyBoZWlnaHQ6IDYwcHg7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3MToxM1wiPlxuICAgICAgICAgICAgICAgIDxYIHYtaWY9XCJ0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZVwiIDpzaXplPVwiMjhcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTc0OjE3XCIgLz5cbiAgICAgICAgICAgICAgICA8Q2hlY2sgdi1lbHNlIDpzaXplPVwiMjhcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTc1OjE3XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJtYi00IGZ3LW1lZGl1bSB0ZXh0LW11dGVkXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3NzoxM1wiPlxuICAgICAgICAgICAgICAgIEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byB7eyB0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZSA/ICdkZWFjdGl2YXRlJyA6ICdhY3RpdmF0ZScgfX1cbiAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzPVwidGV4dC1iYXNlXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3OToxN1wiPnt7IHRhcmdldFN0YXR1c1VzZXI/LmZpcnN0TmFtZSB9fSB7eyB0YXJnZXRTdGF0dXNVc2VyPy5sYXN0TmFtZSB9fTwvc3Ryb25nPj9cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggZ2FwLTJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTgxOjEzXCI+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gOnZhcmlhbnQ9XCJ0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZSA/ICdvdXRsaW5lLWRhbmdlcicgOiAnb3V0bGluZS1zdWNjZXNzJ1wiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgtZ3Jvdy0xXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwic2hvd1N0YXR1c01vZGFsID0gZmFsc2VcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTgyOjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiA6dmFyaWFudD1cInRhcmdldFN0YXR1c1VzZXI/LmlzQWN0aXZlID8gJ2RhbmdlcicgOiAnc3VjY2VzcydcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiIFxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjb25maXJtU3RhdHVzQ2hhbmdlKClcIiA6aXMtTG9hZGluZz1cImlzVXBkYXRpbmdTdGF0dXNcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTg2OjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIHt7IGlzVXBkYXRpbmdTdGF0dXMgPyAnVXBkYXRpbmcuLi4nIDogKHRhcmdldFN0YXR1c1VzZXI/LmlzQWN0aXZlID8gJ0RlYWN0aXZhdGUgTm93JyA6ICdBY3RpdmF0ZSBOb3cnKSB9fVxuICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L0Jhc2VNb2RhbD5cblxuICAgIDxCYXNlTW9kYWwgdi1tb2RlbD1cInNob3dDaGFuZ2VSb2xlTW9kYWxcIiB0aXRsZT1cIkNoYW5nZSBSb2xlXCIgc2l6ZT1cInNtXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE5NDo1XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTU6OVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1iLTMgZC1pbmxpbmUtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIganVzdGlmeS1jb250ZW50LWNlbnRlciByb3VuZGVkLWNpcmNsZSBiZy1pbmZvLXN1YnRsZSB0ZXh0LWluZm9cIiBcbiAgICAgICAgICAgICAgICAgc3R5bGU9XCJ3aWR0aDogNjBweDsgaGVpZ2h0OiA2MHB4O1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTY6MTNcIj5cbiAgICAgICAgICAgICAgICA8R3JhZHVhdGlvbkNhcCB2LWlmPVwidGFyZ2V0Q2hhbmdlUm9sZUlkID09PSA0XCIgOnNpemU9XCIyOFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTg6MTdcIiAvPlxuICAgICAgICAgICAgICAgIDxVc2VyIHYtZWxzZSA6c2l6ZT1cIjI4XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE5OToxN1wiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwibWItNCBmdy1tZWRpdW0gdGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDE6MTNcIj5cbiAgICAgICAgICAgICAgICBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gY2hhbmdlIHJvbGUgdG8gXG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cInRleHQtYmFzZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDM6MTdcIj57eyB0YXJnZXRDaGFuZ2VSb2xlSWQgPT09IDQgPyAnU3R1ZGVudCcgOiAnTW9uaycgfX08L3N0cm9uZz4/XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGdhcC0yXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjIwNToxM1wiPlxuICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIHZhcmlhbnQ9XCJvdXRsaW5lLXNlY29uZGFyeVwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgtZ3Jvdy0xXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwic2hvd0NoYW5nZVJvbGVNb2RhbCA9IGZhbHNlXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjIwNjoxN1wiPlxuICAgICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gdmFyaWFudD1cImluZm9cIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMSB0ZXh0LXdoaXRlXCIgXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz1cImNvbmZpcm1DaGFuZ2VSb2xlKClcIiA6aXMtTG9hZGluZz1cImlzQ2hhbmdpbmdSb2xlXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjIxMDoxN1wiPlxuICAgICAgICAgICAgICAgICAgICB7eyBpc0NoYW5naW5nUm9sZSA/ICdVcGRhdGluZy4uLicgOiAnQ2hhbmdlIE5vdycgfX1cbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9CYXNlTW9kYWw+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0IHNldHVwPlxuY29uc3QgZW1pdCA9IGRlZmluZUVtaXRzKFsnbmV3JywgJ2VkaXQnLCAnaW1wb3J0JywgJ3ByZXZpZXctYnVsayddKTtcbmltcG9ydCB7IHVzZVVzZXJTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL3VzZXJzL3VzZXIuanMnO1xuaW1wb3J0IHsgb25Nb3VudGVkLCByZWYsIGNvbXB1dGVkLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XG5pbXBvcnQgeyBmb3JtYXREYXRlIH0gZnJvbSAnQC91dGlscy9kYXRlRm9ybWF0JztcbmltcG9ydCB7IEJhZGdlQ2hlY2ssIEluZm8sIFVzZXIsIEtleVJvdW5kLCBTZWFyY2gsIEZpbGVEb3duLCBDaGVjaywgWCwgQm9va09wZW4sIEdyYWR1YXRpb25DYXAgfSBmcm9tICdAbHVjaWRlL3Z1ZSc7XG5pbXBvcnQgVXNlckRldGFpbFZpZXcgZnJvbSAnLi9Vc2VyRGV0YWlsVmlldy52dWUnO1xuaW1wb3J0IHsgdXNlQXV0aFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXV0aC5qcyc7XG5pbXBvcnQgeyB1c2VUb2FzdFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvdG9hc3QuanMnO1xuaW1wb3J0IHsgdXNlVXNlckxpc3QgfSBmcm9tICdAL2NvbXBvc2FibGVzL3VzZXJzL3VzZVVzZXJMaXN0LmpzJztcbmltcG9ydCBQYXBhIGZyb20gJ3BhcGFwYXJzZSc7XG5cbmltcG9ydCBhcGkgZnJvbSAnQC9hcGkvYXBpLmpzJztcblxuY29uc3QgdXNlclN0b3JlID0gdXNlVXNlclN0b3JlKCk7XG5jb25zdCBhdXRoU3RvcmUgPSB1c2VBdXRoU3RvcmUoKTtcbmNvbnN0IHRvYXN0U3RvcmUgPSB1c2VUb2FzdFN0b3JlKCk7XG5cbmNvbnN0IHVzZXJMaXN0UmVzdWx0ID0gdXNlVXNlckxpc3QodXNlclN0b3JlLCBhdXRoU3RvcmUsIHRvYXN0U3RvcmUpO1xuY29uc29sZS5sb2coJ3VzZXJMaXN0UmVzdWx0OicsIHVzZXJMaXN0UmVzdWx0KTtcbmNvbnN0IHtcbiAgICBzaG93UmVzZXRNb2RhbCxcbiAgICBzaG93VXNlckRldGFpbCxcbiAgICB1c2VyRGV0YWlsLFxuICAgIGlzTG9hZGluZyxcbiAgICBvblZpZXdEZXRhaWwsXG4gICAgb25SZXNldFBhc3N3b3JkLFxuICAgIGhhbmRsZVJlc2V0UGFzc3dvcmQsXG4gICAgb25DYW5jZWxSZXNldCxcbiAgICBzZWFyY2hBbmRGaWx0ZXJcbn0gPSB1c2VyTGlzdFJlc3VsdDtcbmNvbnNvbGUubG9nKCdzZWFyY2hBbmRGaWx0ZXI6Jywgc2VhcmNoQW5kRmlsdGVyKTtcblxuY29uc3QgYWN0aXZlRmlsdGVyID0gY29tcHV0ZWQoe1xuICAgIGdldDogKCkgPT4gc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUucm9sZUlkLFxuICAgIHNldDogKHZhbCkgPT4ge1xuICAgICAgICBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5yb2xlSWQgPSB2YWw7XG4gICAgfVxufSk7XG5cbmNvbnN0IGt1dHMgPSByZWYoW10pO1xuY29uc3Qga3V0T3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICBjb25zdCBzb3J0ZWRLdXRzID0gWy4uLmt1dHMudmFsdWVdLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgY29uc3QgbnVtQSA9IHBhcnNlSW50KGEubmFtZS5yZXBsYWNlKC9cXEQvZywgJycpLCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgbnVtQiA9IHBhcnNlSW50KGIubmFtZS5yZXBsYWNlKC9cXEQvZywgJycpLCAxMCkgfHwgMDtcbiAgICAgICAgaWYgKG51bUEgIT09IG51bUIpIHJldHVybiBudW1BIC0gbnVtQjtcbiAgICAgICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgeyBsYWJlbDogJ0t1ZGkgLyDhnoDhnrvhnorhnrfhnpHhnrbhn4bhnoThnqLhnp/hn4snLCB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAuLi5zb3J0ZWRLdXRzLm1hcChrID0+ICh7XG4gICAgICAgICAgICBsYWJlbDogay5uYW1lLFxuICAgICAgICAgICAgdmFsdWU6IGsuaWRcbiAgICAgICAgfSkpXG4gICAgXTtcbn0pO1xuXG5vbk1vdW50ZWQoYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGFwaS5nZXQoJy9rdXRzJyk7XG4gICAgICAgIGlmIChyZXMuZGF0YT8uc3VjY2Vzcykge1xuICAgICAgICAgICAga3V0cy52YWx1ZSA9IHJlcy5kYXRhLmRhdGE7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIGt1dHNcIiwgZXJyb3IpO1xuICAgIH1cbn0pO1xuXG5jb25zdCBoYXNBY3RpdmVGaWx0ZXJzID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgIHJldHVybiAhIXNlYXJjaEFuZEZpbHRlci5zZWFyY2hRdWVyeS52YWx1ZSB8fCBcbiAgICAgICAgICAgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUuaXNBY3RpdmUgIT09IG51bGwgfHwgXG4gICAgICAgICAgIHNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLnJvbGVJZCAhPT0gbnVsbCB8fFxuICAgICAgICAgICBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5rdXRJZCAhPT0gbnVsbDtcbn0pO1xuXG5jb25zdCByZXNldEZpbHRlcnMgPSAoKSA9PiB7XG4gICAgc2VhcmNoQW5kRmlsdGVyLnNlYXJjaFF1ZXJ5LnZhbHVlID0gJyc7XG4gICAgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUuaXNBY3RpdmUgPSBudWxsO1xuICAgIHNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLnJvbGVJZCA9IG51bGw7XG4gICAgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUua3V0SWQgPSBudWxsO1xufTtcblxuY29uc3QgY3N2SW5wdXRSZWYgPSByZWYobnVsbCk7XG5cbmNvbnN0IHRyaWdnZXJGaWxlSW5wdXQgPSAoKSA9PiB7XG4gICAgaWYgKGNzdklucHV0UmVmLnZhbHVlKSB7XG4gICAgICAgIGNzdklucHV0UmVmLnZhbHVlLmNsaWNrKCk7XG4gICAgfVxufTtcblxuY29uc3Qgb25GaWxlU2VsZWN0ZWQgPSAoZSkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcblxuICAgIGlmIChmaWxlLnR5cGUgIT09ICd0ZXh0L2NzdicgJiYgIWZpbGUubmFtZS5lbmRzV2l0aCgnLmNzdicpKSB7XG4gICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KCdPbmx5IENTViBmaWxlcyBhcmUgYWxsb3dlZC4nLCAnZGFuZ2VyJyk7XG4gICAgICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBQYXBhLnBhcnNlKGZpbGUsIHtcbiAgICAgICAgaGVhZGVyOiB0cnVlLFxuICAgICAgICBza2lwRW1wdHlMaW5lczogdHJ1ZSxcbiAgICAgICAgY29tcGxldGU6IChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdG9hc3RTdG9yZS5zaG93VG9hc3QoJ0Vycm9yIHBhcnNpbmcgQ1NWIGZpbGUuJywgJ2RhbmdlcicpO1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBraG1lclRvRW5nbGlzaERpZ2l0cyA9IChzdHIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgICfhn6AnOiAnMCcsICfhn6EnOiAnMScsICfhn6InOiAnMicsICfhn6MnOiAnMycsICfhn6QnOiAnNCcsXG4gICAgICAgICAgICAgICAgICAgICfhn6UnOiAnNScsICfhn6YnOiAnNicsICfhn6cnOiAnNycsICfhn6gnOiAnOCcsICfhn6knOiAnOSdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvW+GfoC3hn6ldL2csIG0gPT4gbWFwW21dKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGdldEtobWVyTW9udGhOdW1iZXIgPSAobW9udGhTdHIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb250aHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICfhnpjhnoDhnprhnrYnOiAnMDEnLCAn4Z6A4Z674Z6Y4Z+S4Z6X4Z+IJzogJzAyJywgJ+GemOGeuOGek+Getic6ICcwMycsICfhnpjhn4Hhnp/hnrYnOiAnMDQnLFxuICAgICAgICAgICAgICAgICAgICAn4Z6n4Z6f4Z6X4Z62JzogJzA1JywgJ+GemOGet+GekOGeu+Gek+Getic6ICcwNicsICfhnoDhnoDhn5LhnoDhnorhnrYnOiAnMDcnLCAn4Z6f4Z644Z6g4Z62JzogJzA4JyxcbiAgICAgICAgICAgICAgICAgICAgJ+GegOGeieGfkuGeieGetic6ICcwOScsICfhno/hnrvhnpvhnrYnOiAnMTAnLCAn4Z6c4Z634Z6F4Z+S4Z6G4Z634Z6A4Z62JzogJzExJywgJ+GekuGfkuGek+GevCc6ICcxMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbSBpbiBtb250aHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vbnRoU3RyLmluY2x1ZGVzKG0pKSByZXR1cm4gbW9udGhzW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbmRWYWwgPSAocm93LCBrZXl3b3JkcywgZXhjbHVkZUtleXdvcmRzID0gW10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocm93KTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsZWFuS2V5ID0ga2V5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBpZiBrZXkgbWF0Y2hlcyBhbnkgZXhjbHVzaW9uIGtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXggb2YgZXhjbHVkZUtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xlYW5LZXkuaW5jbHVkZXMoZXgudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGt3IG9mIGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xlYW5LZXkuaW5jbHVkZXMoa3cudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm93W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1c2VycyA9IHJlc3VsdHMuZGF0YVxuICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMS4gUGFyc2UgTmFtZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lVmFsID0gZmluZFZhbChyb3csIFsn4Z6C4Z+E4Z6P4Z+S4Z6P4Z6T4Z624Z6YLeGek+GetuGemCcsICdmdWxsIG5hbWUnLCAnbmFtZScsICfhnojhn5Lhnpjhn4Thn4cnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdE5hbWUgPSBmaW5kVmFsKHJvdywgWydmaXJzdE5hbWUnLCAnZmlyc3ROYW1lS2gnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYXN0TmFtZSA9IGZpbmRWYWwocm93LCBbJ2xhc3ROYW1lJywgJ2xhc3ROYW1lS2gnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZVZhbCAmJiAhZmlyc3ROYW1lICYmICFsYXN0TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSBTdHJpbmcobmFtZVZhbCkudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lID0gcGFydHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lID0gcGFydHMuc2xpY2UoMSkuam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZSA9IHBhcnRzWzBdIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gMi4gUGFyc2UgRGF0ZSBvZiBCaXJ0aFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByYXdEb2IgPSBmaW5kVmFsKHJvdywgWyfhnpDhn5LhnoThn4PhnoHhn4Lhnobhn5LhnpPhnrbhn4bhnoDhn4bhno7hnr7hno8nLCAnZGF0ZSBvZiBiaXJ0aCcsICdkb2InLCAn4Z6A4Z+G4Z6O4Z6+4Z6PJ10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZG9iID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhd0RvYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZERvYiA9IGtobWVyVG9FbmdsaXNoRGlnaXRzKFN0cmluZyhyYXdEb2IpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGNsZWFuZWREb2Iuc3BsaXQoL1tcXHNcXC5cXC1cXC9dKy8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXkgPSBwYXJ0c1swXS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb250aCA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB5ZWFyID0gcGFydHNbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2hNb250aCA9IGdldEtobWVyTW9udGhOdW1iZXIobW9udGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChraE1vbnRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoID0ga2hNb250aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb250aCA9IG1vbnRoLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHllYXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh5ZWFyLCAxMCkgPiA1MCA/ICcxOScgKyB5ZWFyIDogJzIwJyArIHllYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh5ZWFyLmxlbmd0aCA9PT0gNCAmJiAhaXNOYU4oZGF5KSAmJiAhaXNOYU4obW9udGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvYiA9IGAke3llYXJ9LSR7bW9udGh9LSR7ZGF5fWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gMy4gUGFyc2UgT3RoZXIgRmllbGRzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaGF5YV9udW1iZXIgPSBmaW5kVmFsKHJvdywgWyfhnpvhn4HhnoHhnobhnrbhnpnhnrYnLCAn4LmA4Lil4LiC4LiJ4Liy4Lii4LiyJywgJ+Gem+GfgeGegeGeouGej+GfkuGej+Gen+GeieGfkuGeieGetuGejuGelOGfkOGejuGfkuGejicsICfhnqLhno/hn5Lhno/hnp/hnonhn5Lhnonhnrbhno4nLCAnY2hoYXlhJywgJ+GehuGetuGemeGeticsICdpZCBudW1iZXInXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBob25lX251bWJlciA9IGZpbmRWYWwocm93LCBbJ+Gem+GfgeGegeGekeGevOGemuGen+GfkOGeluGfkuGekScsICdwaG9uZScsICfhnpHhnrzhnprhnp/hn5Dhnpbhn5LhnpEnLCAn4Z6R4Z684Z6a4Z6f4Z6W4Z+S4Z6RJ10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml2ZXJzaXR5X25hbWUgPSBmaW5kVmFsKHJvdywgWyfhnprhn4DhnpPhnpPhn4UnLCAnc2Nob29sJywgJ3VuaXZlcnNpdHknLCAn4Z6f4Z624Z6b4Z62J10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml2ZXJzaXR5X3llYXIgPSBmaW5kVmFsKHJvdywgWyfhnobhn5LhnpPhnrbhn4bhnpHhnrgnLCAneWVhciddLCBbJ+GegOGfhuGejuGevuGejycsICdiaXJ0aCddKSB8fCAnJzsgLy8gRXhjbHVkZSBnZW5lcmljIFwiYmlydGgvYmlydGhkYXRlXCIga2V5d29yZHMgZnJvbSB5ZWFyIGZpZWxkXG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbXVuZSA9IGZpbmRWYWwocm93LCBbJ+Geg+Geu+GfhicsICdjb21tdW5lJ10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXN0cmljdCA9IGZpbmRWYWwocm93LCBbJ+Gen+GfkuGemuGeu+GegCcsICdkaXN0cmljdCddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvdmluY2UgPSBmaW5kVmFsKHJvdywgWyfhnoHhn4Hhno/hn5Lhno8nLCAncHJvdmluY2UnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyb21fd2F0ID0gZmluZFZhbChyb3csIFsn4Z6Y4Z6A4Z6W4Z644Z6c4Z6P4Z+S4Z6PJywgJ2Zyb21fd2F0JywgJ3dhdCcsICfhnpzhno/hn5Lhno8nXSkgfHwgJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke2xhc3ROYW1lfSAke2ZpcnN0TmFtZX1gLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogZmlyc3ROYW1lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiBsYXN0TmFtZS50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2IsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGhheWFfbnVtYmVyOiBjaGhheWFfbnVtYmVyLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lX251bWJlcjogcGhvbmVfbnVtYmVyLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNpdHlfbmFtZTogdW5pdmVyc2l0eV9uYW1lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNpdHlfeWVhcjogdW5pdmVyc2l0eV95ZWFyLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21fd2F0OiBmcm9tX3dhdC50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tdW5lOiBjb21tdW5lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RyaWN0OiBkaXN0cmljdC50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aW5jZTogcHJvdmluY2UudHJpbSgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHUgPT4gdS5maXJzdE5hbWUgJiYgdS5sYXN0TmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdCgnTm8gdmFsaWQgdXNlcnMgY29udGFpbmluZyBuYW1lIGZvdW5kIGluIENTVi4nLCAnZGFuZ2VyJyk7XG4gICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVzZXJTdG9yZS5wYXJzZWRCdWxrVXNlcnMgPSB1c2VycztcbiAgICAgICAgICAgIGVtaXQoJ3ByZXZpZXctYnVsaycpO1xuICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KCdFcnJvciByZWFkaW5nIHRoZSBmaWxlLicsICdkYW5nZXInKTtcbiAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmNvbnN0IGZpbHRlck9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFtcbiAgICAgICAgeyBsYWJlbDogJ0FsbCBVc2VycycsIHZhbHVlOiBudWxsLCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1snYWxsJ10sIHZhcmlhbnQ6ICdwcmltYXJ5JyB9XG4gICAgXTtcbiAgICBcbiAgICBpZiAoYXV0aFN0b3JlLmlzU3VwZXJBZG1pbikge1xuICAgICAgICBvcHRpb25zLnB1c2goeyBsYWJlbDogJ+GemOGfgeGegOGeu+GeiuGetycsIHZhbHVlOiAyLCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1syXSwgdmFyaWFudDogJ3N1Y2Nlc3MnIH0pO1xuICAgIH1cbiAgICBcbiAgICBvcHRpb25zLnB1c2goXG4gICAgICAgIHsgbGFiZWw6ICfhnpfhnrfhnoDhn5LhnoHhnrsnLCB2YWx1ZTogNywgYmFkZ2U6IHVzZXJTdG9yZS5yb2xlU3RhdHNbN10sIHZhcmlhbnQ6ICd3YXJuaW5nJyB9LFxuICAgICAgICB7IGxhYmVsOiAn4Z6f4Z624Z6Y4Z6O4Z+B4Z6aJywgdmFsdWU6IDMsIGJhZGdlOiB1c2VyU3RvcmUucm9sZVN0YXRzWzNdLCB2YXJpYW50OiAnaW5mbycgfSxcbiAgICAgICAgeyBsYWJlbDogJ+Gen+Get+Gen+GfkuGen+Gek+Get+Gen+GfkuGen+Get+GejycsIHZhbHVlOiA0LCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1s0XSwgdmFyaWFudDogJ3NlY29uZGFyeScgfVxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59KTtcblxuY29uc3Qgc3RhdHVzT3B0aW9ucyA9IHJlZihbXG4gICAgeyBsYWJlbDogJ0FsbCBTdGF0dXMnLCB2YWx1ZTogbnVsbCB9LFxuICAgIHsgbGFiZWw6ICdBY3RpdmUnLCB2YWx1ZTogdHJ1ZSB9LFxuICAgIHsgbGFiZWw6ICdJbmFjdGl2ZScsIHZhbHVlOiBmYWxzZSB9XG5dKTtcblxuY29uc3QgZ2V0Um9sZVZhcmlhbnQgPSAocm9sZUlkKSA9PiB7XG4gICAgc3dpdGNoKHJvbGVJZCkge1xuICAgICAgICBjYXNlIDE6IHJldHVybiAnZGFuZ2VyJzsgLy8gU3VwZXJBZG1pblxuICAgICAgICBjYXNlIDI6IHJldHVybiAnc3VjY2Vzcyc7IC8vIEFkbWluL01la3VkaVxuICAgICAgICBjYXNlIDM6IHJldHVybiAnaW5mbyc7IC8vIE1vbmtcbiAgICAgICAgY2FzZSA0OiByZXR1cm4gJ3NlY29uZGFyeSc7IC8vIFN0dWRlbnRcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuICdzZWNvbmRhcnknO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldFJvbGVJY29uID0gKHJvbGVJZCkgPT4ge1xuICAgIHN3aXRjaChyb2xlSWQpIHtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gQmFkZ2VDaGVjaztcbiAgICAgICAgY2FzZSAyOiByZXR1cm4gQm9va09wZW47XG4gICAgICAgIGNhc2UgMzogcmV0dXJuIFVzZXI7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBVc2VyO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldFVzZXJSb3dDbGFzcyA9IChkYXRhKSA9PiB7XG4gICAgcmV0dXJuIChkYXRhICYmIGRhdGEuaWQgJiYgZGF0YS5pc0FjdGl2ZSA9PT0gZmFsc2UpID8gJ3Jvdy1ib3JkZXItc2Vjb25kYXJ5IG9wYWNpdHktNzUnIDogJyc7XG59O1xuXG5jb25zdCBpc1Jlc2V0aW5nID0gcmVmKGZhbHNlKTtcblxuY29uc3QgdG9nZ2xlUmVzZXQgPSAoZXZlbnQsIGlkKSA9PiB7XG4gICAgb25SZXNldFBhc3N3b3JkKGlkKTtcbiAgICBzaG93UmVzZXRNb2RhbC52YWx1ZSA9IHRydWU7XG59XG5cbmNvbnN0IGdldEFjdGlvbkl0ZW1zID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBpdGVtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdWaWV3IERldGFpbHMnLFxuICAgICAgICAgICAgaWNvbjogSW5mbyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICgpID0+IG9uVmlld0RldGFpbChkYXRhKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IGRhdGEuaXNBY3RpdmUgPyAnRGVhY3RpdmF0ZSBVc2VyJyA6ICdBY3RpdmF0ZSBVc2VyJyxcbiAgICAgICAgICAgIGljb246IGRhdGEuaXNBY3RpdmUgPyBYIDogQ2hlY2ssXG4gICAgICAgICAgICBjb21tYW5kOiAoKSA9PiBwcm9tcHRUb2dnbGVTdGF0dXMoZGF0YSksXG4gICAgICAgICAgICBpY29uQ2xhc3M6IGRhdGEuaXNBY3RpdmUgPyAndGV4dC1kYW5nZXInIDogJ3RleHQtc3VjY2VzcydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdSZXNldCBQYXNzd29yZCcsXG4gICAgICAgICAgICBpY29uOiBLZXlSb3VuZCxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICh7IG9yaWdpbmFsRXZlbnQgfSkgPT4gdG9nZ2xlUmVzZXQob3JpZ2luYWxFdmVudCwgZGF0YS5pZCksXG4gICAgICAgICAgICBpY29uQ2xhc3M6ICd0ZXh0LXdhcm5pbmcnXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgaWYgKChhdXRoU3RvcmUuaXNBZG1pbiB8fCBhdXRoU3RvcmUuaXNTdXBlckFkbWluKSAmJiBkYXRhLnJvbGUpIHtcbiAgICAgICAgaWYgKGRhdGEucm9sZS5pZCA9PT0gMyB8fCBkYXRhLnJvbGUuaWQgPT09IDcpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ2hhbmdlIHRvIFN0dWRlbnQnLFxuICAgICAgICAgICAgICAgIGljb246IEdyYWR1YXRpb25DYXAsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogKCkgPT4gcHJvbXB0Q2hhbmdlUm9sZShkYXRhLCA0KSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICd0ZXh0LWluZm8nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnJvbGUuaWQgPT09IDQpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ2hhbmdlIHRvIE1vbmsnLFxuICAgICAgICAgICAgICAgIGljb246IFVzZXIsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogKCkgPT4gcHJvbXB0Q2hhbmdlUm9sZShkYXRhLCAzKSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICd0ZXh0LWluZm8nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbn07XG5cbmNvbnN0IGNvbmZpcm1SZXNldFBhc3N3b3JkID0gYXN5bmMgKCkgPT4ge1xuICAgIGlzUmVzZXRpbmcudmFsdWUgPSB0cnVlO1xuICAgIGF3YWl0IGhhbmRsZVJlc2V0UGFzc3dvcmQoKTtcbiAgICBpc1Jlc2V0aW5nLnZhbHVlID0gZmFsc2U7XG4gICAgc2hvd1Jlc2V0TW9kYWwudmFsdWUgPSBmYWxzZTtcbn1cblxuY29uc3QgY2FuY2VsUmVzZXRQYXNzd29yZCA9ICgpID0+IHtcbiAgICBvbkNhbmNlbFJlc2V0KCk7XG4gICAgc2hvd1Jlc2V0TW9kYWwudmFsdWUgPSBmYWxzZTtcbn1cblxuY29uc3Qgc2hvd1N0YXR1c01vZGFsID0gcmVmKGZhbHNlKTtcbmNvbnN0IHRhcmdldFN0YXR1c1VzZXIgPSByZWYobnVsbCk7XG5jb25zdCBpc1VwZGF0aW5nU3RhdHVzID0gcmVmKGZhbHNlKTtcblxuY29uc3Qgc2hvd0NoYW5nZVJvbGVNb2RhbCA9IHJlZihmYWxzZSk7XG5jb25zdCB0YXJnZXRDaGFuZ2VSb2xlVXNlciA9IHJlZihudWxsKTtcbmNvbnN0IHRhcmdldENoYW5nZVJvbGVJZCA9IHJlZihudWxsKTtcbmNvbnN0IGlzQ2hhbmdpbmdSb2xlID0gcmVmKGZhbHNlKTtcblxuY29uc3QgcHJvbXB0Q2hhbmdlUm9sZSA9IChkYXRhLCByb2xlSWQpID0+IHtcbiAgICBjb25zdCBpc0N1cnJlbnRVc2VyID0gKGF1dGhTdG9yZT8udXNlcj8uaWQgPT09IGRhdGE/LmlkKTtcbiAgICBpZiAoaXNDdXJyZW50VXNlcikge1xuICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdChcIkNhbm5vdCBjaGFuZ2UgeW91ciBvd24gcm9sZSBoZXJlXCIsICd3YXJuaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGFyZ2V0Q2hhbmdlUm9sZVVzZXIudmFsdWUgPSBkYXRhO1xuICAgIHRhcmdldENoYW5nZVJvbGVJZC52YWx1ZSA9IHJvbGVJZDtcbiAgICBzaG93Q2hhbmdlUm9sZU1vZGFsLnZhbHVlID0gdHJ1ZTtcbn07XG5cbmNvbnN0IGNvbmZpcm1DaGFuZ2VSb2xlID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdGFyZ2V0Q2hhbmdlUm9sZVVzZXIudmFsdWUgfHwgIXRhcmdldENoYW5nZVJvbGVJZC52YWx1ZSkgcmV0dXJuO1xuICAgIGNvbnN0IGRhdGEgPSB0YXJnZXRDaGFuZ2VSb2xlVXNlci52YWx1ZTtcbiAgICBcbiAgICBpc0NoYW5naW5nUm9sZS52YWx1ZSA9IHRydWU7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXNlclN0b3JlLmNoYW5nZVVzZXJSb2xlKGRhdGEuaWQsIHRhcmdldENoYW5nZVJvbGVJZC52YWx1ZSk7XG4gICAgaXNDaGFuZ2luZ1JvbGUudmFsdWUgPSBmYWxzZTtcblxuICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgc2hvd0NoYW5nZVJvbGVNb2RhbC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpbmRleCA9IHVzZXJTdG9yZS51c2Vycy5maW5kSW5kZXgodSA9PiB1LmlkID09PSBkYXRhLmlkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgdXNlclN0b3JlLnVzZXJzW2luZGV4XS5yb2xlID0gcmVzdWx0LmRhdGE/LlJvbGUgfHwgcmVzdWx0LmRhdGE/LnJvbGU7XG4gICAgICAgICAgICB1c2VyU3RvcmUudXNlcnNbaW5kZXhdLnJvbGVfaWQgPSB0YXJnZXRDaGFuZ2VSb2xlSWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBwcm9tcHRUb2dnbGVTdGF0dXMgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IGlzQ3VycmVudFVzZXIgPSAoYXV0aFN0b3JlPy51c2VyPy5pZCA9PT0gZGF0YT8uaWQpICYmIChhdXRoU3RvcmU/LnVzZXI/LnJvbGU/LmlkID09PSAxKTtcbiAgICBpZiAoaXNDdXJyZW50VXNlcikge1xuICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdChcIkNhbm5vdCB1cGRhdGUgY3VycmVudCB1c2VyJ3Mgc3RhdHVzXCIsICd3YXJuaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGFyZ2V0U3RhdHVzVXNlci52YWx1ZSA9IGRhdGE7XG4gICAgc2hvd1N0YXR1c01vZGFsLnZhbHVlID0gdHJ1ZTtcbn07XG5cbmNvbnN0IGNvbmZpcm1TdGF0dXNDaGFuZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF0YXJnZXRTdGF0dXNVc2VyLnZhbHVlKSByZXR1cm47XG4gICAgY29uc3QgZGF0YSA9IHRhcmdldFN0YXR1c1VzZXIudmFsdWU7XG4gICAgXG4gICAgaXNVcGRhdGluZ1N0YXR1cy52YWx1ZSA9IHRydWU7XG5cbiAgICBjb25zdCBvcmlnaW5hbFN0YXR1cyA9IGRhdGEuaXNBY3RpdmU7XG4gICAgY29uc3QgbmV3U3RhdHVzID0gIW9yaWdpbmFsU3RhdHVzO1xuXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgaXNfYWN0aXZlOiBuZXdTdGF0dXNcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXNlclN0b3JlLnVwZGF0ZVVzZXIoZGF0YS5pZCwgcGF5bG9hZCk7XG5cbiAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICBkYXRhLmlzQWN0aXZlID0gbmV3U3RhdHVzO1xuICAgICAgICB1c2VyU3RvcmUuZmV0Y2hSb2xlU3RhdHModHJ1ZSwgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUuaXNBY3RpdmUpO1xuICAgIH1cblxuICAgIGlzVXBkYXRpbmdTdGF0dXMudmFsdWUgPSBmYWxzZTtcbiAgICBzaG93U3RhdHVzTW9kYWwudmFsdWUgPSBmYWxzZTtcbiAgICB0YXJnZXRTdGF0dXNVc2VyLnZhbHVlID0gbnVsbDtcbn07XG5cbm9uTW91bnRlZChhc3luYyAoKSA9PiB7XG4gICAgdXNlclN0b3JlLmZldGNoUm9sZVN0YXRzKHRydWUsIHNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLmlzQWN0aXZlKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHVzZXJTdG9yZS5nZXRBbGxVc2VycygpLFxuICAgICAgICB1c2VyU3RvcmUuZ2V0VXNlclJvbGVzKClcbiAgICBdKTtcbn0pO1xuXG53YXRjaCgoKSA9PiBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSwgKG5ld0lzQWN0aXZlKSA9PiB7XG4gICAgdXNlclN0b3JlLmZldGNoUm9sZVN0YXRzKHRydWUsIG5ld0lzQWN0aXZlKTtcbn0pO1xuXG5jb25zdCB5ZWFyT3B0aW9ucyA9IFtcbiAgICB7IGxhYmVsOiAnWWVhciAxJywgdmFsdWU6ICcxJyB9LFxuICAgIHsgbGFiZWw6ICdZZWFyIDInLCB2YWx1ZTogJzInIH0sXG4gICAgeyBsYWJlbDogJ1llYXIgMycsIHZhbHVlOiAnMycgfSxcbiAgICB7IGxhYmVsOiAnWWVhciA0JywgdmFsdWU6ICc0JyB9LFxuICAgIHsgbGFiZWw6ICdPdGhlcicsIHZhbHVlOiAnb3RoZXInIH1cbl07XG5cbmNvbnN0IGdldFllYXJMYWJlbCA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmICghdmFsdWUpIHJldHVybiAnLSc7XG4gICAgY29uc3Qgb3B0ID0geWVhck9wdGlvbnMuZmluZChvID0+IG8udmFsdWUgPT09IFN0cmluZyh2YWx1ZSkpO1xuICAgIHJldHVybiBvcHQgPyBvcHQubGFiZWwgOiB2YWx1ZTtcbn07XG5cbmNvbnN0IGNvbERlZnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgY29uc3QgY29scyA9IFtcbiAgICAgICAgeyBmaWVsZDogJ3VzZXJuYW1lJywgaGVhZGVyOiAnRnVsbCBOYW1lJyB9LFxuICAgICAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXI6ICdFbWFpbCBBZGRyZXNzJyB9XG4gICAgXTtcbiAgICBjb2xzLnB1c2goXG4gICAgICAgIHsgZmllbGQ6ICdrdXQnLCBoZWFkZXI6ICdLdWRpJyB9LFxuICAgICAgICB7IGZpZWxkOiAncm93QW5kU2VhdCcsIGhlYWRlcjogJ1Jvdy9TZWF0JyB9LFxuICAgICAgICB7IGZpZWxkOiAncGhvbmUnLCBoZWFkZXI6ICdQaG9uZSBOdW1iZXInIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzY2hvb2wnLCBoZWFkZXI6ICdTY2hvb2wgLyBVbml2ZXJzaXR5JyB9LFxuICAgICAgICB7IGZpZWxkOiAneWVhcicsIGhlYWRlcjogJ1llYXInIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhY3Rpb24nLCBoZWFkZXI6ICcnLCBzb3J0YWJsZTogZmFsc2UgfVxuICAgICk7XG4gICAgcmV0dXJuIGNvbHM7XG59KTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgc2NvcGVkPlxuLnVzZXItcHJvZmlsZS1hdmF0YXIge1xuICAgIHdpZHRoOiAzNXB4O1xuICAgIGhlaWdodDogMzVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zdXJmYWNlLWdyb3VuZCk7XG4gICAgYm9yZGVyLXJhZGl1czogNTBweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCkgc29saWQgdmFyKC0tYm9yZGVyLWNscik7XG59XG5cbi51c2VyLXByb2ZpbGUtYXZhdGFyIGltZyB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIG9iamVjdC1maXQ6IGNvdmVyO1xufVxuXG4uc3RhdHVzLXNlbGVjdCxcbi5zZWFyY2gtaW5wdXQsXG4ua3V0LXNlbGVjdCB7XG4gICAgd2lkdGg6IDEwMCU7XG59XG5cbkBtZWRpYSAobWluLXdpZHRoOiA1NzZweCkge1xuICAgIC5zdGF0dXMtc2VsZWN0IHtcbiAgICAgICAgd2lkdGg6IDEzMHB4O1xuICAgIH1cbiAgICAua3V0LXNlbGVjdCB7XG4gICAgICAgIHdpZHRoOiAxMzBweDtcbiAgICB9XG4gICAgLnNlYXJjaC1pbnB1dCB7XG4gICAgICAgIHdpZHRoOiAyNTBweDtcbiAgICB9XG59XG48L3N0eWxlPiJdLCJmaWxlIjoiL1ZvbHVtZXMvTXlGb2xkZXIvUGFnb2RhIE1hbmFnZW1hbnQvTW9ua01hbmFnZS9zcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZSJ9