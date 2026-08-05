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

const __returned__ = { emit, userStore, authStore, toastStore, showResetModal, showUserDetail, userDetail, isLoading, onViewDetail, onResetPassword, handleResetPassword, onCancelReset, searchAndFilter, activeFilter, kuts, kutOptions, hasActiveFilters, resetFilters, csvInputRef, triggerFileInput, onFileSelected, filterOptions, statusOptions, getRoleVariant, getRoleIcon, getUserRowClass, isReseting, toggleReset, getActionItems, confirmResetPassword, cancelResetPassword, showStatusModal, targetStatusUser, isUpdatingStatus, showChangeRoleModal, targetChangeRoleUser, targetChangeRoleId, isChangingRole, promptChangeRole, confirmChangeRole, promptToggleStatus, confirmStatusChange, yearOptions, getYearLabel, colDefs, get useUserStore() { return useUserStore }, onMounted, ref, computed, watch, get formatDate() { return formatDate }, get BadgeCheck() { return BadgeCheck }, get Info() { return Info }, get User() { return User }, get KeyRound() { return KeyRound }, get Search() { return Search }, get FileDown() { return FileDown }, get Check() { return Check }, get X() { return X }, get BookOpen() { return BookOpen }, get GraduationCap() { return GraduationCap }, UserDetailView, get useAuthStore() { return useAuthStore }, get useToastStore() { return useToastStore }, get useUserList() { return useUserList }, get Papa() { return Papa }, get api() { return api } }
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ3pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJO0FBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUN2RCxDQUFDLENBQUM7O0FBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzlDLENBQUM7O0FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzs7QUFFN0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7QUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNOztBQUVyQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVKLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSTtBQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSTtBQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDOUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzlFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDOUQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUM3QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztBQUN6RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUTs7QUFFMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7QUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUViLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDaEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTztBQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDMUYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNuRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkosQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7O0FBRWpLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVoRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUNoRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3ZELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQzs7QUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUk7QUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDeEYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9GLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTztBQUNsQixDQUFDLENBQUM7O0FBRUYsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDdEMsQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDOztBQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJO0FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDOztBQUVELEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEcsQ0FBQzs7QUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDOztBQUU3QixLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDL0I7O0FBRUEsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJO0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7QUFDN0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7QUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87QUFDcEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUTtBQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDL0UsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTztBQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUwsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWE7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO0FBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJO0FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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Q0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSTtBQUNoRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSztBQUNyRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7QUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNkLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDaEMsQ0FBQzs7QUFFRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTTtBQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUs7QUFDdkMsQ0FBQyxDQUFDLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTs7QUFFakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUTtBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYzs7QUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVMLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQzs7QUFFL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUztBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDOUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFSixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDakMsQ0FBQzs7QUFFRCxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDMUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDL0MsQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLENBQUM7O0FBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDbEMsQ0FBQzs7QUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUk7QUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxV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LGtCQUFnQixFQUFDOztnQ0FDM0UsQ0FBbUQ7a0RBQWhELHFCQUFjIiwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJVc2VyTGlzdFZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgICA8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc3VyZmFjZS1ncm91bmQpO1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyOjVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1iLTMgZC1mbGV4IGZsZXgtd3JhcCBmbGV4LWxnLW5vd3JhcCBhbGlnbi1pdGVtcy1jZW50ZXIganVzdGlmeS1jb250ZW50LWJldHdlZW4gZ2FwLTIgdy0xMDBcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Mzo5XCI+XG4gICAgICAgICAgICA8IS0tIExlZnQgU2lkZTogRmlsdGVycyAtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIHctMTAwIHctbGctYXV0b1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo1OjEzXCI+XG4gICAgICAgICAgICAgICAgPEJhc2VGaWx0ZXIgdi1tb2RlbD1cImFjdGl2ZUZpbHRlclwiIDpvcHRpb25zPVwiZmlsdGVyT3B0aW9uc1wiIDp3cmFwPVwidHJ1ZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo2OjE3XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8IS0tIFJpZ2h0IFNpZGU6IFNlYXJjaCwgU3RhdHVzLCBCdXR0b25zIC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBmbGV4LXdyYXAgZmxleC1tZC1ub3dyYXAgYWxpZ24taXRlbXMtY2VudGVyIGdhcC0yIGp1c3RpZnktY29udGVudC1lbmQgdy0xMDAgdy1sZy1hdXRvXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEwOjEzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1pbnB1dFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMToxN1wiPlxuICAgICAgICAgICAgICAgICAgICA8QmFzZUlucHV0IFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cInNlYXJjaEFuZEZpbHRlci5zZWFyY2hRdWVyeS52YWx1ZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdXNlcnMuLi5cIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIDpwcmVmaXhJY29uPVwiU2VhcmNoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyYWJsZSBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTI6MjFcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHVzLXNlbGVjdCBmbGV4LXNocmluay0wXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjIwOjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlU2VsZWN0IFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cInNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLmlzQWN0aXZlXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cInN0YXR1c09wdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTdGF0dXNcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MjE6MjFcIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI3ZhbHVlPVwic2xvdFByb3BzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VCYWRnZSB2LWlmPVwic2xvdFByb3BzLnZhbHVlID09PSB0cnVlXCIgc3RhdHVzPVwiQUNUSVZFXCIgcGlsbCBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Mjc6MjlcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlQmFkZ2Ugdi1lbHNlLWlmPVwic2xvdFByb3BzLnZhbHVlID09PSBmYWxzZVwiIHN0YXR1cz1cIklOQUNUSVZFXCIgcGlsbCBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Mjg6MjlcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHYtZWxzZSBjbGFzcz1cInRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Mjk6MjlcIj5TdGF0dXM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlICNvcHRpb249XCJzbG90UHJvcHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIHYtaWY9XCJzbG90UHJvcHMub3B0aW9uLnZhbHVlID09PSB0cnVlXCIgc3RhdHVzPVwiQUNUSVZFXCIgcGlsbCBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MzI6MjlcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlQmFkZ2Ugdi1lbHNlLWlmPVwic2xvdFByb3BzLm9wdGlvbi52YWx1ZSA9PT0gZmFsc2VcIiBzdGF0dXM9XCJJTkFDVElWRVwiIHBpbGwgc2l6ZT1cInNtXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjMzOjI5XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiB2LWVsc2UgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjM0OjI5XCI+e3sgc2xvdFByb3BzLm9wdGlvbi5sYWJlbCB9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICAgICAgICAgIDwvQmFzZVNlbGVjdD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJrdXQtc2VsZWN0IGZsZXgtc2hyaW5rLTBcIiB2LWlmPVwiYXV0aFN0b3JlLmlzU3VwZXJBZG1pblwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTozOToxN1wiPlxuICAgICAgICAgICAgICAgICAgICA8QmFzZVNlbGVjdCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHYtbW9kZWw9XCJzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5rdXRJZFwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgOm9wdGlvbnM9XCJrdXRPcHRpb25zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiS3VkaSAvIOGegOGeu+GeiuGet1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo0MDoyMVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBnYXAtMiBmbGV4LXNocmluay0wXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjQ3OjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cIi5jc3ZcIiByZWY9XCJjc3ZJbnB1dFJlZlwiIEBjaGFuZ2U9XCJvbkZpbGVTZWxlY3RlZFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NDg6MjFcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiA6ZGlzYWJsZWQ9XCJ1c2VyU3RvcmUuaXNMb2FkaW5nXCIgQGNsaWNrPVwidHJpZ2dlckZpbGVJbnB1dFwiIHZhcmlhbnQ9XCJvdXRsaW5lLXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4gZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHB4LTNcIiB2LXRvb2x0aXA9XCInSW1wb3J0IENTVidcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NDk6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWxlRG93biBjbGFzcz1cInRleHQtc3VjY2Vzc1wiIDpzaXplPVwiMTZcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NTE6MjVcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIDpkaXNhYmxlZD1cInVzZXJTdG9yZS5pc0xvYWRpbmdcIiBAY2xpY2s9XCIkZW1pdCgnbmV3JylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgdGV4dC1ub3dyYXAgZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHB4LTRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NTM6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIEFkZCBOZXcgVXNlclxuICAgICAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxCYXNlVGFibGUgOmNvbHVtbnM9XCJjb2xEZWZzXCIgOnJvd3M9XCJ1c2VyU3RvcmUudXNlcnNcIiA6bG9hZGluZz1cInVzZXJTdG9yZS5pc0xvYWRpbmdcIlxuICAgICAgICAgICAgOnRvdGFsLXJlY29yZHM9XCJ1c2VyU3RvcmUudG90YWxJdGVtc1wiIHYtbW9kZWw6cGFnZT1cInVzZXJTdG9yZS5wYWdlXCIgdi1tb2RlbDpwZXItcGFnZT1cInVzZXJTdG9yZS5wZXJQYWdlXCJcbiAgICAgICAgICAgIHYtbW9kZWw6c29ydC1ieT1cInVzZXJTdG9yZS5zb3J0QnlcIiB2LW1vZGVsOnNvcnQtb3JkZXI9XCJ1c2VyU3RvcmUuc29ydE9yZGVyXCJcbiAgICAgICAgICAgIEByZWZyZXNoLWRhdGE9XCJ1c2VyU3RvcmUuZ2V0QWxsVXNlcnNcIlxuICAgICAgICAgICAgOnJvd0NsYXNzPVwiZ2V0VXNlclJvd0NsYXNzXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjYwOjlcIj5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICN1c2VybmFtZT1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTNcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Njc6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Njg6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJvZmlsZS1hdmF0YXIgZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHRleHQtbXV0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJib3JkZXItcmFkaXVzOiA1MCU7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjY5OjIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHYtaWY9XCJkYXRhPy5wcm9maWxlPy5hdmF0YXJVcmxcIiA6c3JjPVwiJGF1dGhJbWcoZGF0YS5wcm9maWxlLmF2YXRhclVybClcIiBjbGFzcz1cImltZy1mbHVpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJib3JkZXItcmFkaXVzOiA1MCU7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjcxOjI1XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VXNlciB2LWVsc2UgOnNpemU9XCIyMFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo3MzoyNVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBmbGV4LWNvbHVtbiBhbGlnbi1pdGVtcy1zdGFydFwiIHN0eWxlPVwibWluLXdpZHRoOiAwO1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo3NjoyMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmdy1tZWRpdW0gdHJ1bmNhdGUtMS1saW5lXCIgOnRpdGxlPVwiZGF0YT8uZmlyc3ROYW1lICsgJyAnICsgZGF0YT8ubGFzdE5hbWVcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Nzc6MjVcIj57eyBkYXRhPy5maXJzdE5hbWUgKyBcIiBcIiArIGRhdGE/Lmxhc3ROYW1lIH19PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjZW1haWw9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIDpjbGFzcz1cIltgdGV4dC0ke2dldFJvbGVWYXJpYW50KGRhdGE/LnJvbGU/LmlkKX1gXVwiIGNsYXNzPVwidHJ1bmNhdGUtMS1saW5lXCIgOnRpdGxlPVwiZGF0YT8uZW1haWxcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6ODM6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAge3sgZGF0YT8uZW1haWwgfX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2t1dD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjg5OjE3XCI+e3sgZGF0YT8ucHJvZmlsZT8ua3V0Py5uYW1lIHx8IGRhdGE/LnByb2ZpbGU/Lmt1dD8ubnVtYmVyIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjcm93QW5kU2VhdD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImRhdGE/LnByb2ZpbGU/LnNlYXRpbmdSb3dJZCB8fCBkYXRhPy5wcm9maWxlPy5zZWF0aW5nX3Jvd19pZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo5MzoxN1wiPlxuICAgICAgICAgICAgICAgICAgICBSb3cge3sgZGF0YT8ucHJvZmlsZT8uc2VhdGluZ1Jvdz8ucm93X251bSB8fCBkYXRhPy5wcm9maWxlPy5zZWF0aW5nUm93SWQgfHwgZGF0YT8ucHJvZmlsZT8uc2VhdGluZ19yb3dfaWQgfX0gXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHYtaWY9XCJkYXRhPy5wcm9maWxlPy5zZWF0TnVtYmVyIHx8IGRhdGE/LnByb2ZpbGU/LnNlYXRfbnVtYmVyXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjk1OjIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAoU2VhdCB7eyBkYXRhPy5wcm9maWxlPy5zZWF0TnVtYmVyIHx8IGRhdGE/LnByb2ZpbGU/LnNlYXRfbnVtYmVyIH19KVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIHYtZWxzZSBjbGFzcz1cInRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6OTk6MTdcIj4tPC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICNyb2xlPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIFxuICAgICAgICAgICAgICAgICAgICB2LWlmPVwiZGF0YT8ucm9sZVwiXG4gICAgICAgICAgICAgICAgICAgIDp2YXJpYW50PVwiZ2V0Um9sZVZhcmlhbnQoZGF0YS5yb2xlLmlkKVwiIFxuICAgICAgICAgICAgICAgICAgICA6bGFiZWw9XCJkYXRhLnJvbGUubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICA6aWNvbj1cImdldFJvbGVJY29uKGRhdGEucm9sZS5pZClcIiBcbiAgICAgICAgICAgICAgICAgICAgcGlsbCBcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEwMzoxN1wiIFxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2NyZWF0ZWRBdD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImRhdGE/LmNyZWF0ZWRBdFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMTQ6MTdcIj57eyBmb3JtYXREYXRlKGRhdGEuY3JlYXRlZEF0KSB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI2lzQWN0aXZlPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIFxuICAgICAgICAgICAgICAgICAgICA6c3RhdHVzPVwiZGF0YT8uaXNBY3RpdmUgPyAnQUNUSVZFJyA6ICdJTkFDVElWRSdcIiBcbiAgICAgICAgICAgICAgICAgICAgcGlsbCBcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCIgXG4gICAgICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwidGFyZ2V0U3RhdHVzVXNlcj8uaWQgPT09IGRhdGEuaWQgJiYgaXNVcGRhdGluZ1N0YXR1c1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMTc6MTdcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2RvYj1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEyNjoxN1wiPnt7IGRhdGE/LmRvYiB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICNnZW5kZXI9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMjk6MTdcIj57eyBkYXRhPy5nZW5kZXIgfHwgJy0nIH19PC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjcG9iPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTMyOjE3XCI+e3sgZGF0YT8ucG9iIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI3Bob25lPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTM1OjE3XCI+e3sgZGF0YT8uVXNlclByb2ZpbGU/LnBob25lX251bWJlciB8fCBkYXRhPy5wcm9maWxlPy5waG9uZSB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICNzY2hvb2w9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMzg6MTdcIj57eyBkYXRhPy5Vc2VyUHJvZmlsZT8udW5pdmVyc2l0eV9uYW1lIHx8IGRhdGE/LnByb2ZpbGU/LnVuaXZlcnNpdHlfbmFtZSB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICN5ZWFyPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTQxOjE3XCI+e3sgZ2V0WWVhckxhYmVsKGRhdGE/LlVzZXJQcm9maWxlPy51bml2ZXJzaXR5X3llYXIgfHwgZGF0YT8ucHJvZmlsZT8udW5pdmVyc2l0eV95ZWFyKSB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjYWN0aW9uPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8QmFzZUFjdGlvbk1lbnUgOml0ZW1zPVwiZ2V0QWN0aW9uSXRlbXMoZGF0YSlcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTQ1OjE3XCIgLz5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgIDwvQmFzZVRhYmxlPlxuICAgIDwvZGl2PlxuXG4gICAgPEJhc2VEcmF3ZXIgdi1tb2RlbD1cInNob3dVc2VyRGV0YWlsXCIgdGl0bGU9XCJEZXRhaWxzXCIgd2lkdGg9XCIzMHJlbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNTA6NVwiPlxuICAgICAgICA8VXNlckRldGFpbFZpZXcgdi1pZj1cInNob3dVc2VyRGV0YWlsXCIgOnVzZXI9XCJ1c2VyRGV0YWlsXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1MTo5XCIgLz5cbiAgICA8L0Jhc2VEcmF3ZXI+XG5cbiAgICA8QmFzZU1vZGFsIHYtbW9kZWw9XCJzaG93UmVzZXRNb2RhbFwiIHRpdGxlPVwiUmVzZXQgUGFzc3dvcmRcIiBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU0OjVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1NTo5XCI+XG4gICAgICAgICAgICA8cCBjbGFzcz1cIm1iLTQgZnctbWVkaXVtIHRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU2OjEzXCI+QXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0IHRoaXMgdXNlcidzIHBhc3N3b3JkPzwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggZ2FwLTJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU3OjEzXCI+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gdmFyaWFudD1cIm91dGxpbmUtd2FybmluZ1wiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgtZ3Jvdy0xXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiY2FuY2VsUmVzZXRQYXNzd29yZCgpXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1ODoxN1wiPlxuICAgICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gdmFyaWFudD1cIndhcm5pbmdcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiIEBjbGljaz1cImNvbmZpcm1SZXNldFBhc3N3b3JkKClcIiA6aXNMb2FkaW5nPVwiaXNSZXNldGluZ1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNjI6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAge3sgaXNSZXNldGluZyA/ICdSZXNldGluZy4uLicgOiAnUmVzZXQgTm93JyB9fVxuICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L0Jhc2VNb2RhbD5cblxuICAgIDxCYXNlTW9kYWwgdi1tb2RlbD1cInNob3dTdGF0dXNNb2RhbFwiIDp0aXRsZT1cInRhcmdldFN0YXR1c1VzZXI/LmlzQWN0aXZlID8gJ0RlYWN0aXZhdGUgVXNlcicgOiAnQWN0aXZhdGUgVXNlcidcIiBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTY5OjVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3MDo5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWItMyBkLWlubGluZS1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHJvdW5kZWQtY2lyY2xlXCIgXG4gICAgICAgICAgICAgICAgIDpjbGFzcz1cInRhcmdldFN0YXR1c1VzZXI/LmlzQWN0aXZlID8gJ2JnLWRhbmdlci1zdWJ0bGUgdGV4dC1kYW5nZXInIDogJ2JnLXN1Y2Nlc3Mtc3VidGxlIHRleHQtc3VjY2VzcydcIiBcbiAgICAgICAgICAgICAgICAgc3R5bGU9XCJ3aWR0aDogNjBweDsgaGVpZ2h0OiA2MHB4O1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNzE6MTNcIj5cbiAgICAgICAgICAgICAgICA8WCB2LWlmPVwidGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmVcIiA6c2l6ZT1cIjI4XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3NDoxN1wiIC8+XG4gICAgICAgICAgICAgICAgPENoZWNrIHYtZWxzZSA6c2l6ZT1cIjI4XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3NToxN1wiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwibWItNCBmdy1tZWRpdW0gdGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNzc6MTNcIj5cbiAgICAgICAgICAgICAgICBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8ge3sgdGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmUgPyAnZGVhY3RpdmF0ZScgOiAnYWN0aXZhdGUnIH19XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cInRleHQtYmFzZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNzk6MTdcIj57eyB0YXJnZXRTdGF0dXNVc2VyPy5maXJzdE5hbWUgfX0ge3sgdGFyZ2V0U3RhdHVzVXNlcj8ubGFzdE5hbWUgfX08L3N0cm9uZz4/XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGdhcC0yXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE4MToxM1wiPlxuICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIDp2YXJpYW50PVwidGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmUgPyAnb3V0bGluZS1kYW5nZXInIDogJ291dGxpbmUtc3VjY2VzcydcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNob3dTdGF0dXNNb2RhbCA9IGZhbHNlXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE4MjoxN1wiPlxuICAgICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gOnZhcmlhbnQ9XCJ0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZSA/ICdkYW5nZXInIDogJ3N1Y2Nlc3MnXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleC1ncm93LTFcIiBcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiY29uZmlybVN0YXR1c0NoYW5nZSgpXCIgOmlzLUxvYWRpbmc9XCJpc1VwZGF0aW5nU3RhdHVzXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE4NjoxN1wiPlxuICAgICAgICAgICAgICAgICAgICB7eyBpc1VwZGF0aW5nU3RhdHVzID8gJ1VwZGF0aW5nLi4uJyA6ICh0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZSA/ICdEZWFjdGl2YXRlIE5vdycgOiAnQWN0aXZhdGUgTm93JykgfX1cbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9CYXNlTW9kYWw+XG5cbiAgICA8QmFzZU1vZGFsIHYtbW9kZWw9XCJzaG93Q2hhbmdlUm9sZU1vZGFsXCIgdGl0bGU9XCJDaGFuZ2UgUm9sZVwiIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTQ6NVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk1OjlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYi0zIGQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGp1c3RpZnktY29udGVudC1jZW50ZXIgcm91bmRlZC1jaXJjbGUgYmctaW5mby1zdWJ0bGUgdGV4dC1pbmZvXCIgXG4gICAgICAgICAgICAgICAgIHN0eWxlPVwid2lkdGg6IDYwcHg7IGhlaWdodDogNjBweDtcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk2OjEzXCI+XG4gICAgICAgICAgICAgICAgPEdyYWR1YXRpb25DYXAgdi1pZj1cInRhcmdldENoYW5nZVJvbGVJZCA9PT0gNFwiIDpzaXplPVwiMjhcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk4OjE3XCIgLz5cbiAgICAgICAgICAgICAgICA8VXNlciB2LWVsc2UgOnNpemU9XCIyOFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTk6MTdcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8cCBjbGFzcz1cIm1iLTQgZnctbWVkaXVtIHRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MjAxOjEzXCI+XG4gICAgICAgICAgICAgICAgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNoYW5nZSByb2xlIHRvIFxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJ0ZXh0LWJhc2VcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MjAzOjE3XCI+e3sgdGFyZ2V0Q2hhbmdlUm9sZUlkID09PSA0ID8gJ1N0dWRlbnQnIDogJ01vbmsnIH19PC9zdHJvbmc+P1xuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBnYXAtMlwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDU6MTNcIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiB2YXJpYW50PVwib3V0bGluZS1zZWNvbmRhcnlcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNob3dDaGFuZ2VSb2xlTW9kYWwgPSBmYWxzZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDY6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgICAgPC9CYXNlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIHZhcmlhbnQ9XCJpbmZvXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleC1ncm93LTEgdGV4dC13aGl0ZVwiIFxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjb25maXJtQ2hhbmdlUm9sZSgpXCIgOmlzLUxvYWRpbmc9XCJpc0NoYW5naW5nUm9sZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMTA6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAge3sgaXNDaGFuZ2luZ1JvbGUgPyAnVXBkYXRpbmcuLi4nIDogJ0NoYW5nZSBOb3cnIH19XG4gICAgICAgICAgICAgICAgPC9CYXNlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvQmFzZU1vZGFsPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdCBzZXR1cD5cbmNvbnN0IGVtaXQgPSBkZWZpbmVFbWl0cyhbJ25ldycsICdlZGl0JywgJ2ltcG9ydCcsICdwcmV2aWV3LWJ1bGsnXSk7XG5pbXBvcnQgeyB1c2VVc2VyU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy91c2Vycy91c2VyLmpzJztcbmltcG9ydCB7IG9uTW91bnRlZCwgcmVmLCBjb21wdXRlZCwgd2F0Y2ggfSBmcm9tICd2dWUnO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gJ0AvdXRpbHMvZGF0ZUZvcm1hdCc7XG5pbXBvcnQgeyBCYWRnZUNoZWNrLCBJbmZvLCBVc2VyLCBLZXlSb3VuZCwgU2VhcmNoLCBGaWxlRG93biwgQ2hlY2ssIFgsIEJvb2tPcGVuLCBHcmFkdWF0aW9uQ2FwIH0gZnJvbSAnQGx1Y2lkZS92dWUnO1xuaW1wb3J0IFVzZXJEZXRhaWxWaWV3IGZyb20gJy4vVXNlckRldGFpbFZpZXcudnVlJztcbmltcG9ydCB7IHVzZUF1dGhTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2F1dGguanMnO1xuaW1wb3J0IHsgdXNlVG9hc3RTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL3RvYXN0LmpzJztcbmltcG9ydCB7IHVzZVVzZXJMaXN0IH0gZnJvbSAnQC9jb21wb3NhYmxlcy91c2Vycy91c2VVc2VyTGlzdC5qcyc7XG5pbXBvcnQgUGFwYSBmcm9tICdwYXBhcGFyc2UnO1xuXG5pbXBvcnQgYXBpIGZyb20gJ0AvYXBpL2FwaS5qcyc7XG5cbmNvbnN0IHVzZXJTdG9yZSA9IHVzZVVzZXJTdG9yZSgpO1xuY29uc3QgYXV0aFN0b3JlID0gdXNlQXV0aFN0b3JlKCk7XG5jb25zdCB0b2FzdFN0b3JlID0gdXNlVG9hc3RTdG9yZSgpO1xuXG5jb25zdCB7XG4gICAgc2hvd1Jlc2V0TW9kYWwsXG4gICAgc2hvd1VzZXJEZXRhaWwsXG4gICAgdXNlckRldGFpbCxcbiAgICBpc0xvYWRpbmcsXG4gICAgb25WaWV3RGV0YWlsLFxuICAgIG9uUmVzZXRQYXNzd29yZCxcbiAgICBoYW5kbGVSZXNldFBhc3N3b3JkLFxuICAgIG9uQ2FuY2VsUmVzZXQsXG4gICAgc2VhcmNoQW5kRmlsdGVyXG59ID0gdXNlVXNlckxpc3QodXNlclN0b3JlLCBhdXRoU3RvcmUsIHRvYXN0U3RvcmUpO1xuXG5jb25zdCBhY3RpdmVGaWx0ZXIgPSBjb21wdXRlZCh7XG4gICAgZ2V0OiAoKSA9PiBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5yb2xlSWQsXG4gICAgc2V0OiAodmFsKSA9PiB7XG4gICAgICAgIHNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLnJvbGVJZCA9IHZhbDtcbiAgICB9XG59KTtcblxuY29uc3Qga3V0cyA9IHJlZihbXSk7XG5jb25zdCBrdXRPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgIGNvbnN0IHNvcnRlZEt1dHMgPSBbLi4ua3V0cy52YWx1ZV0uc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBudW1BID0gcGFyc2VJbnQoYS5uYW1lLnJlcGxhY2UoL1xcRC9nLCAnJyksIDEwKSB8fCAwO1xuICAgICAgICBjb25zdCBudW1CID0gcGFyc2VJbnQoYi5uYW1lLnJlcGxhY2UoL1xcRC9nLCAnJyksIDEwKSB8fCAwO1xuICAgICAgICBpZiAobnVtQSAhPT0gbnVtQikgcmV0dXJuIG51bUEgLSBudW1CO1xuICAgICAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW1xuICAgICAgICB7IGxhYmVsOiAnS3VkaSAvIOGegOGeu+GeiuGet+GekeGetuGfhuGehOGeouGen+GfiycsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIC4uLnNvcnRlZEt1dHMubWFwKGsgPT4gKHtcbiAgICAgICAgICAgIGxhYmVsOiBrLm5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogay5pZFxuICAgICAgICB9KSlcbiAgICBdO1xufSk7XG5cbm9uTW91bnRlZChhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBpLmdldCgnL2t1dHMnKTtcbiAgICAgICAgaWYgKHJlcy5kYXRhPy5zdWNjZXNzKSB7XG4gICAgICAgICAgICBrdXRzLnZhbHVlID0gcmVzLmRhdGEuZGF0YTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2gga3V0c1wiLCBlcnJvcik7XG4gICAgfVxufSk7XG5cbmNvbnN0IGhhc0FjdGl2ZUZpbHRlcnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgcmV0dXJuICEhc2VhcmNoQW5kRmlsdGVyLnNlYXJjaFF1ZXJ5LnZhbHVlIHx8IFxuICAgICAgICAgICBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSAhPT0gbnVsbCB8fCBcbiAgICAgICAgICAgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUucm9sZUlkICE9PSBudWxsIHx8XG4gICAgICAgICAgIHNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLmt1dElkICE9PSBudWxsO1xufSk7XG5cbmNvbnN0IHJlc2V0RmlsdGVycyA9ICgpID0+IHtcbiAgICBzZWFyY2hBbmRGaWx0ZXIuc2VhcmNoUXVlcnkudmFsdWUgPSAnJztcbiAgICBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSA9IG51bGw7XG4gICAgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUucm9sZUlkID0gbnVsbDtcbiAgICBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5rdXRJZCA9IG51bGw7XG59O1xuXG5jb25zdCBjc3ZJbnB1dFJlZiA9IHJlZihudWxsKTtcblxuY29uc3QgdHJpZ2dlckZpbGVJbnB1dCA9ICgpID0+IHtcbiAgICBpZiAoY3N2SW5wdXRSZWYudmFsdWUpIHtcbiAgICAgICAgY3N2SW5wdXRSZWYudmFsdWUuY2xpY2soKTtcbiAgICB9XG59O1xuXG5jb25zdCBvbkZpbGVTZWxlY3RlZCA9IChlKSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgIGlmICghZmlsZSkgcmV0dXJuO1xuXG4gICAgaWYgKGZpbGUudHlwZSAhPT0gJ3RleHQvY3N2JyAmJiAhZmlsZS5uYW1lLmVuZHNXaXRoKCcuY3N2JykpIHtcbiAgICAgICAgdG9hc3RTdG9yZS5zaG93VG9hc3QoJ09ubHkgQ1NWIGZpbGVzIGFyZSBhbGxvd2VkLicsICdkYW5nZXInKTtcbiAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIFBhcGEucGFyc2UoZmlsZSwge1xuICAgICAgICBoZWFkZXI6IHRydWUsXG4gICAgICAgIHNraXBFbXB0eUxpbmVzOiB0cnVlLFxuICAgICAgICBjb21wbGV0ZTogKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdCgnRXJyb3IgcGFyc2luZyBDU1YgZmlsZS4nLCAnZGFuZ2VyJyk7XG4gICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IGtobWVyVG9FbmdsaXNoRGlnaXRzID0gKHN0cikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ+GfoCc6ICcwJywgJ+GfoSc6ICcxJywgJ+Gfoic6ICcyJywgJ+Gfoyc6ICczJywgJ+GfpCc6ICc0JyxcbiAgICAgICAgICAgICAgICAgICAgJ+GfpSc6ICc1JywgJ+Gfpic6ICc2JywgJ+Gfpyc6ICc3JywgJ+GfqCc6ICc4JywgJ+GfqSc6ICc5J1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9b4Z+gLeGfqV0vZywgbSA9PiBtYXBbbV0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZ2V0S2htZXJNb250aE51bWJlciA9IChtb250aFN0cikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRocyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ+GemOGegOGemuGetic6ICcwMScsICfhnoDhnrvhnpjhn5Lhnpfhn4gnOiAnMDInLCAn4Z6Y4Z644Z6T4Z62JzogJzAzJywgJ+GemOGfgeGen+Getic6ICcwNCcsXG4gICAgICAgICAgICAgICAgICAgICfhnqfhnp/hnpfhnrYnOiAnMDUnLCAn4Z6Y4Z634Z6Q4Z674Z6T4Z62JzogJzA2JywgJ+GegOGegOGfkuGegOGeiuGetic6ICcwNycsICfhnp/hnrjhnqDhnrYnOiAnMDgnLFxuICAgICAgICAgICAgICAgICAgICAn4Z6A4Z6J4Z+S4Z6J4Z62JzogJzA5JywgJ+Gej+Geu+Gem+Getic6ICcxMCcsICfhnpzhnrfhnoXhn5LhnobhnrfhnoDhnrYnOiAnMTEnLCAn4Z6S4Z+S4Z6T4Z68JzogJzEyJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtIGluIG1vbnRocykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobW9udGhTdHIuaW5jbHVkZXMobSkpIHJldHVybiBtb250aHNbbV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZmluZFZhbCA9IChyb3csIGtleXdvcmRzLCBleGNsdWRlS2V5d29yZHMgPSBbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhyb3cpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xlYW5LZXkgPSBrZXkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIGlmIGtleSBtYXRjaGVzIGFueSBleGNsdXNpb24ga2V5d29yZFxuICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBleCBvZiBleGNsdWRlS2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGVhbktleS5pbmNsdWRlcyhleC50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZWQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga3cgb2Yga2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGVhbktleS5pbmNsdWRlcyhrdy50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb3dba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJzID0gcmVzdWx0cy5kYXRhXG4gICAgICAgICAgICAgICAgLm1hcChyb3cgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyAxLiBQYXJzZSBOYW1lXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVWYWwgPSBmaW5kVmFsKHJvdywgWyfhnoLhn4Thno/hn5Lhno/hnpPhnrbhnpgt4Z6T4Z624Z6YJywgJ2Z1bGwgbmFtZScsICduYW1lJywgJ+GeiOGfkuGemOGfhOGfhyddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpcnN0TmFtZSA9IGZpbmRWYWwocm93LCBbJ2ZpcnN0TmFtZScsICdmaXJzdE5hbWVLaCddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhc3ROYW1lID0gZmluZFZhbChyb3csIFsnbGFzdE5hbWUnLCAnbGFzdE5hbWVLaCddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lVmFsICYmICFmaXJzdE5hbWUgJiYgIWxhc3ROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IFN0cmluZyhuYW1lVmFsKS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWUgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lID0gcGFydHNbMF0gfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyAyLiBQYXJzZSBEYXRlIG9mIEJpcnRoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RvYiA9IGZpbmRWYWwocm93LCBbJ+GekOGfkuGehOGfg+GegeGfguGehuGfkuGek+GetuGfhuGegOGfhuGejuGevuGejycsICdkYXRlIG9mIGJpcnRoJywgJ2RvYicsICfhnoDhn4bhno7hnr7hno8nXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkb2IgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmF3RG9iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkRG9iID0ga2htZXJUb0VuZ2xpc2hEaWdpdHMoU3RyaW5nKHJhd0RvYikudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzID0gY2xlYW5lZERvYi5zcGxpdCgvW1xcc1xcLlxcLVxcL10rLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRheSA9IHBhcnRzWzBdLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1vbnRoID0gcGFydHNbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHllYXIgPSBwYXJ0c1syXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBraE1vbnRoID0gZ2V0S2htZXJNb250aE51bWJlcihtb250aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtoTW9udGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9udGggPSBraE1vbnRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoID0gbW9udGgucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeWVhci5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHllYXIsIDEwKSA+IDUwID8gJzE5JyArIHllYXIgOiAnMjAnICsgeWVhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHllYXIubGVuZ3RoID09PSA0ICYmICFpc05hTihkYXkpICYmICFpc05hTihtb250aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9iID0gYCR7eWVhcn0tJHttb250aH0tJHtkYXl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyAzLiBQYXJzZSBPdGhlciBGaWVsZHNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hoYXlhX251bWJlciA9IGZpbmRWYWwocm93LCBbJ+Gem+GfgeGegeGehuGetuGemeGeticsICfguYDguKXguILguInguLLguKLguLInLCAn4Z6b4Z+B4Z6B4Z6i4Z6P4Z+S4Z6P4Z6f4Z6J4Z+S4Z6J4Z624Z6O4Z6U4Z+Q4Z6O4Z+S4Z6OJywgJ+GeouGej+GfkuGej+Gen+GeieGfkuGeieGetuGejicsICdjaGhheWEnLCAn4Z6G4Z624Z6Z4Z62JywgJ2lkIG51bWJlciddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGhvbmVfbnVtYmVyID0gZmluZFZhbChyb3csIFsn4Z6b4Z+B4Z6B4Z6R4Z684Z6a4Z6f4Z+Q4Z6W4Z+S4Z6RJywgJ3Bob25lJywgJ+GekeGevOGemuGen+GfkOGeluGfkuGekScsICfhnpHhnrzhnprhnp/hnpbhn5LhnpEnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXZlcnNpdHlfbmFtZSA9IGZpbmRWYWwocm93LCBbJ+GemuGfgOGek+Gek+GfhScsICdzY2hvb2wnLCAndW5pdmVyc2l0eScsICfhnp/hnrbhnpvhnrYnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXZlcnNpdHlfeWVhciA9IGZpbmRWYWwocm93LCBbJ+GehuGfkuGek+GetuGfhuGekeGeuCcsICd5ZWFyJ10sIFsn4Z6A4Z+G4Z6O4Z6+4Z6PJywgJ2JpcnRoJ10pIHx8ICcnOyAvLyBFeGNsdWRlIGdlbmVyaWMgXCJiaXJ0aC9iaXJ0aGRhdGVcIiBrZXl3b3JkcyBmcm9tIHllYXIgZmllbGRcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tdW5lID0gZmluZFZhbChyb3csIFsn4Z6D4Z674Z+GJywgJ2NvbW11bmUnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RyaWN0ID0gZmluZFZhbChyb3csIFsn4Z6f4Z+S4Z6a4Z674Z6AJywgJ2Rpc3RyaWN0J10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm92aW5jZSA9IGZpbmRWYWwocm93LCBbJ+GegeGfgeGej+GfkuGejycsICdwcm92aW5jZSddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnJvbV93YXQgPSBmaW5kVmFsKHJvdywgWyfhnpjhnoDhnpbhnrjhnpzhno/hn5Lhno8nLCAnZnJvbV93YXQnLCAnd2F0JywgJ+GenOGej+GfkuGejyddKSB8fCAnJztcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYCR7bGFzdE5hbWV9ICR7Zmlyc3ROYW1lfWAudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBmaXJzdE5hbWUudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWU6IGxhc3ROYW1lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvYixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaGF5YV9udW1iZXI6IGNoaGF5YV9udW1iZXIudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmVfbnVtYmVyOiBwaG9uZV9udW1iZXIudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2l0eV9uYW1lOiB1bml2ZXJzaXR5X25hbWUudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2l0eV95ZWFyOiB1bml2ZXJzaXR5X3llYXIudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbV93YXQ6IGZyb21fd2F0LnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW11bmU6IGNvbW11bmUudHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdHJpY3Q6IGRpc3RyaWN0LnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpbmNlOiBwcm92aW5jZS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIodSA9PiB1LmZpcnN0TmFtZSAmJiB1Lmxhc3ROYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHVzZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KCdObyB2YWxpZCB1c2VycyBjb250YWluaW5nIG5hbWUgZm91bmQgaW4gQ1NWLicsICdkYW5nZXInKTtcbiAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXNlclN0b3JlLnBhcnNlZEJ1bGtVc2VycyA9IHVzZXJzO1xuICAgICAgICAgICAgZW1pdCgncHJldmlldy1idWxrJyk7XG4gICAgICAgICAgICBlLnRhcmdldC52YWx1ZSA9ICcnO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICAgICAgdG9hc3RTdG9yZS5zaG93VG9hc3QoJ0Vycm9yIHJlYWRpbmcgdGhlIGZpbGUuJywgJ2RhbmdlcicpO1xuICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuY29uc3QgZmlsdGVyT3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0gW1xuICAgICAgICB7IGxhYmVsOiAnQWxsIFVzZXJzJywgdmFsdWU6IG51bGwsIGJhZGdlOiB1c2VyU3RvcmUucm9sZVN0YXRzWydhbGwnXSwgdmFyaWFudDogJ3ByaW1hcnknIH1cbiAgICBdO1xuICAgIFxuICAgIGlmIChhdXRoU3RvcmUuaXNTdXBlckFkbWluKSB7XG4gICAgICAgIG9wdGlvbnMucHVzaCh7IGxhYmVsOiAn4Z6Y4Z+B4Z6A4Z674Z6K4Z63JywgdmFsdWU6IDIsIGJhZGdlOiB1c2VyU3RvcmUucm9sZVN0YXRzWzJdLCB2YXJpYW50OiAnc3VjY2VzcycgfSk7XG4gICAgfVxuICAgIFxuICAgIG9wdGlvbnMucHVzaChcbiAgICAgICAgeyBsYWJlbDogJ+Gel+Get+GegOGfkuGegeGeuycsIHZhbHVlOiA3LCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1s3XSwgdmFyaWFudDogJ3dhcm5pbmcnIH0sXG4gICAgICAgIHsgbGFiZWw6ICfhnp/hnrbhnpjhno7hn4HhnponLCB2YWx1ZTogMywgYmFkZ2U6IHVzZXJTdG9yZS5yb2xlU3RhdHNbM10sIHZhcmlhbnQ6ICdpbmZvJyB9LFxuICAgICAgICB7IGxhYmVsOiAn4Z6f4Z634Z6f4Z+S4Z6f4Z6T4Z634Z6f4Z+S4Z6f4Z634Z6PJywgdmFsdWU6IDQsIGJhZGdlOiB1c2VyU3RvcmUucm9sZVN0YXRzWzRdLCB2YXJpYW50OiAnc2Vjb25kYXJ5JyB9XG4gICAgKTtcbiAgICBcbiAgICByZXR1cm4gb3B0aW9ucztcbn0pO1xuXG5jb25zdCBzdGF0dXNPcHRpb25zID0gcmVmKFtcbiAgICB7IGxhYmVsOiAnQWxsIFN0YXR1cycsIHZhbHVlOiBudWxsIH0sXG4gICAgeyBsYWJlbDogJ0FjdGl2ZScsIHZhbHVlOiB0cnVlIH0sXG4gICAgeyBsYWJlbDogJ0luYWN0aXZlJywgdmFsdWU6IGZhbHNlIH1cbl0pO1xuXG5jb25zdCBnZXRSb2xlVmFyaWFudCA9IChyb2xlSWQpID0+IHtcbiAgICBzd2l0Y2gocm9sZUlkKSB7XG4gICAgICAgIGNhc2UgMTogcmV0dXJuICdkYW5nZXInOyAvLyBTdXBlckFkbWluXG4gICAgICAgIGNhc2UgMjogcmV0dXJuICdzdWNjZXNzJzsgLy8gQWRtaW4vTWVrdWRpXG4gICAgICAgIGNhc2UgMzogcmV0dXJuICdpbmZvJzsgLy8gTW9ua1xuICAgICAgICBjYXNlIDQ6IHJldHVybiAnc2Vjb25kYXJ5JzsgLy8gU3R1ZGVudFxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gJ3NlY29uZGFyeSc7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0Um9sZUljb24gPSAocm9sZUlkKSA9PiB7XG4gICAgc3dpdGNoKHJvbGVJZCkge1xuICAgICAgICBjYXNlIDE6IHJldHVybiBCYWRnZUNoZWNrO1xuICAgICAgICBjYXNlIDI6IHJldHVybiBCb29rT3BlbjtcbiAgICAgICAgY2FzZSAzOiByZXR1cm4gVXNlcjtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIFVzZXI7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0VXNlclJvd0NsYXNzID0gKGRhdGEpID0+IHtcbiAgICByZXR1cm4gKGRhdGEgJiYgZGF0YS5pZCAmJiBkYXRhLmlzQWN0aXZlID09PSBmYWxzZSkgPyAncm93LWJvcmRlci1zZWNvbmRhcnkgb3BhY2l0eS03NScgOiAnJztcbn07XG5cbmNvbnN0IGlzUmVzZXRpbmcgPSByZWYoZmFsc2UpO1xuXG5jb25zdCB0b2dnbGVSZXNldCA9IChldmVudCwgaWQpID0+IHtcbiAgICBvblJlc2V0UGFzc3dvcmQoaWQpO1xuICAgIHNob3dSZXNldE1vZGFsLnZhbHVlID0gdHJ1ZTtcbn1cblxuY29uc3QgZ2V0QWN0aW9uSXRlbXMgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ1ZpZXcgRGV0YWlscycsXG4gICAgICAgICAgICBpY29uOiBJbmZvLFxuICAgICAgICAgICAgY29tbWFuZDogKCkgPT4gb25WaWV3RGV0YWlsKGRhdGEpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogZGF0YS5pc0FjdGl2ZSA/ICdEZWFjdGl2YXRlIFVzZXInIDogJ0FjdGl2YXRlIFVzZXInLFxuICAgICAgICAgICAgaWNvbjogZGF0YS5pc0FjdGl2ZSA/IFggOiBDaGVjayxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICgpID0+IHByb21wdFRvZ2dsZVN0YXR1cyhkYXRhKSxcbiAgICAgICAgICAgIGljb25DbGFzczogZGF0YS5pc0FjdGl2ZSA/ICd0ZXh0LWRhbmdlcicgOiAndGV4dC1zdWNjZXNzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ1Jlc2V0IFBhc3N3b3JkJyxcbiAgICAgICAgICAgIGljb246IEtleVJvdW5kLFxuICAgICAgICAgICAgY29tbWFuZDogKHsgb3JpZ2luYWxFdmVudCB9KSA9PiB0b2dnbGVSZXNldChvcmlnaW5hbEV2ZW50LCBkYXRhLmlkKSxcbiAgICAgICAgICAgIGljb25DbGFzczogJ3RleHQtd2FybmluZydcbiAgICAgICAgfVxuICAgIF07XG5cbiAgICBpZiAoKGF1dGhTdG9yZS5pc0FkbWluIHx8IGF1dGhTdG9yZS5pc1N1cGVyQWRtaW4pICYmIGRhdGEucm9sZSkge1xuICAgICAgICBpZiAoZGF0YS5yb2xlLmlkID09PSAzIHx8IGRhdGEucm9sZS5pZCA9PT0gNykge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDaGFuZ2UgdG8gU3R1ZGVudCcsXG4gICAgICAgICAgICAgICAgaWNvbjogR3JhZHVhdGlvbkNhcCxcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAoKSA9PiBwcm9tcHRDaGFuZ2VSb2xlKGRhdGEsIDQpLFxuICAgICAgICAgICAgICAgIGljb25DbGFzczogJ3RleHQtaW5mbydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEucm9sZS5pZCA9PT0gNCkge1xuICAgICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDaGFuZ2UgdG8gTW9uaycsXG4gICAgICAgICAgICAgICAgaWNvbjogVXNlcixcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAoKSA9PiBwcm9tcHRDaGFuZ2VSb2xlKGRhdGEsIDMpLFxuICAgICAgICAgICAgICAgIGljb25DbGFzczogJ3RleHQtaW5mbydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xufTtcblxuY29uc3QgY29uZmlybVJlc2V0UGFzc3dvcmQgPSBhc3luYyAoKSA9PiB7XG4gICAgaXNSZXNldGluZy52YWx1ZSA9IHRydWU7XG4gICAgYXdhaXQgaGFuZGxlUmVzZXRQYXNzd29yZCgpO1xuICAgIGlzUmVzZXRpbmcudmFsdWUgPSBmYWxzZTtcbiAgICBzaG93UmVzZXRNb2RhbC52YWx1ZSA9IGZhbHNlO1xufVxuXG5jb25zdCBjYW5jZWxSZXNldFBhc3N3b3JkID0gKCkgPT4ge1xuICAgIG9uQ2FuY2VsUmVzZXQoKTtcbiAgICBzaG93UmVzZXRNb2RhbC52YWx1ZSA9IGZhbHNlO1xufVxuXG5jb25zdCBzaG93U3RhdHVzTW9kYWwgPSByZWYoZmFsc2UpO1xuY29uc3QgdGFyZ2V0U3RhdHVzVXNlciA9IHJlZihudWxsKTtcbmNvbnN0IGlzVXBkYXRpbmdTdGF0dXMgPSByZWYoZmFsc2UpO1xuXG5jb25zdCBzaG93Q2hhbmdlUm9sZU1vZGFsID0gcmVmKGZhbHNlKTtcbmNvbnN0IHRhcmdldENoYW5nZVJvbGVVc2VyID0gcmVmKG51bGwpO1xuY29uc3QgdGFyZ2V0Q2hhbmdlUm9sZUlkID0gcmVmKG51bGwpO1xuY29uc3QgaXNDaGFuZ2luZ1JvbGUgPSByZWYoZmFsc2UpO1xuXG5jb25zdCBwcm9tcHRDaGFuZ2VSb2xlID0gKGRhdGEsIHJvbGVJZCkgPT4ge1xuICAgIGNvbnN0IGlzQ3VycmVudFVzZXIgPSAoYXV0aFN0b3JlPy51c2VyPy5pZCA9PT0gZGF0YT8uaWQpO1xuICAgIGlmIChpc0N1cnJlbnRVc2VyKSB7XG4gICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KFwiQ2Fubm90IGNoYW5nZSB5b3VyIG93biByb2xlIGhlcmVcIiwgJ3dhcm5pbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0YXJnZXRDaGFuZ2VSb2xlVXNlci52YWx1ZSA9IGRhdGE7XG4gICAgdGFyZ2V0Q2hhbmdlUm9sZUlkLnZhbHVlID0gcm9sZUlkO1xuICAgIHNob3dDaGFuZ2VSb2xlTW9kYWwudmFsdWUgPSB0cnVlO1xufTtcblxuY29uc3QgY29uZmlybUNoYW5nZVJvbGUgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF0YXJnZXRDaGFuZ2VSb2xlVXNlci52YWx1ZSB8fCAhdGFyZ2V0Q2hhbmdlUm9sZUlkLnZhbHVlKSByZXR1cm47XG4gICAgY29uc3QgZGF0YSA9IHRhcmdldENoYW5nZVJvbGVVc2VyLnZhbHVlO1xuICAgIFxuICAgIGlzQ2hhbmdpbmdSb2xlLnZhbHVlID0gdHJ1ZTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB1c2VyU3RvcmUuY2hhbmdlVXNlclJvbGUoZGF0YS5pZCwgdGFyZ2V0Q2hhbmdlUm9sZUlkLnZhbHVlKTtcbiAgICBpc0NoYW5naW5nUm9sZS52YWx1ZSA9IGZhbHNlO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBzaG93Q2hhbmdlUm9sZU1vZGFsLnZhbHVlID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdXNlclN0b3JlLnVzZXJzLmZpbmRJbmRleCh1ID0+IHUuaWQgPT09IGRhdGEuaWQpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICB1c2VyU3RvcmUudXNlcnNbaW5kZXhdLnJvbGUgPSByZXN1bHQuZGF0YT8uUm9sZSB8fCByZXN1bHQuZGF0YT8ucm9sZTtcbiAgICAgICAgICAgIHVzZXJTdG9yZS51c2Vyc1tpbmRleF0ucm9sZV9pZCA9IHRhcmdldENoYW5nZVJvbGVJZC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmNvbnN0IHByb21wdFRvZ2dsZVN0YXR1cyA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgaXNDdXJyZW50VXNlciA9IChhdXRoU3RvcmU/LnVzZXI/LmlkID09PSBkYXRhPy5pZCkgJiYgKGF1dGhTdG9yZT8udXNlcj8ucm9sZT8uaWQgPT09IDEpO1xuICAgIGlmIChpc0N1cnJlbnRVc2VyKSB7XG4gICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KFwiQ2Fubm90IHVwZGF0ZSBjdXJyZW50IHVzZXIncyBzdGF0dXNcIiwgJ3dhcm5pbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0YXJnZXRTdGF0dXNVc2VyLnZhbHVlID0gZGF0YTtcbiAgICBzaG93U3RhdHVzTW9kYWwudmFsdWUgPSB0cnVlO1xufTtcblxuY29uc3QgY29uZmlybVN0YXR1c0NoYW5nZSA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXRhcmdldFN0YXR1c1VzZXIudmFsdWUpIHJldHVybjtcbiAgICBjb25zdCBkYXRhID0gdGFyZ2V0U3RhdHVzVXNlci52YWx1ZTtcbiAgICBcbiAgICBpc1VwZGF0aW5nU3RhdHVzLnZhbHVlID0gdHJ1ZTtcblxuICAgIGNvbnN0IG9yaWdpbmFsU3RhdHVzID0gZGF0YS5pc0FjdGl2ZTtcbiAgICBjb25zdCBuZXdTdGF0dXMgPSAhb3JpZ2luYWxTdGF0dXM7XG5cbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICBpc19hY3RpdmU6IG5ld1N0YXR1c1xuICAgIH07XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB1c2VyU3RvcmUudXBkYXRlVXNlcihkYXRhLmlkLCBwYXlsb2FkKTtcblxuICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgIGRhdGEuaXNBY3RpdmUgPSBuZXdTdGF0dXM7XG4gICAgICAgIHVzZXJTdG9yZS5mZXRjaFJvbGVTdGF0cyh0cnVlLCBzZWFyY2hBbmRGaWx0ZXIuZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSk7XG4gICAgfVxuXG4gICAgaXNVcGRhdGluZ1N0YXR1cy52YWx1ZSA9IGZhbHNlO1xuICAgIHNob3dTdGF0dXNNb2RhbC52YWx1ZSA9IGZhbHNlO1xuICAgIHRhcmdldFN0YXR1c1VzZXIudmFsdWUgPSBudWxsO1xufTtcblxub25Nb3VudGVkKGFzeW5jICgpID0+IHtcbiAgICB1c2VyU3RvcmUuZmV0Y2hSb2xlU3RhdHModHJ1ZSwgc2VhcmNoQW5kRmlsdGVyLmZpbHRlcnMudmFsdWUuaXNBY3RpdmUpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdXNlclN0b3JlLmdldEFsbFVzZXJzKCksXG4gICAgICAgIHVzZXJTdG9yZS5nZXRVc2VyUm9sZXMoKVxuICAgIF0pO1xufSk7XG5cbndhdGNoKCgpID0+IHNlYXJjaEFuZEZpbHRlci5maWx0ZXJzLnZhbHVlLmlzQWN0aXZlLCAobmV3SXNBY3RpdmUpID0+IHtcbiAgICB1c2VyU3RvcmUuZmV0Y2hSb2xlU3RhdHModHJ1ZSwgbmV3SXNBY3RpdmUpO1xufSk7XG5cbmNvbnN0IHllYXJPcHRpb25zID0gW1xuICAgIHsgbGFiZWw6ICdZZWFyIDEnLCB2YWx1ZTogJzEnIH0sXG4gICAgeyBsYWJlbDogJ1llYXIgMicsIHZhbHVlOiAnMicgfSxcbiAgICB7IGxhYmVsOiAnWWVhciAzJywgdmFsdWU6ICczJyB9LFxuICAgIHsgbGFiZWw6ICdZZWFyIDQnLCB2YWx1ZTogJzQnIH0sXG4gICAgeyBsYWJlbDogJ090aGVyJywgdmFsdWU6ICdvdGhlcicgfVxuXTtcblxuY29uc3QgZ2V0WWVhckxhYmVsID0gKHZhbHVlKSA9PiB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuICctJztcbiAgICBjb25zdCBvcHQgPSB5ZWFyT3B0aW9ucy5maW5kKG8gPT4gby52YWx1ZSA9PT0gU3RyaW5nKHZhbHVlKSk7XG4gICAgcmV0dXJuIG9wdCA/IG9wdC5sYWJlbCA6IHZhbHVlO1xufTtcblxuY29uc3QgY29sRGVmcyA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICBjb25zdCBjb2xzID0gW1xuICAgICAgICB7IGZpZWxkOiAndXNlcm5hbWUnLCBoZWFkZXI6ICdGdWxsIE5hbWUnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdlbWFpbCcsIGhlYWRlcjogJ0VtYWlsIEFkZHJlc3MnIH1cbiAgICBdO1xuICAgIGNvbHMucHVzaChcbiAgICAgICAgeyBmaWVsZDogJ2t1dCcsIGhlYWRlcjogJ0t1ZGknIH0sXG4gICAgICAgIHsgZmllbGQ6ICdyb3dBbmRTZWF0JywgaGVhZGVyOiAnUm93L1NlYXQnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdwaG9uZScsIGhlYWRlcjogJ1Bob25lIE51bWJlcicgfSxcbiAgICAgICAgeyBmaWVsZDogJ3NjaG9vbCcsIGhlYWRlcjogJ1NjaG9vbCAvIFVuaXZlcnNpdHknIH0sXG4gICAgICAgIHsgZmllbGQ6ICd5ZWFyJywgaGVhZGVyOiAnWWVhcicgfSxcbiAgICAgICAgeyBmaWVsZDogJ2FjdGlvbicsIGhlYWRlcjogJycsIHNvcnRhYmxlOiBmYWxzZSB9XG4gICAgKTtcbiAgICByZXR1cm4gY29scztcbn0pO1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBzY29wZWQ+XG4udXNlci1wcm9maWxlLWF2YXRhciB7XG4gICAgd2lkdGg6IDM1cHg7XG4gICAgaGVpZ2h0OiAzNXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXN1cmZhY2UtZ3JvdW5kKTtcbiAgICBib3JkZXItcmFkaXVzOiA1MHB4O1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoKSBzb2xpZCB2YXIoLS1ib3JkZXItY2xyKTtcbn1cblxuLnVzZXItcHJvZmlsZS1hdmF0YXIgaW1nIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgb2JqZWN0LWZpdDogY292ZXI7XG59XG5cbi5zdGF0dXMtc2VsZWN0LFxuLnNlYXJjaC1pbnB1dCxcbi5rdXQtc2VsZWN0IHtcbiAgICB3aWR0aDogMTAwJTtcbn1cblxuQG1lZGlhIChtaW4td2lkdGg6IDU3NnB4KSB7XG4gICAgLnN0YXR1cy1zZWxlY3Qge1xuICAgICAgICB3aWR0aDogMTMwcHg7XG4gICAgfVxuICAgIC5rdXQtc2VsZWN0IHtcbiAgICAgICAgd2lkdGg6IDEzMHB4O1xuICAgIH1cbiAgICAuc2VhcmNoLWlucHV0IHtcbiAgICAgICAgd2lkdGg6IDI1MHB4O1xuICAgIH1cbn1cbjwvc3R5bGU+Il0sImZpbGUiOiIvVm9sdW1lcy9NeUZvbGRlci9QYWdvZGEgTWFuYWdlbWFudC9Nb25rTWFuYWdlL3NyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlIn0=