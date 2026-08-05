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
        { field: 'rowAndSeat', header: 'Row/Seat' },
        { field: 'phone', header: 'Phone Number' },
        { field: 'school', header: 'School / University' },
        { field: 'year', header: 'Year' },
        { field: 'action', header: '', sortable: false }
    );
    return cols;
});

const __returned__ = { emit, userStore, authStore, toastStore, showResetModal, showUserDetail, userDetail, isLoading, onViewDetail, onResetPassword, handleResetPassword, onCancelReset, searchAndFilter, searchQuery, filters, activeFilter, kuts, kutOptions, hasActiveFilters, resetFilters, csvInputRef, triggerFileInput, onFileSelected, filterOptions, statusOptions, getRoleVariant, getRoleIcon, getUserRowClass, isReseting, toggleReset, getActionItems, confirmResetPassword, cancelResetPassword, showStatusModal, targetStatusUser, isUpdatingStatus, showChangeRoleModal, targetChangeRoleUser, targetChangeRoleId, isChangingRole, promptChangeRole, confirmChangeRole, promptToggleStatus, confirmStatusChange, yearOptions, getYearLabel, colDefs, get useUserStore() { return useUserStore }, onMounted, ref, computed, watch, get formatDate() { return formatDate }, get BadgeCheck() { return BadgeCheck }, get Info() { return Info }, get User() { return User }, get KeyRound() { return KeyRound }, get Search() { return Search }, get FileDown() { return FileDown }, get Check() { return Check }, get X() { return X }, get BookOpen() { return BookOpen }, get GraduationCap() { return GraduationCap }, UserDetailView, get useAuthStore() { return useAuthStore }, get useToastStore() { return useToastStore }, get useUserList() { return useUserList }, get Papa() { return Papa }, get api() { return api } }
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
  class: "col-12 col-md-4 col-lg-3",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:11:21"
}
const _hoisted_6 = {
  class: "col-12 col-md-3 col-lg-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:19:25"
}
const _hoisted_7 = {
  key: 2,
  class: "text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:28:29"
}
const _hoisted_8 = {
  key: 2,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:33:29"
}
const _hoisted_9 = {
  key: 0,
  class: "col-12 col-md-3 col-lg-2 ms-auto",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:38:17"
}
const _hoisted_10 = {
  class: "d-flex gap-2 flex-shrink-0",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:46:17"
}
const _hoisted_11 = {
  class: "d-flex align-items-center gap-3",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:66:17"
}
const _hoisted_12 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:67:21" }
const _hoisted_13 = {
  class: "user-profile-avatar d-flex align-items-center justify-content-center text-muted",
  style: {"border-radius":"50%"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:68:21"
}
const _hoisted_14 = ["src"]
const _hoisted_15 = {
  class: "d-flex flex-column align-items-start",
  style: {"min-width":"0"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:75:21"
}
const _hoisted_16 = ["title"]
const _hoisted_17 = ["title"]
const _hoisted_18 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:88:17" }
const _hoisted_19 = {
  key: 0,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:92:17"
}
const _hoisted_20 = {
  key: 0,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:94:21"
}
const _hoisted_21 = {
  key: 1,
  class: "text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:98:17"
}
const _hoisted_22 = {
  key: 0,
  "data-v-inspector": "src/views/admin/users/UserListView.vue:113:17"
}
const _hoisted_23 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:125:17" }
const _hoisted_24 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:128:17" }
const _hoisted_25 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:131:17" }
const _hoisted_26 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:134:17" }
const _hoisted_27 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:137:17" }
const _hoisted_28 = { "data-v-inspector": "src/views/admin/users/UserListView.vue:140:17" }
const _hoisted_29 = {
  class: "text-center",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:154:9"
}
const _hoisted_30 = {
  class: "d-flex gap-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:156:13"
}
const _hoisted_31 = {
  class: "text-center",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:169:9"
}
const _hoisted_32 = {
  class: "mb-4 fw-medium text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:176:13"
}
const _hoisted_33 = {
  class: "text-base",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:178:17"
}
const _hoisted_34 = {
  class: "d-flex gap-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:180:13"
}
const _hoisted_35 = {
  class: "text-center",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:194:9"
}
const _hoisted_36 = {
  class: "mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info",
  style: {"width":"60px","height":"60px"},
  "data-v-inspector": "src/views/admin/users/UserListView.vue:195:13"
}
const _hoisted_37 = {
  class: "mb-4 fw-medium text-muted",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:200:13"
}
const _hoisted_38 = {
  class: "text-base",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:202:17"
}
const _hoisted_39 = {
  class: "d-flex gap-2",
  "data-v-inspector": "src/views/admin/users/UserListView.vue:204:13"
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
              modelValue: $setup.searchQuery,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($setup.searchQuery) = $event)),
              placeholder: "Search users...",
              prefixIcon: $setup.Search,
              clearable: "",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:12:25"
            }, null, 8 /* PROPS */, ["modelValue", "prefixIcon"])
          ]),
          _createElementVNode("div", _hoisted_6, [
            _createVNode(_component_BaseSelect, {
              modelValue: $setup.filters.isActive,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => (($setup.filters.isActive) = $event)),
              options: $setup.statusOptions,
              placeholder: "Status",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:20:25"
            }, {
              value: _withCtx((slotProps) => [
                (slotProps.value === true)
                  ? (_openBlock(), _createBlock(_component_BaseBadge, {
                      key: 0,
                      status: "ACTIVE",
                      pill: "",
                      size: "sm",
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:26:29"
                    }))
                  : (slotProps.value === false)
                    ? (_openBlock(), _createBlock(_component_BaseBadge, {
                        key: 1,
                        status: "INACTIVE",
                        pill: "",
                        size: "sm",
                        "data-v-inspector": "src/views/admin/users/UserListView.vue:27:29"
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
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:31:29"
                    }))
                  : (slotProps.option.value === false)
                    ? (_openBlock(), _createBlock(_component_BaseBadge, {
                        key: 1,
                        status: "INACTIVE",
                        pill: "",
                        size: "sm",
                        "data-v-inspector": "src/views/admin/users/UserListView.vue:32:29"
                      }))
                    : (_openBlock(), _createElementBlock("span", _hoisted_8, _toDisplayString(slotProps.option.label), 1 /* TEXT */))
              ]),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["modelValue", "options"])
          ]),
          ($setup.authStore.isSuperAdmin)
            ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
                _createVNode(_component_BaseSelect, {
                  modelValue: $setup.filters.kutId,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => (($setup.filters.kutId) = $event)),
                  options: $setup.kutOptions,
                  placeholder: "Kudi / កុដិ",
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:39:21"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:47:21"
            }, null, 544 /* NEED_HYDRATION, NEED_PATCH */),
            _withDirectives((_openBlock(), _createBlock(_component_BaseButton, {
              disabled: $setup.userStore.isLoading,
              onClick: $setup.triggerFileInput,
              variant: "outline-primary",
              class: "btn d-flex align-items-center justify-content-center px-3",
              "data-v-inspector": "src/views/admin/users/UserListView.vue:48:21"
            }, {
              default: _withCtx(() => [
                _createVNode($setup["FileDown"], {
                  class: "text-success",
                  size: 16,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:50:25"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:52:21"
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
        "data-v-inspector": "src/views/admin/users/UserListView.vue:59:9"
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
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:70:25"
                    }, null, 8 /* PROPS */, _hoisted_14))
                  : (_openBlock(), _createBlock($setup["User"], {
                      key: 1,
                      size: 20,
                      "data-v-inspector": "src/views/admin/users/UserListView.vue:72:25"
                    }))
              ])
            ]),
            _createElementVNode("div", _hoisted_15, [
              _createElementVNode("span", {
                class: "fw-medium truncate-1-line",
                title: data?.firstName + ' ' + data?.lastName,
                "data-v-inspector": "src/views/admin/users/UserListView.vue:76:25"
              }, _toDisplayString(data?.firstName + " " + data?.lastName), 9 /* TEXT, PROPS */, _hoisted_16)
            ])
          ])
        ]),
        email: _withCtx(({ data }) => [
          _createElementVNode("span", {
            class: _normalizeClass([[`text-${$setup.getRoleVariant(data?.role?.id)}`], "truncate-1-line"]),
            title: data?.email,
            "data-v-inspector": "src/views/admin/users/UserListView.vue:82:17"
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
                "data-v-inspector": "src/views/admin/users/UserListView.vue:102:17"
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
            "data-v-inspector": "src/views/admin/users/UserListView.vue:116:17"
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
            "data-v-inspector": "src/views/admin/users/UserListView.vue:144:17"
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
      "data-v-inspector": "src/views/admin/users/UserListView.vue:149:5"
    }, {
      default: _withCtx(() => [
        ($setup.showUserDetail)
          ? (_openBlock(), _createBlock($setup["UserDetailView"], {
              key: 0,
              user: $setup.userDetail,
              "data-v-inspector": "src/views/admin/users/UserListView.vue:150:9"
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
      "data-v-inspector": "src/views/admin/users/UserListView.vue:153:5"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_29, [
          _cache[21] || (_cache[21] = _createElementVNode("p", {
            class: "mb-4 fw-medium text-muted",
            "data-v-inspector": "src/views/admin/users/UserListView.vue:155:13"
          }, "Are you sure you want to reset this user's password?", -1 /* CACHED */)),
          _createElementVNode("div", _hoisted_30, [
            _createVNode(_component_BaseButton, {
              variant: "outline-warning",
              type: "button",
              class: "flex-grow-1",
              onClick: _cache[10] || (_cache[10] = $event => ($setup.cancelResetPassword())),
              "data-v-inspector": "src/views/admin/users/UserListView.vue:157:17"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:161:17"
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
      "data-v-inspector": "src/views/admin/users/UserListView.vue:168:5"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_31, [
          _createElementVNode("div", {
            class: _normalizeClass(["mb-3 d-inline-flex align-items-center justify-content-center rounded-circle", $setup.targetStatusUser?.isActive ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success']),
            style: {"width":"60px","height":"60px"},
            "data-v-inspector": "src/views/admin/users/UserListView.vue:170:13"
          }, [
            ($setup.targetStatusUser?.isActive)
              ? (_openBlock(), _createBlock($setup["X"], {
                  key: 0,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:173:17"
                }))
              : (_openBlock(), _createBlock($setup["Check"], {
                  key: 1,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:174:17"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:181:17"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:185:17"
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
      "data-v-inspector": "src/views/admin/users/UserListView.vue:193:5"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_35, [
          _createElementVNode("div", _hoisted_36, [
            ($setup.targetChangeRoleId === 4)
              ? (_openBlock(), _createBlock($setup["GraduationCap"], {
                  key: 0,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:197:17"
                }))
              : (_openBlock(), _createBlock($setup["User"], {
                  key: 1,
                  size: 28,
                  "data-v-inspector": "src/views/admin/users/UserListView.vue:198:17"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:205:17"
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
              "data-v-inspector": "src/views/admin/users/UserListView.vue:209:17"
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
//# sourceMappingURL=data:application/json;base64,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QyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUU5RixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU07QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ3pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJO0FBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ3ZDLENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUM5QixDQUFDOztBQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7O0FBRTdCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7O0FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTTs7QUFFckIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFSixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUk7QUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUk7QUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzlELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUViLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDN0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7QUFDekQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVE7O0FBRTFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0RixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztBQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87QUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzFGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZKLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUVqSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFaEcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDaEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN2RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRVosQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUM3QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUM7O0FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJO0FBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU87QUFDbEIsQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7QUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUTtBQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJO0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtBQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7QUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLENBQUM7O0FBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQy9COztBQUVBLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSTtBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0FBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO0FBQ25ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO0FBQ3BFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVE7QUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQy9FLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87QUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVMLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhO0FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSTtBQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSTtBQUMxQixD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Q0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxDQUFDOztBQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQ2xDLENBQUM7O0FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO0FBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFL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LHlDQUFFLHdCQUFpQjtjQUFLLFlBQVUsRUFBRSxxQkFBYztjQUFFLGtCQUFnQixFQUFDOztnQ0FDM0UsQ0FBbUQ7a0RBQWhELHFCQUFjIiwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJVc2VyTGlzdFZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgICA8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc3VyZmFjZS1ncm91bmQpO1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyOjVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1iLTMgZC1mbGV4IGZsZXgtd3JhcCBmbGV4LWxnLW5vd3JhcCBhbGlnbi1pdGVtcy1jZW50ZXIganVzdGlmeS1jb250ZW50LWJldHdlZW4gZ2FwLTIgdy0xMDBcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Mzo5XCI+XG4gICAgICAgICAgICA8IS0tIExlZnQgU2lkZTogRmlsdGVycyAtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIHctMTAwIHctbGctYXV0b1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo1OjEzXCI+XG4gICAgICAgICAgICAgICAgPEJhc2VGaWx0ZXIgdi1tb2RlbD1cImFjdGl2ZUZpbHRlclwiIDpvcHRpb25zPVwiZmlsdGVyT3B0aW9uc1wiIDp3cmFwPVwidHJ1ZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo2OjE3XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8IS0tIFJpZ2h0IFNpZGU6IFNlYXJjaCwgU3RhdHVzLCBCdXR0b25zIC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBmbGV4LXdyYXAgZmxleC1tZC1ub3dyYXAgYWxpZ24taXRlbXMtY2VudGVyIGdhcC0yIGp1c3RpZnktY29udGVudC1lbmQgdy0xMDAgdy1sZy1hdXRvXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEwOjEzXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLW1kLTQgY29sLWxnLTNcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTE6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlSW5wdXQgXG4gICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwic2VhcmNoUXVlcnlcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIHVzZXJzLi4uXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICA6cHJlZml4SWNvbj1cIlNlYXJjaFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcmFibGUgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEyOjI1XCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLW1kLTMgY29sLWxnLTJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk6MjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlU2VsZWN0IFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cImZpbHRlcnMuaXNBY3RpdmVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIDpvcHRpb25zPVwic3RhdHVzT3B0aW9uc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlN0YXR1c1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDoyNVwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjdmFsdWU9XCJzbG90UHJvcHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIHYtaWY9XCJzbG90UHJvcHMudmFsdWUgPT09IHRydWVcIiBzdGF0dXM9XCJBQ1RJVkVcIiBwaWxsIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyNjoyOVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VCYWRnZSB2LWVsc2UtaWY9XCJzbG90UHJvcHMudmFsdWUgPT09IGZhbHNlXCIgc3RhdHVzPVwiSU5BQ1RJVkVcIiBwaWxsIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyNzoyOVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlIGNsYXNzPVwidGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyODoyOVwiPlN0YXR1czwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI29wdGlvbj1cInNsb3RQcm9wc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCYXNlQmFkZ2Ugdi1pZj1cInNsb3RQcm9wcy5vcHRpb24udmFsdWUgPT09IHRydWVcIiBzdGF0dXM9XCJBQ1RJVkVcIiBwaWxsIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTozMToyOVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VCYWRnZSB2LWVsc2UtaWY9XCJzbG90UHJvcHMub3B0aW9uLnZhbHVlID09PSBmYWxzZVwiIHN0YXR1cz1cIklOQUNUSVZFXCIgcGlsbCBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MzI6MjlcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHYtZWxzZSBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MzM6MjlcIj57eyBzbG90UHJvcHMub3B0aW9uLmxhYmVsIH19PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgICAgICAgICAgICAgPC9CYXNlU2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC0xMiBjb2wtbWQtMyBjb2wtbGctMiBtcy1hdXRvXCIgdi1pZj1cImF1dGhTdG9yZS5pc1N1cGVyQWRtaW5cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Mzg6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgPEJhc2VTZWxlY3QgXG4gICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwiZmlsdGVycy5rdXRJZFwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgOm9wdGlvbnM9XCJrdXRPcHRpb25zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiS3VkaSAvIOGegOGeu+GeiuGet1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTozOToyMVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBnYXAtMiBmbGV4LXNocmluay0wXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjQ2OjE3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cIi5jc3ZcIiByZWY9XCJjc3ZJbnB1dFJlZlwiIEBjaGFuZ2U9XCJvbkZpbGVTZWxlY3RlZFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NDc6MjFcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiA6ZGlzYWJsZWQ9XCJ1c2VyU3RvcmUuaXNMb2FkaW5nXCIgQGNsaWNrPVwidHJpZ2dlckZpbGVJbnB1dFwiIHZhcmlhbnQ9XCJvdXRsaW5lLXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4gZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHB4LTNcIiB2LXRvb2x0aXA9XCInSW1wb3J0IENTVidcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NDg6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWxlRG93biBjbGFzcz1cInRleHQtc3VjY2Vzc1wiIDpzaXplPVwiMTZcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NTA6MjVcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIDpkaXNhYmxlZD1cInVzZXJTdG9yZS5pc0xvYWRpbmdcIiBAY2xpY2s9XCIkZW1pdCgnbmV3JylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgdGV4dC1ub3dyYXAgZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHB4LTRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NTI6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIEFkZCBOZXcgVXNlclxuICAgICAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxCYXNlVGFibGUgOmNvbHVtbnM9XCJjb2xEZWZzXCIgOnJvd3M9XCJ1c2VyU3RvcmUudXNlcnNcIiA6bG9hZGluZz1cInVzZXJTdG9yZS5pc0xvYWRpbmdcIlxuICAgICAgICAgICAgOnRvdGFsLXJlY29yZHM9XCJ1c2VyU3RvcmUudG90YWxJdGVtc1wiIHYtbW9kZWw6cGFnZT1cInVzZXJTdG9yZS5wYWdlXCIgdi1tb2RlbDpwZXItcGFnZT1cInVzZXJTdG9yZS5wZXJQYWdlXCJcbiAgICAgICAgICAgIHYtbW9kZWw6c29ydC1ieT1cInVzZXJTdG9yZS5zb3J0QnlcIiB2LW1vZGVsOnNvcnQtb3JkZXI9XCJ1c2VyU3RvcmUuc29ydE9yZGVyXCJcbiAgICAgICAgICAgIEByZWZyZXNoLWRhdGE9XCJ1c2VyU3RvcmUuZ2V0QWxsVXNlcnNcIlxuICAgICAgICAgICAgOnJvd0NsYXNzPVwiZ2V0VXNlclJvd0NsYXNzXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjU5OjlcIj5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICN1c2VybmFtZT1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTNcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NjY6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6Njc6MjFcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJvZmlsZS1hdmF0YXIgZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHRleHQtbXV0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJib3JkZXItcmFkaXVzOiA1MCU7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjY4OjIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHYtaWY9XCJkYXRhPy5wcm9maWxlPy5hdmF0YXJVcmxcIiA6c3JjPVwiJGF1dGhJbWcoZGF0YS5wcm9maWxlLmF2YXRhclVybClcIiBjbGFzcz1cImltZy1mbHVpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJib3JkZXItcmFkaXVzOiA1MCU7XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjcwOjI1XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VXNlciB2LWVsc2UgOnNpemU9XCIyMFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo3MjoyNVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBmbGV4LWNvbHVtbiBhbGlnbi1pdGVtcy1zdGFydFwiIHN0eWxlPVwibWluLXdpZHRoOiAwO1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo3NToyMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmdy1tZWRpdW0gdHJ1bmNhdGUtMS1saW5lXCIgOnRpdGxlPVwiZGF0YT8uZmlyc3ROYW1lICsgJyAnICsgZGF0YT8ubGFzdE5hbWVcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6NzY6MjVcIj57eyBkYXRhPy5maXJzdE5hbWUgKyBcIiBcIiArIGRhdGE/Lmxhc3ROYW1lIH19PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjZW1haWw9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIDpjbGFzcz1cIltgdGV4dC0ke2dldFJvbGVWYXJpYW50KGRhdGE/LnJvbGU/LmlkKX1gXVwiIGNsYXNzPVwidHJ1bmNhdGUtMS1saW5lXCIgOnRpdGxlPVwiZGF0YT8uZW1haWxcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6ODI6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAge3sgZGF0YT8uZW1haWwgfX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2t1dD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjg4OjE3XCI+e3sgZGF0YT8ucHJvZmlsZT8ua3V0Py5uYW1lIHx8IGRhdGE/LnByb2ZpbGU/Lmt1dD8ubnVtYmVyIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjcm93QW5kU2VhdD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImRhdGE/LnByb2ZpbGU/LnNlYXRpbmdSb3dJZCB8fCBkYXRhPy5wcm9maWxlPy5zZWF0aW5nX3Jvd19pZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZTo5MjoxN1wiPlxuICAgICAgICAgICAgICAgICAgICBSb3cge3sgZGF0YT8ucHJvZmlsZT8uc2VhdGluZ1Jvdz8ucm93X251bSB8fCBkYXRhPy5wcm9maWxlPy5zZWF0aW5nUm93SWQgfHwgZGF0YT8ucHJvZmlsZT8uc2VhdGluZ19yb3dfaWQgfX0gXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHYtaWY9XCJkYXRhPy5wcm9maWxlPy5zZWF0TnVtYmVyIHx8IGRhdGE/LnByb2ZpbGU/LnNlYXRfbnVtYmVyXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjk0OjIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAoU2VhdCB7eyBkYXRhPy5wcm9maWxlPy5zZWF0TnVtYmVyIHx8IGRhdGE/LnByb2ZpbGU/LnNlYXRfbnVtYmVyIH19KVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIHYtZWxzZSBjbGFzcz1cInRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6OTg6MTdcIj4tPC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cblxuICAgICAgICAgICAgPHRlbXBsYXRlICNyb2xlPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIFxuICAgICAgICAgICAgICAgICAgICB2LWlmPVwiZGF0YT8ucm9sZVwiXG4gICAgICAgICAgICAgICAgICAgIDp2YXJpYW50PVwiZ2V0Um9sZVZhcmlhbnQoZGF0YS5yb2xlLmlkKVwiIFxuICAgICAgICAgICAgICAgICAgICA6bGFiZWw9XCJkYXRhLnJvbGUubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICA6aWNvbj1cImdldFJvbGVJY29uKGRhdGEucm9sZS5pZClcIiBcbiAgICAgICAgICAgICAgICAgICAgcGlsbCBcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEwMjoxN1wiIFxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2NyZWF0ZWRBdD1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImRhdGE/LmNyZWF0ZWRBdFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMTM6MTdcIj57eyBmb3JtYXREYXRlKGRhdGEuY3JlYXRlZEF0KSB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI2lzQWN0aXZlPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJhZGdlIFxuICAgICAgICAgICAgICAgICAgICA6c3RhdHVzPVwiZGF0YT8uaXNBY3RpdmUgPyAnQUNUSVZFJyA6ICdJTkFDVElWRSdcIiBcbiAgICAgICAgICAgICAgICAgICAgcGlsbCBcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCIgXG4gICAgICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwidGFyZ2V0U3RhdHVzVXNlcj8uaWQgPT09IGRhdGEuaWQgJiYgaXNVcGRhdGluZ1N0YXR1c1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMTY6MTdcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2RvYj1cInsgZGF0YSB9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjEyNToxN1wiPnt7IGRhdGE/LmRvYiB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICNnZW5kZXI9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMjg6MTdcIj57eyBkYXRhPy5nZW5kZXIgfHwgJy0nIH19PC9zcGFuPlxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjcG9iPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTMxOjE3XCI+e3sgZGF0YT8ucG9iIHx8ICctJyB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgI3Bob25lPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTM0OjE3XCI+e3sgZGF0YT8uVXNlclByb2ZpbGU/LnBob25lX251bWJlciB8fCBkYXRhPy5wcm9maWxlPy5waG9uZSB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICNzY2hvb2w9XCJ7IGRhdGEgfVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxMzc6MTdcIj57eyBkYXRhPy5Vc2VyUHJvZmlsZT8udW5pdmVyc2l0eV9uYW1lIHx8IGRhdGE/LnByb2ZpbGU/LnVuaXZlcnNpdHlfbmFtZSB8fCAnLScgfX08L3NwYW4+XG4gICAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICAgICAgPHRlbXBsYXRlICN5ZWFyPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTQwOjE3XCI+e3sgZ2V0WWVhckxhYmVsKGRhdGE/LlVzZXJQcm9maWxlPy51bml2ZXJzaXR5X3llYXIgfHwgZGF0YT8ucHJvZmlsZT8udW5pdmVyc2l0eV95ZWFyKSB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG5cbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjYWN0aW9uPVwieyBkYXRhIH1cIj5cbiAgICAgICAgICAgICAgICA8QmFzZUFjdGlvbk1lbnUgOml0ZW1zPVwiZ2V0QWN0aW9uSXRlbXMoZGF0YSlcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTQ0OjE3XCIgLz5cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgIDwvQmFzZVRhYmxlPlxuICAgIDwvZGl2PlxuXG4gICAgPEJhc2VEcmF3ZXIgdi1tb2RlbD1cInNob3dVc2VyRGV0YWlsXCIgdGl0bGU9XCJEZXRhaWxzXCIgd2lkdGg9XCIzMHJlbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNDk6NVwiPlxuICAgICAgICA8VXNlckRldGFpbFZpZXcgdi1pZj1cInNob3dVc2VyRGV0YWlsXCIgOnVzZXI9XCJ1c2VyRGV0YWlsXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1MDo5XCIgLz5cbiAgICA8L0Jhc2VEcmF3ZXI+XG5cbiAgICA8QmFzZU1vZGFsIHYtbW9kZWw9XCJzaG93UmVzZXRNb2RhbFwiIHRpdGxlPVwiUmVzZXQgUGFzc3dvcmRcIiBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTUzOjVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1NDo5XCI+XG4gICAgICAgICAgICA8cCBjbGFzcz1cIm1iLTQgZnctbWVkaXVtIHRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU1OjEzXCI+QXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0IHRoaXMgdXNlcidzIHBhc3N3b3JkPzwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggZ2FwLTJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTU2OjEzXCI+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gdmFyaWFudD1cIm91dGxpbmUtd2FybmluZ1wiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgtZ3Jvdy0xXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiY2FuY2VsUmVzZXRQYXNzd29yZCgpXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE1NzoxN1wiPlxuICAgICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gdmFyaWFudD1cIndhcm5pbmdcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiIEBjbGljaz1cImNvbmZpcm1SZXNldFBhc3N3b3JkKClcIiA6aXNMb2FkaW5nPVwiaXNSZXNldGluZ1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNjE6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAge3sgaXNSZXNldGluZyA/ICdSZXNldGluZy4uLicgOiAnUmVzZXQgTm93JyB9fVxuICAgICAgICAgICAgICAgIDwvQmFzZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L0Jhc2VNb2RhbD5cblxuICAgIDxCYXNlTW9kYWwgdi1tb2RlbD1cInNob3dTdGF0dXNNb2RhbFwiIDp0aXRsZT1cInRhcmdldFN0YXR1c1VzZXI/LmlzQWN0aXZlID8gJ0RlYWN0aXZhdGUgVXNlcicgOiAnQWN0aXZhdGUgVXNlcidcIiBzaXplPVwic21cIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTY4OjVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE2OTo5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWItMyBkLWlubGluZS1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyIHJvdW5kZWQtY2lyY2xlXCIgXG4gICAgICAgICAgICAgICAgIDpjbGFzcz1cInRhcmdldFN0YXR1c1VzZXI/LmlzQWN0aXZlID8gJ2JnLWRhbmdlci1zdWJ0bGUgdGV4dC1kYW5nZXInIDogJ2JnLXN1Y2Nlc3Mtc3VidGxlIHRleHQtc3VjY2VzcydcIiBcbiAgICAgICAgICAgICAgICAgc3R5bGU9XCJ3aWR0aDogNjBweDsgaGVpZ2h0OiA2MHB4O1wiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNzA6MTNcIj5cbiAgICAgICAgICAgICAgICA8WCB2LWlmPVwidGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmVcIiA6c2l6ZT1cIjI4XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3MzoxN1wiIC8+XG4gICAgICAgICAgICAgICAgPENoZWNrIHYtZWxzZSA6c2l6ZT1cIjI4XCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE3NDoxN1wiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwibWItNCBmdy1tZWRpdW0gdGV4dC1tdXRlZFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNzY6MTNcIj5cbiAgICAgICAgICAgICAgICBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8ge3sgdGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmUgPyAnZGVhY3RpdmF0ZScgOiAnYWN0aXZhdGUnIH19XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cInRleHQtYmFzZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxNzg6MTdcIj57eyB0YXJnZXRTdGF0dXNVc2VyPy5maXJzdE5hbWUgfX0ge3sgdGFyZ2V0U3RhdHVzVXNlcj8ubGFzdE5hbWUgfX08L3N0cm9uZz4/XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZC1mbGV4IGdhcC0yXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE4MDoxM1wiPlxuICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIDp2YXJpYW50PVwidGFyZ2V0U3RhdHVzVXNlcj8uaXNBY3RpdmUgPyAnb3V0bGluZS1kYW5nZXInIDogJ291dGxpbmUtc3VjY2VzcydcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNob3dTdGF0dXNNb2RhbCA9IGZhbHNlXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE4MToxN1wiPlxuICAgICAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICAgICAgPEJhc2VCdXR0b24gOnZhcmlhbnQ9XCJ0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZSA/ICdkYW5nZXInIDogJ3N1Y2Nlc3MnXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleC1ncm93LTFcIiBcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiY29uZmlybVN0YXR1c0NoYW5nZSgpXCIgOmlzLUxvYWRpbmc9XCJpc1VwZGF0aW5nU3RhdHVzXCIgZGF0YS12LWluc3BlY3Rvcj1cInNyYy92aWV3cy9hZG1pbi91c2Vycy9Vc2VyTGlzdFZpZXcudnVlOjE4NToxN1wiPlxuICAgICAgICAgICAgICAgICAgICB7eyBpc1VwZGF0aW5nU3RhdHVzID8gJ1VwZGF0aW5nLi4uJyA6ICh0YXJnZXRTdGF0dXNVc2VyPy5pc0FjdGl2ZSA/ICdEZWFjdGl2YXRlIE5vdycgOiAnQWN0aXZhdGUgTm93JykgfX1cbiAgICAgICAgICAgICAgICA8L0Jhc2VCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9CYXNlTW9kYWw+XG5cbiAgICA8QmFzZU1vZGFsIHYtbW9kZWw9XCJzaG93Q2hhbmdlUm9sZU1vZGFsXCIgdGl0bGU9XCJDaGFuZ2UgUm9sZVwiIHNpemU9XCJzbVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTM6NVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk0OjlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYi0zIGQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGp1c3RpZnktY29udGVudC1jZW50ZXIgcm91bmRlZC1jaXJjbGUgYmctaW5mby1zdWJ0bGUgdGV4dC1pbmZvXCIgXG4gICAgICAgICAgICAgICAgIHN0eWxlPVwid2lkdGg6IDYwcHg7IGhlaWdodDogNjBweDtcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk1OjEzXCI+XG4gICAgICAgICAgICAgICAgPEdyYWR1YXRpb25DYXAgdi1pZj1cInRhcmdldENoYW5nZVJvbGVJZCA9PT0gNFwiIDpzaXplPVwiMjhcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MTk3OjE3XCIgLz5cbiAgICAgICAgICAgICAgICA8VXNlciB2LWVsc2UgOnNpemU9XCIyOFwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToxOTg6MTdcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8cCBjbGFzcz1cIm1iLTQgZnctbWVkaXVtIHRleHQtbXV0ZWRcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MjAwOjEzXCI+XG4gICAgICAgICAgICAgICAgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNoYW5nZSByb2xlIHRvIFxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJ0ZXh0LWJhc2VcIiBkYXRhLXYtaW5zcGVjdG9yPVwic3JjL3ZpZXdzL2FkbWluL3VzZXJzL1VzZXJMaXN0Vmlldy52dWU6MjAyOjE3XCI+e3sgdGFyZ2V0Q2hhbmdlUm9sZUlkID09PSA0ID8gJ1N0dWRlbnQnIDogJ01vbmsnIH19PC9zdHJvbmc+P1xuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBnYXAtMlwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDQ6MTNcIj5cbiAgICAgICAgICAgICAgICA8QmFzZUJ1dHRvbiB2YXJpYW50PVwib3V0bGluZS1zZWNvbmRhcnlcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4LWdyb3ctMVwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNob3dDaGFuZ2VSb2xlTW9kYWwgPSBmYWxzZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDU6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgICAgPC9CYXNlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxCYXNlQnV0dG9uIHZhcmlhbnQ9XCJpbmZvXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleC1ncm93LTEgdGV4dC13aGl0ZVwiIFxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjb25maXJtQ2hhbmdlUm9sZSgpXCIgOmlzLUxvYWRpbmc9XCJpc0NoYW5naW5nUm9sZVwiIGRhdGEtdi1pbnNwZWN0b3I9XCJzcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZToyMDk6MTdcIj5cbiAgICAgICAgICAgICAgICAgICAge3sgaXNDaGFuZ2luZ1JvbGUgPyAnVXBkYXRpbmcuLi4nIDogJ0NoYW5nZSBOb3cnIH19XG4gICAgICAgICAgICAgICAgPC9CYXNlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvQmFzZU1vZGFsPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdCBzZXR1cD5cbmNvbnN0IGVtaXQgPSBkZWZpbmVFbWl0cyhbJ25ldycsICdlZGl0JywgJ2ltcG9ydCcsICdwcmV2aWV3LWJ1bGsnXSk7XG5pbXBvcnQgeyB1c2VVc2VyU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy91c2Vycy91c2VyLmpzJztcbmltcG9ydCB7IG9uTW91bnRlZCwgcmVmLCBjb21wdXRlZCwgd2F0Y2ggfSBmcm9tICd2dWUnO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gJ0AvdXRpbHMvZGF0ZUZvcm1hdCc7XG5pbXBvcnQgeyBCYWRnZUNoZWNrLCBJbmZvLCBVc2VyLCBLZXlSb3VuZCwgU2VhcmNoLCBGaWxlRG93biwgQ2hlY2ssIFgsIEJvb2tPcGVuLCBHcmFkdWF0aW9uQ2FwIH0gZnJvbSAnQGx1Y2lkZS92dWUnO1xuaW1wb3J0IFVzZXJEZXRhaWxWaWV3IGZyb20gJy4vVXNlckRldGFpbFZpZXcudnVlJztcbmltcG9ydCB7IHVzZUF1dGhTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2F1dGguanMnO1xuaW1wb3J0IHsgdXNlVG9hc3RTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL3RvYXN0LmpzJztcbmltcG9ydCB7IHVzZVVzZXJMaXN0IH0gZnJvbSAnQC9jb21wb3NhYmxlcy91c2Vycy91c2VVc2VyTGlzdC5qcyc7XG5pbXBvcnQgUGFwYSBmcm9tICdwYXBhcGFyc2UnO1xuXG5pbXBvcnQgYXBpIGZyb20gJ0AvYXBpL2FwaS5qcyc7XG5cbmNvbnN0IHVzZXJTdG9yZSA9IHVzZVVzZXJTdG9yZSgpO1xuY29uc3QgYXV0aFN0b3JlID0gdXNlQXV0aFN0b3JlKCk7XG5jb25zdCB0b2FzdFN0b3JlID0gdXNlVG9hc3RTdG9yZSgpO1xuXG5jb25zdCB7XG4gICAgc2hvd1Jlc2V0TW9kYWwsXG4gICAgc2hvd1VzZXJEZXRhaWwsXG4gICAgdXNlckRldGFpbCxcbiAgICBpc0xvYWRpbmcsXG4gICAgb25WaWV3RGV0YWlsLFxuICAgIG9uUmVzZXRQYXNzd29yZCxcbiAgICBoYW5kbGVSZXNldFBhc3N3b3JkLFxuICAgIG9uQ2FuY2VsUmVzZXQsXG4gICAgc2VhcmNoQW5kRmlsdGVyXG59ID0gdXNlVXNlckxpc3QodXNlclN0b3JlLCBhdXRoU3RvcmUsIHRvYXN0U3RvcmUpO1xuXG5jb25zdCBzZWFyY2hRdWVyeSA9IHNlYXJjaEFuZEZpbHRlcj8uc2VhcmNoUXVlcnkgfHwgcmVmKCcnKTtcbmNvbnN0IGZpbHRlcnMgPSBzZWFyY2hBbmRGaWx0ZXI/LmZpbHRlcnMgfHwgcmVmKHsgcm9sZUlkOiBudWxsLCBpc0FjdGl2ZTogbnVsbCwga3V0SWQ6IG51bGwgfSk7XG5cbmNvbnN0IGFjdGl2ZUZpbHRlciA9IGNvbXB1dGVkKHtcbiAgICBnZXQ6ICgpID0+IGZpbHRlcnMudmFsdWUucm9sZUlkLFxuICAgIHNldDogKHZhbCkgPT4ge1xuICAgICAgICBmaWx0ZXJzLnZhbHVlLnJvbGVJZCA9IHZhbDtcbiAgICB9XG59KTtcblxuY29uc3Qga3V0cyA9IHJlZihbXSk7XG5jb25zdCBrdXRPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgIGNvbnN0IHNvcnRlZEt1dHMgPSBbLi4ua3V0cy52YWx1ZV0uc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBudW1BID0gcGFyc2VJbnQoYS5uYW1lLnJlcGxhY2UoL1xcRC9nLCAnJyksIDEwKSB8fCAwO1xuICAgICAgICBjb25zdCBudW1CID0gcGFyc2VJbnQoYi5uYW1lLnJlcGxhY2UoL1xcRC9nLCAnJyksIDEwKSB8fCAwO1xuICAgICAgICBpZiAobnVtQSAhPT0gbnVtQikgcmV0dXJuIG51bUEgLSBudW1CO1xuICAgICAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW1xuICAgICAgICB7IGxhYmVsOiAnS3VkaSAvIOGegOGeu+GeiuGet+GekeGetuGfhuGehOGeouGen+GfiycsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIC4uLnNvcnRlZEt1dHMubWFwKGsgPT4gKHtcbiAgICAgICAgICAgIGxhYmVsOiBrLm5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogay5pZFxuICAgICAgICB9KSlcbiAgICBdO1xufSk7XG5cbm9uTW91bnRlZChhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBpLmdldCgnL2t1dHMnKTtcbiAgICAgICAgaWYgKHJlcy5kYXRhPy5zdWNjZXNzKSB7XG4gICAgICAgICAgICBrdXRzLnZhbHVlID0gcmVzLmRhdGEuZGF0YTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2gga3V0c1wiLCBlcnJvcik7XG4gICAgfVxufSk7XG5cbmNvbnN0IGhhc0FjdGl2ZUZpbHRlcnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgcmV0dXJuICEhc2VhcmNoUXVlcnkudmFsdWUgfHwgXG4gICAgICAgICAgIGZpbHRlcnMudmFsdWUuaXNBY3RpdmUgIT09IG51bGwgfHwgXG4gICAgICAgICAgIGZpbHRlcnMudmFsdWUucm9sZUlkICE9PSBudWxsIHx8XG4gICAgICAgICAgIGZpbHRlcnMudmFsdWUua3V0SWQgIT09IG51bGw7XG59KTtcblxuY29uc3QgcmVzZXRGaWx0ZXJzID0gKCkgPT4ge1xuICAgIHNlYXJjaFF1ZXJ5LnZhbHVlID0gJyc7XG4gICAgZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSA9IG51bGw7XG4gICAgZmlsdGVycy52YWx1ZS5yb2xlSWQgPSBudWxsO1xuICAgIGZpbHRlcnMudmFsdWUua3V0SWQgPSBudWxsO1xufTtcblxuY29uc3QgY3N2SW5wdXRSZWYgPSByZWYobnVsbCk7XG5cbmNvbnN0IHRyaWdnZXJGaWxlSW5wdXQgPSAoKSA9PiB7XG4gICAgaWYgKGNzdklucHV0UmVmLnZhbHVlKSB7XG4gICAgICAgIGNzdklucHV0UmVmLnZhbHVlLmNsaWNrKCk7XG4gICAgfVxufTtcblxuY29uc3Qgb25GaWxlU2VsZWN0ZWQgPSAoZSkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcblxuICAgIGlmIChmaWxlLnR5cGUgIT09ICd0ZXh0L2NzdicgJiYgIWZpbGUubmFtZS5lbmRzV2l0aCgnLmNzdicpKSB7XG4gICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KCdPbmx5IENTViBmaWxlcyBhcmUgYWxsb3dlZC4nLCAnZGFuZ2VyJyk7XG4gICAgICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBQYXBhLnBhcnNlKGZpbGUsIHtcbiAgICAgICAgaGVhZGVyOiB0cnVlLFxuICAgICAgICBza2lwRW1wdHlMaW5lczogdHJ1ZSxcbiAgICAgICAgY29tcGxldGU6IChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdG9hc3RTdG9yZS5zaG93VG9hc3QoJ0Vycm9yIHBhcnNpbmcgQ1NWIGZpbGUuJywgJ2RhbmdlcicpO1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBraG1lclRvRW5nbGlzaERpZ2l0cyA9IChzdHIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgICfhn6AnOiAnMCcsICfhn6EnOiAnMScsICfhn6InOiAnMicsICfhn6MnOiAnMycsICfhn6QnOiAnNCcsXG4gICAgICAgICAgICAgICAgICAgICfhn6UnOiAnNScsICfhn6YnOiAnNicsICfhn6cnOiAnNycsICfhn6gnOiAnOCcsICfhn6knOiAnOSdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvW+GfoC3hn6ldL2csIG0gPT4gbWFwW21dKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGdldEtobWVyTW9udGhOdW1iZXIgPSAobW9udGhTdHIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb250aHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICfhnpjhnoDhnprhnrYnOiAnMDEnLCAn4Z6A4Z674Z6Y4Z+S4Z6X4Z+IJzogJzAyJywgJ+GemOGeuOGek+Getic6ICcwMycsICfhnpjhn4Hhnp/hnrYnOiAnMDQnLFxuICAgICAgICAgICAgICAgICAgICAn4Z6n4Z6f4Z6X4Z62JzogJzA1JywgJ+GemOGet+GekOGeu+Gek+Getic6ICcwNicsICfhnoDhnoDhn5LhnoDhnorhnrYnOiAnMDcnLCAn4Z6f4Z644Z6g4Z62JzogJzA4JyxcbiAgICAgICAgICAgICAgICAgICAgJ+GegOGeieGfkuGeieGetic6ICcwOScsICfhno/hnrvhnpvhnrYnOiAnMTAnLCAn4Z6c4Z634Z6F4Z+S4Z6G4Z634Z6A4Z62JzogJzExJywgJ+GekuGfkuGek+GevCc6ICcxMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbSBpbiBtb250aHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vbnRoU3RyLmluY2x1ZGVzKG0pKSByZXR1cm4gbW9udGhzW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbmRWYWwgPSAocm93LCBrZXl3b3JkcywgZXhjbHVkZUtleXdvcmRzID0gW10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocm93KTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsZWFuS2V5ID0ga2V5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBpZiBrZXkgbWF0Y2hlcyBhbnkgZXhjbHVzaW9uIGtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXggb2YgZXhjbHVkZUtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xlYW5LZXkuaW5jbHVkZXMoZXgudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGt3IG9mIGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xlYW5LZXkuaW5jbHVkZXMoa3cudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm93W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1c2VycyA9IHJlc3VsdHMuZGF0YVxuICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMS4gUGFyc2UgTmFtZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lVmFsID0gZmluZFZhbChyb3csIFsn4Z6C4Z+E4Z6P4Z+S4Z6P4Z6T4Z624Z6YLeGek+GetuGemCcsICdmdWxsIG5hbWUnLCAnbmFtZScsICfhnojhn5Lhnpjhn4Thn4cnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdE5hbWUgPSBmaW5kVmFsKHJvdywgWydmaXJzdE5hbWUnLCAnZmlyc3ROYW1lS2gnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYXN0TmFtZSA9IGZpbmRWYWwocm93LCBbJ2xhc3ROYW1lJywgJ2xhc3ROYW1lS2gnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZVZhbCAmJiAhZmlyc3ROYW1lICYmICFsYXN0TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSBTdHJpbmcobmFtZVZhbCkudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lID0gcGFydHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lID0gcGFydHMuc2xpY2UoMSkuam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZSA9IHBhcnRzWzBdIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gMi4gUGFyc2UgRGF0ZSBvZiBCaXJ0aFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByYXdEb2IgPSBmaW5kVmFsKHJvdywgWyfhnpDhn5LhnoThn4PhnoHhn4Lhnobhn5LhnpPhnrbhn4bhnoDhn4bhno7hnr7hno8nLCAnZGF0ZSBvZiBiaXJ0aCcsICdkb2InLCAn4Z6A4Z+G4Z6O4Z6+4Z6PJ10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZG9iID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhd0RvYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZERvYiA9IGtobWVyVG9FbmdsaXNoRGlnaXRzKFN0cmluZyhyYXdEb2IpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGNsZWFuZWREb2Iuc3BsaXQoL1tcXHNcXC5cXC1cXC9dKy8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXkgPSBwYXJ0c1swXS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb250aCA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB5ZWFyID0gcGFydHNbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2hNb250aCA9IGdldEtobWVyTW9udGhOdW1iZXIobW9udGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChraE1vbnRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoID0ga2hNb250aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb250aCA9IG1vbnRoLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHllYXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh5ZWFyLCAxMCkgPiA1MCA/ICcxOScgKyB5ZWFyIDogJzIwJyArIHllYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh5ZWFyLmxlbmd0aCA9PT0gNCAmJiAhaXNOYU4oZGF5KSAmJiAhaXNOYU4obW9udGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvYiA9IGAke3llYXJ9LSR7bW9udGh9LSR7ZGF5fWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gMy4gUGFyc2UgT3RoZXIgRmllbGRzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaGF5YV9udW1iZXIgPSBmaW5kVmFsKHJvdywgWyfhnpvhn4HhnoHhnobhnrbhnpnhnrYnLCAn4LmA4Lil4LiC4LiJ4Liy4Lii4LiyJywgJ+Gem+GfgeGegeGeouGej+GfkuGej+Gen+GeieGfkuGeieGetuGejuGelOGfkOGejuGfkuGejicsICfhnqLhno/hn5Lhno/hnp/hnonhn5Lhnonhnrbhno4nLCAnY2hoYXlhJywgJ+GehuGetuGemeGeticsICdpZCBudW1iZXInXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBob25lX251bWJlciA9IGZpbmRWYWwocm93LCBbJ+Gem+GfgeGegeGekeGevOGemuGen+GfkOGeluGfkuGekScsICdwaG9uZScsICfhnpHhnrzhnprhnp/hn5Dhnpbhn5LhnpEnLCAn4Z6R4Z684Z6a4Z6f4Z6W4Z+S4Z6RJ10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml2ZXJzaXR5X25hbWUgPSBmaW5kVmFsKHJvdywgWyfhnprhn4DhnpPhnpPhn4UnLCAnc2Nob29sJywgJ3VuaXZlcnNpdHknLCAn4Z6f4Z624Z6b4Z62J10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml2ZXJzaXR5X3llYXIgPSBmaW5kVmFsKHJvdywgWyfhnobhn5LhnpPhnrbhn4bhnpHhnrgnLCAneWVhciddLCBbJ+GegOGfhuGejuGevuGejycsICdiaXJ0aCddKSB8fCAnJzsgLy8gRXhjbHVkZSBnZW5lcmljIFwiYmlydGgvYmlydGhkYXRlXCIga2V5d29yZHMgZnJvbSB5ZWFyIGZpZWxkXG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbXVuZSA9IGZpbmRWYWwocm93LCBbJ+Geg+Geu+GfhicsICdjb21tdW5lJ10pIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXN0cmljdCA9IGZpbmRWYWwocm93LCBbJ+Gen+GfkuGemuGeu+GegCcsICdkaXN0cmljdCddKSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvdmluY2UgPSBmaW5kVmFsKHJvdywgWyfhnoHhn4Hhno/hn5Lhno8nLCAncHJvdmluY2UnXSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyb21fd2F0ID0gZmluZFZhbChyb3csIFsn4Z6Y4Z6A4Z6W4Z644Z6c4Z6P4Z+S4Z6PJywgJ2Zyb21fd2F0JywgJ3dhdCcsICfhnpzhno/hn5Lhno8nXSkgfHwgJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke2xhc3ROYW1lfSAke2ZpcnN0TmFtZX1gLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogZmlyc3ROYW1lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiBsYXN0TmFtZS50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2IsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGhheWFfbnVtYmVyOiBjaGhheWFfbnVtYmVyLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lX251bWJlcjogcGhvbmVfbnVtYmVyLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNpdHlfbmFtZTogdW5pdmVyc2l0eV9uYW1lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNpdHlfeWVhcjogdW5pdmVyc2l0eV95ZWFyLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21fd2F0OiBmcm9tX3dhdC50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tdW5lOiBjb21tdW5lLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RyaWN0OiBkaXN0cmljdC50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aW5jZTogcHJvdmluY2UudHJpbSgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHUgPT4gdS5maXJzdE5hbWUgJiYgdS5sYXN0TmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh1c2Vycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdCgnTm8gdmFsaWQgdXNlcnMgY29udGFpbmluZyBuYW1lIGZvdW5kIGluIENTVi4nLCAnZGFuZ2VyJyk7XG4gICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVzZXJTdG9yZS5wYXJzZWRCdWxrVXNlcnMgPSB1c2VycztcbiAgICAgICAgICAgIGVtaXQoJ3ByZXZpZXctYnVsaycpO1xuICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRvYXN0U3RvcmUuc2hvd1RvYXN0KCdFcnJvciByZWFkaW5nIHRoZSBmaWxlLicsICdkYW5nZXInKTtcbiAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmNvbnN0IGZpbHRlck9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFtcbiAgICAgICAgeyBsYWJlbDogJ0FsbCBVc2VycycsIHZhbHVlOiBudWxsLCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1snYWxsJ10sIHZhcmlhbnQ6ICdwcmltYXJ5JyB9XG4gICAgXTtcbiAgICBcbiAgICBpZiAoYXV0aFN0b3JlLmlzU3VwZXJBZG1pbikge1xuICAgICAgICBvcHRpb25zLnB1c2goeyBsYWJlbDogJ+GemOGfgeGegOGeu+GeiuGetycsIHZhbHVlOiAyLCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1syXSwgdmFyaWFudDogJ3N1Y2Nlc3MnIH0pO1xuICAgIH1cbiAgICBcbiAgICBvcHRpb25zLnB1c2goXG4gICAgICAgIHsgbGFiZWw6ICfhnpfhnrfhnoDhn5LhnoHhnrsnLCB2YWx1ZTogNywgYmFkZ2U6IHVzZXJTdG9yZS5yb2xlU3RhdHNbN10sIHZhcmlhbnQ6ICd3YXJuaW5nJyB9LFxuICAgICAgICB7IGxhYmVsOiAn4Z6f4Z624Z6Y4Z6O4Z+B4Z6aJywgdmFsdWU6IDMsIGJhZGdlOiB1c2VyU3RvcmUucm9sZVN0YXRzWzNdLCB2YXJpYW50OiAnaW5mbycgfSxcbiAgICAgICAgeyBsYWJlbDogJ+Gen+Get+Gen+GfkuGen+Gek+Get+Gen+GfkuGen+Get+GejycsIHZhbHVlOiA0LCBiYWRnZTogdXNlclN0b3JlLnJvbGVTdGF0c1s0XSwgdmFyaWFudDogJ3NlY29uZGFyeScgfVxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59KTtcblxuY29uc3Qgc3RhdHVzT3B0aW9ucyA9IHJlZihbXG4gICAgeyBsYWJlbDogJ0FsbCBTdGF0dXMnLCB2YWx1ZTogbnVsbCB9LFxuICAgIHsgbGFiZWw6ICdBY3RpdmUnLCB2YWx1ZTogdHJ1ZSB9LFxuICAgIHsgbGFiZWw6ICdJbmFjdGl2ZScsIHZhbHVlOiBmYWxzZSB9XG5dKTtcblxuY29uc3QgZ2V0Um9sZVZhcmlhbnQgPSAocm9sZUlkKSA9PiB7XG4gICAgc3dpdGNoKHJvbGVJZCkge1xuICAgICAgICBjYXNlIDE6IHJldHVybiAnZGFuZ2VyJzsgLy8gU3VwZXJBZG1pblxuICAgICAgICBjYXNlIDI6IHJldHVybiAnc3VjY2Vzcyc7IC8vIEFkbWluL01la3VkaVxuICAgICAgICBjYXNlIDM6IHJldHVybiAnaW5mbyc7IC8vIE1vbmtcbiAgICAgICAgY2FzZSA0OiByZXR1cm4gJ3NlY29uZGFyeSc7IC8vIFN0dWRlbnRcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuICdzZWNvbmRhcnknO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldFJvbGVJY29uID0gKHJvbGVJZCkgPT4ge1xuICAgIHN3aXRjaChyb2xlSWQpIHtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gQmFkZ2VDaGVjaztcbiAgICAgICAgY2FzZSAyOiByZXR1cm4gQm9va09wZW47XG4gICAgICAgIGNhc2UgMzogcmV0dXJuIFVzZXI7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBVc2VyO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldFVzZXJSb3dDbGFzcyA9IChkYXRhKSA9PiB7XG4gICAgcmV0dXJuIChkYXRhICYmIGRhdGEuaWQgJiYgZGF0YS5pc0FjdGl2ZSA9PT0gZmFsc2UpID8gJ3Jvdy1ib3JkZXItc2Vjb25kYXJ5IG9wYWNpdHktNzUnIDogJyc7XG59O1xuXG5jb25zdCBpc1Jlc2V0aW5nID0gcmVmKGZhbHNlKTtcblxuY29uc3QgdG9nZ2xlUmVzZXQgPSAoZXZlbnQsIGlkKSA9PiB7XG4gICAgb25SZXNldFBhc3N3b3JkKGlkKTtcbiAgICBzaG93UmVzZXRNb2RhbC52YWx1ZSA9IHRydWU7XG59XG5cbmNvbnN0IGdldEFjdGlvbkl0ZW1zID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBpdGVtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdWaWV3IERldGFpbHMnLFxuICAgICAgICAgICAgaWNvbjogSW5mbyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICgpID0+IG9uVmlld0RldGFpbChkYXRhKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IGRhdGEuaXNBY3RpdmUgPyAnRGVhY3RpdmF0ZSBVc2VyJyA6ICdBY3RpdmF0ZSBVc2VyJyxcbiAgICAgICAgICAgIGljb246IGRhdGEuaXNBY3RpdmUgPyBYIDogQ2hlY2ssXG4gICAgICAgICAgICBjb21tYW5kOiAoKSA9PiBwcm9tcHRUb2dnbGVTdGF0dXMoZGF0YSksXG4gICAgICAgICAgICBpY29uQ2xhc3M6IGRhdGEuaXNBY3RpdmUgPyAndGV4dC1kYW5nZXInIDogJ3RleHQtc3VjY2VzcydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdSZXNldCBQYXNzd29yZCcsXG4gICAgICAgICAgICBpY29uOiBLZXlSb3VuZCxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICh7IG9yaWdpbmFsRXZlbnQgfSkgPT4gdG9nZ2xlUmVzZXQob3JpZ2luYWxFdmVudCwgZGF0YS5pZCksXG4gICAgICAgICAgICBpY29uQ2xhc3M6ICd0ZXh0LXdhcm5pbmcnXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgaWYgKChhdXRoU3RvcmUuaXNBZG1pbiB8fCBhdXRoU3RvcmUuaXNTdXBlckFkbWluKSAmJiBkYXRhLnJvbGUpIHtcbiAgICAgICAgaWYgKGRhdGEucm9sZS5pZCA9PT0gMyB8fCBkYXRhLnJvbGUuaWQgPT09IDcpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ2hhbmdlIHRvIFN0dWRlbnQnLFxuICAgICAgICAgICAgICAgIGljb246IEdyYWR1YXRpb25DYXAsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogKCkgPT4gcHJvbXB0Q2hhbmdlUm9sZShkYXRhLCA0KSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICd0ZXh0LWluZm8nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnJvbGUuaWQgPT09IDQpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ2hhbmdlIHRvIE1vbmsnLFxuICAgICAgICAgICAgICAgIGljb246IFVzZXIsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogKCkgPT4gcHJvbXB0Q2hhbmdlUm9sZShkYXRhLCAzKSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICd0ZXh0LWluZm8nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbn07XG5cbmNvbnN0IGNvbmZpcm1SZXNldFBhc3N3b3JkID0gYXN5bmMgKCkgPT4ge1xuICAgIGlzUmVzZXRpbmcudmFsdWUgPSB0cnVlO1xuICAgIGF3YWl0IGhhbmRsZVJlc2V0UGFzc3dvcmQoKTtcbiAgICBpc1Jlc2V0aW5nLnZhbHVlID0gZmFsc2U7XG4gICAgc2hvd1Jlc2V0TW9kYWwudmFsdWUgPSBmYWxzZTtcbn1cblxuY29uc3QgY2FuY2VsUmVzZXRQYXNzd29yZCA9ICgpID0+IHtcbiAgICBvbkNhbmNlbFJlc2V0KCk7XG4gICAgc2hvd1Jlc2V0TW9kYWwudmFsdWUgPSBmYWxzZTtcbn1cblxuY29uc3Qgc2hvd1N0YXR1c01vZGFsID0gcmVmKGZhbHNlKTtcbmNvbnN0IHRhcmdldFN0YXR1c1VzZXIgPSByZWYobnVsbCk7XG5jb25zdCBpc1VwZGF0aW5nU3RhdHVzID0gcmVmKGZhbHNlKTtcblxuY29uc3Qgc2hvd0NoYW5nZVJvbGVNb2RhbCA9IHJlZihmYWxzZSk7XG5jb25zdCB0YXJnZXRDaGFuZ2VSb2xlVXNlciA9IHJlZihudWxsKTtcbmNvbnN0IHRhcmdldENoYW5nZVJvbGVJZCA9IHJlZihudWxsKTtcbmNvbnN0IGlzQ2hhbmdpbmdSb2xlID0gcmVmKGZhbHNlKTtcblxuY29uc3QgcHJvbXB0Q2hhbmdlUm9sZSA9IChkYXRhLCByb2xlSWQpID0+IHtcbiAgICBjb25zdCBpc0N1cnJlbnRVc2VyID0gKGF1dGhTdG9yZT8udXNlcj8uaWQgPT09IGRhdGE/LmlkKTtcbiAgICBpZiAoaXNDdXJyZW50VXNlcikge1xuICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdChcIkNhbm5vdCBjaGFuZ2UgeW91ciBvd24gcm9sZSBoZXJlXCIsICd3YXJuaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGFyZ2V0Q2hhbmdlUm9sZVVzZXIudmFsdWUgPSBkYXRhO1xuICAgIHRhcmdldENoYW5nZVJvbGVJZC52YWx1ZSA9IHJvbGVJZDtcbiAgICBzaG93Q2hhbmdlUm9sZU1vZGFsLnZhbHVlID0gdHJ1ZTtcbn07XG5cbmNvbnN0IGNvbmZpcm1DaGFuZ2VSb2xlID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdGFyZ2V0Q2hhbmdlUm9sZVVzZXIudmFsdWUgfHwgIXRhcmdldENoYW5nZVJvbGVJZC52YWx1ZSkgcmV0dXJuO1xuICAgIGNvbnN0IGRhdGEgPSB0YXJnZXRDaGFuZ2VSb2xlVXNlci52YWx1ZTtcbiAgICBcbiAgICBpc0NoYW5naW5nUm9sZS52YWx1ZSA9IHRydWU7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXNlclN0b3JlLmNoYW5nZVVzZXJSb2xlKGRhdGEuaWQsIHRhcmdldENoYW5nZVJvbGVJZC52YWx1ZSk7XG4gICAgaXNDaGFuZ2luZ1JvbGUudmFsdWUgPSBmYWxzZTtcblxuICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgc2hvd0NoYW5nZVJvbGVNb2RhbC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpbmRleCA9IHVzZXJTdG9yZS51c2Vycy5maW5kSW5kZXgodSA9PiB1LmlkID09PSBkYXRhLmlkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgdXNlclN0b3JlLnVzZXJzW2luZGV4XS5yb2xlID0gcmVzdWx0LmRhdGE/LlJvbGUgfHwgcmVzdWx0LmRhdGE/LnJvbGU7XG4gICAgICAgICAgICB1c2VyU3RvcmUudXNlcnNbaW5kZXhdLnJvbGVfaWQgPSB0YXJnZXRDaGFuZ2VSb2xlSWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBwcm9tcHRUb2dnbGVTdGF0dXMgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IGlzQ3VycmVudFVzZXIgPSAoYXV0aFN0b3JlPy51c2VyPy5pZCA9PT0gZGF0YT8uaWQpICYmIChhdXRoU3RvcmU/LnVzZXI/LnJvbGU/LmlkID09PSAxKTtcbiAgICBpZiAoaXNDdXJyZW50VXNlcikge1xuICAgICAgICB0b2FzdFN0b3JlLnNob3dUb2FzdChcIkNhbm5vdCB1cGRhdGUgY3VycmVudCB1c2VyJ3Mgc3RhdHVzXCIsICd3YXJuaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGFyZ2V0U3RhdHVzVXNlci52YWx1ZSA9IGRhdGE7XG4gICAgc2hvd1N0YXR1c01vZGFsLnZhbHVlID0gdHJ1ZTtcbn07XG5cbmNvbnN0IGNvbmZpcm1TdGF0dXNDaGFuZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF0YXJnZXRTdGF0dXNVc2VyLnZhbHVlKSByZXR1cm47XG4gICAgY29uc3QgZGF0YSA9IHRhcmdldFN0YXR1c1VzZXIudmFsdWU7XG4gICAgXG4gICAgaXNVcGRhdGluZ1N0YXR1cy52YWx1ZSA9IHRydWU7XG5cbiAgICBjb25zdCBvcmlnaW5hbFN0YXR1cyA9IGRhdGEuaXNBY3RpdmU7XG4gICAgY29uc3QgbmV3U3RhdHVzID0gIW9yaWdpbmFsU3RhdHVzO1xuXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgaXNfYWN0aXZlOiBuZXdTdGF0dXNcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXNlclN0b3JlLnVwZGF0ZVVzZXIoZGF0YS5pZCwgcGF5bG9hZCk7XG5cbiAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICBkYXRhLmlzQWN0aXZlID0gbmV3U3RhdHVzO1xuICAgICAgICB1c2VyU3RvcmUuZmV0Y2hSb2xlU3RhdHModHJ1ZSwgZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSk7XG4gICAgfVxuXG4gICAgaXNVcGRhdGluZ1N0YXR1cy52YWx1ZSA9IGZhbHNlO1xuICAgIHNob3dTdGF0dXNNb2RhbC52YWx1ZSA9IGZhbHNlO1xuICAgIHRhcmdldFN0YXR1c1VzZXIudmFsdWUgPSBudWxsO1xufTtcblxub25Nb3VudGVkKGFzeW5jICgpID0+IHtcbiAgICB1c2VyU3RvcmUuZmV0Y2hSb2xlU3RhdHModHJ1ZSwgZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB1c2VyU3RvcmUuZ2V0QWxsVXNlcnMoKSxcbiAgICAgICAgdXNlclN0b3JlLmdldFVzZXJSb2xlcygpXG4gICAgXSk7XG59KTtcblxud2F0Y2goKCkgPT4gZmlsdGVycy52YWx1ZS5pc0FjdGl2ZSwgKG5ld0lzQWN0aXZlKSA9PiB7XG4gICAgdXNlclN0b3JlLmZldGNoUm9sZVN0YXRzKHRydWUsIG5ld0lzQWN0aXZlKTtcbn0pO1xuXG5jb25zdCB5ZWFyT3B0aW9ucyA9IFtcbiAgICB7IGxhYmVsOiAnWWVhciAxJywgdmFsdWU6ICcxJyB9LFxuICAgIHsgbGFiZWw6ICdZZWFyIDInLCB2YWx1ZTogJzInIH0sXG4gICAgeyBsYWJlbDogJ1llYXIgMycsIHZhbHVlOiAnMycgfSxcbiAgICB7IGxhYmVsOiAnWWVhciA0JywgdmFsdWU6ICc0JyB9LFxuICAgIHsgbGFiZWw6ICdPdGhlcicsIHZhbHVlOiAnb3RoZXInIH1cbl07XG5cbmNvbnN0IGdldFllYXJMYWJlbCA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmICghdmFsdWUpIHJldHVybiAnLSc7XG4gICAgY29uc3Qgb3B0ID0geWVhck9wdGlvbnMuZmluZChvID0+IG8udmFsdWUgPT09IFN0cmluZyh2YWx1ZSkpO1xuICAgIHJldHVybiBvcHQgPyBvcHQubGFiZWwgOiB2YWx1ZTtcbn07XG5cbmNvbnN0IGNvbERlZnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgY29uc3QgY29scyA9IFtcbiAgICAgICAgeyBmaWVsZDogJ3VzZXJuYW1lJywgaGVhZGVyOiAnRnVsbCBOYW1lJyB9LFxuICAgICAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXI6ICdFbWFpbCBBZGRyZXNzJyB9XG4gICAgXTtcbiAgICBjb2xzLnB1c2goXG4gICAgICAgIHsgZmllbGQ6ICdrdXQnLCBoZWFkZXI6ICdLdWRpJyB9LFxuICAgICAgICB7IGZpZWxkOiAncm93QW5kU2VhdCcsIGhlYWRlcjogJ1Jvdy9TZWF0JyB9LFxuICAgICAgICB7IGZpZWxkOiAncGhvbmUnLCBoZWFkZXI6ICdQaG9uZSBOdW1iZXInIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzY2hvb2wnLCBoZWFkZXI6ICdTY2hvb2wgLyBVbml2ZXJzaXR5JyB9LFxuICAgICAgICB7IGZpZWxkOiAneWVhcicsIGhlYWRlcjogJ1llYXInIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhY3Rpb24nLCBoZWFkZXI6ICcnLCBzb3J0YWJsZTogZmFsc2UgfVxuICAgICk7XG4gICAgcmV0dXJuIGNvbHM7XG59KTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgc2NvcGVkPlxuLnVzZXItcHJvZmlsZS1hdmF0YXIge1xuICAgIHdpZHRoOiAzNXB4O1xuICAgIGhlaWdodDogMzVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zdXJmYWNlLWdyb3VuZCk7XG4gICAgYm9yZGVyLXJhZGl1czogNTBweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCkgc29saWQgdmFyKC0tYm9yZGVyLWNscik7XG59XG5cbi51c2VyLXByb2ZpbGUtYXZhdGFyIGltZyB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIG9iamVjdC1maXQ6IGNvdmVyO1xufVxuXG4uc3RhdHVzLXNlbGVjdCxcbi5zZWFyY2gtaW5wdXQsXG4ua3V0LXNlbGVjdCB7XG4gICAgd2lkdGg6IDEwMCU7XG59XG5cbkBtZWRpYSAobWluLXdpZHRoOiA1NzZweCkge1xuICAgIC5zdGF0dXMtc2VsZWN0IHtcbiAgICAgICAgd2lkdGg6IDEzMHB4O1xuICAgIH1cbiAgICAua3V0LXNlbGVjdCB7XG4gICAgICAgIHdpZHRoOiAxMzBweDtcbiAgICB9XG4gICAgLnNlYXJjaC1pbnB1dCB7XG4gICAgICAgIHdpZHRoOiAyNTBweDtcbiAgICB9XG59XG48L3N0eWxlPiJdLCJmaWxlIjoiL1ZvbHVtZXMvTXlGb2xkZXIvUGFnb2RhIE1hbmFnZW1hbnQvTW9ua01hbmFnZS9zcmMvdmlld3MvYWRtaW4vdXNlcnMvVXNlckxpc3RWaWV3LnZ1ZSJ9