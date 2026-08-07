import api from "@/api/api";
import { handleApiError } from "@/utils/apiError";
import { sanitizeId } from "@/utils/security";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useToastStore } from "../toast";

export const useUserStore = defineStore('user', () => {
    const toastStore = useToastStore()
    const users = ref([]);
    const pendingUsers = ref([]);
    const user = ref(null);
    const userRoles = ref([]);
    const parsedBulkUsers = ref([]);
    const isLoading = ref(false);
    const queryCache = new Map();
    const clearCache = () => {
        queryCache.clear();
        roleStats.value = { 'all': '...', 1: '...', 2: '...', 3: '...', 4: '...', 7: '...' };
        fetchRoleStats(true);
    };

    const roleStats = ref({ 'all': '...', 1: '...', 2: '...', 3: '...', 4: '...', 7: '...' });

    const fetchRoleStats = async (forceRefresh = false, isActive = null) => {
        try {
            const params = {};
            if (isActive !== null && isActive !== undefined && isActive !== '') {
                params.isActive = isActive;
            }
            const response = await api.get('/users/stats/roles', { params });
            const data = response.data?.data || response.data;
            if (data) {
                roleStats.value = {
                    'all': data.all || 0,
                    1: data[1] || 0,
                    2: data[2] || 0,
                    3: data[3] || 0,
                    4: data[4] || 0,
                    7: data[7] || 0
                };
            }
        } catch {
            // Role stats are non-critical — fail silently
        }
    };

    const page = ref(1);
    const perPage = ref(10);
    const totalItems = ref(0);
    const totalPages = ref(1);

    const pendingPage = ref(1);
    const pendingPerPage = ref(10);
    const pendingTotalItems = ref(0);
    const pendingTotalPages = ref(1);
    const pendingSearch = ref('');
    const pendingSortDir = ref('desc');
    const pendingSortBy = ref('createdAt');

    const sortBy = ref('role');
    const sortOrder = ref('asc');
    const search = ref('');
    const filters = ref({});

    const getAllUsers = async (options = {}) => {
        try {
            isLoading.value = true;
            const params = {
                page: page.value,
                perPage: perPage.value,
                sortBy: sortBy.value,
                sortOrder: sortOrder.value,
                search: search.value,
                ...filters.value,
                ...options
            };
            const response = await api.get('/users', { params });
            const data = response.data?.data || response.data;
            users.value = data;
            
            if (response.data?.meta) {
                totalItems.value = response.data.meta.totalItems;
                totalPages.value = response.data.meta.totalPages;
            }
            
            return data;
        } catch (error) {
            handleApiError(error, toastStore);
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const getAllPendingUsers = async (options = {}) => {
        try {
            if (options.showLoading) isLoading.value = true;
            const params = {
                page: pendingPage.value,
                perPage: pendingPerPage.value,
                sortBy: pendingSortBy.value,
                sortOrder: pendingSortDir.value,
                search: pendingSearch.value,
                isVerified: false,
                roleId: 1
            };
            
            // Remove properties that are overridden by options to prevent conflicts if any, though ...options handles it
            const response = await api.get('/users', { params: { ...params, ...options } });
            const data = response.data?.data || response.data;
            
            if (options.append) {
                pendingUsers.value = [...pendingUsers.value, ...data];
            } else {
                pendingUsers.value = data;
            }
            
            if (response.data?.meta) {
                pendingTotalItems.value = response.data.meta.totalItems;
                pendingTotalPages.value = response.data.meta.totalPages;
            }
            
            return data;
        } catch (error) {
            handleApiError(error, toastStore);
            return [];
        } finally {
            if (options.showLoading) isLoading.value = false;
        }
    }

    const resendVerificationEmail = async (payload) => {
        try {
            const response = await api.post('/users/resend-verification', payload);
            toastStore.showToast("Verification email resent successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const getUserRoles = async () => {
        try {
            const response = await api.get('/roles');
            const data = response.data?.data || response.data;
            userRoles.value = data;
            return data;
        } catch (error) {
            handleApiError(error, toastStore);
            return [];
        }
    }

    const getUserById = async (id) => {
        try {
            const safeId = sanitizeId(id);
            const response = await api.get(`/users/${safeId}`);
            user.value = response.data?.data || response.data;
            return user.value;
        } catch (error) {
            handleApiError(error, toastStore);
            return null;
        }
    }

    const createUser = async (payload) => {
        try {
            const response = await api.post('/users/register', payload);
            toastStore.showToast("User registered successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const selfRegister = async (payload) => {
        try {
            const response = await api.post('/users/self-register', payload);
            toastStore.showToast("You registered successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const bulkRegister = async (payload) => {
        try {
            const results = [];
            let skipCount = 0;
            
            if (!users.value || users.value.length === 0) {
                await getAllUsers();
            }

            for (const u of payload.users) {
                const nameToCompare = `${u.lastName} ${u.firstName}`.trim();
                const exists = users.value.some(existingUser => {
                    const profile = existingUser.UserProfile || existingUser.profile;
                    if (!profile) return false;
                    const existingName = `${profile.last_name_kh || ''} ${profile.first_name_kh || ''}`.trim();
                    const existingChhaya = (profile.chhaya_number || '').trim();
                    return existingName === nameToCompare && existingChhaya === u.chhaya_number;
                });

                if (exists) {
                    skipCount++;
                    continue;
                }

                try {
                    const res = await api.post('/users/register', { ...u, roleId: payload.roleId });
                    results.push(res.data);
                } catch (err) {
                    const errMsg = String(err?.response?.data?.message || '').toLowerCase();
                    if (errMsg.includes('unique') || errMsg.includes('already in use') || errMsg.includes('duplicate')) {
                        skipCount++;
                    } else {
                        throw err;
                    }
                }
            }
            
            if (skipCount > 0) {
                toastStore.showToast(`Import completed! Created ${results.length} user(s), skipped ${skipCount} duplicate(s).`, 'success', 10000);
            } else if (results.length > 0) {
                toastStore.showToast(`${results.length} user(s) registered successfully`, 'success');
            }
            return results;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const requestRegisterAdmin = async (token) => {
        // ⚠️  SECURITY: This was a stub returning `true` — replaced with real API call.
        //    A stub that always returns true is an RBAC bypass if any code relies on it.
        try {
            const response = await api.post('/users/register-admin', { token });
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const updateUser = async (id, payload) => {
        try {
            const safeId = sanitizeId(id);
            const response = await api.put(`/users/${safeId}`, payload);
            toastStore.showToast("User updated successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const changeUserRole = async (id, roleId) => {
        try {
            const safeId = sanitizeId(id);
            const response = await api.put(`/users/${safeId}/change-role`, { role_id: roleId });
            toastStore.showToast("User role updated successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }


    const resetUserPassword = async (id) => {
        try {
            const safeId = sanitizeId(id);
            const response = await api.post(`/users/${safeId}/reset-password`);
            toastStore.showToast("Password reset to default successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const uploadProfileAvatar = async (formData) => {
        try {
            const response = await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toastStore.showToast("Avatar uploaded successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const deleteProfileAvatar = async () => {
        try {
            const response = await api.delete('/auth/profile/avatar');
            toastStore.showToast("Avatar deleted successfully", 'success');
            return response.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const requestTelegramLink = async () => {
        try {
            const response = await api.get('/auth/telegram-link-token');
            const data = response.data?.data || response.data;
            if (data?.token) {
                const username = import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME || 'Monk_permission_bot';
                return {
                    telegramLink: `https://t.me/${username}?start=${data.token}`,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
                };
            }
            return null;
        } catch (error) {
            handleApiError(error, toastStore);
            return null;
        }
    }

    const requestOtpTelegramLink = async () => {
        try {
            const response = await api.get('/auth/otp-telegram-link-token');
            const data = response.data?.data || response.data;
            if (data?.token) {
                // Hardcoding this because the cached .env still says Monk_permission_bot
                const username = 'optsecuritybot';
                return {
                    telegramLink: `https://t.me/${username}?start=${data.token}`,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
                };
            }
            return null;
        } catch (error) {
            handleApiError(error, toastStore);
            return null;
        }
    }

    const unlinkTelegram = async () => {
        return true;
    }

    const getNotificationSettings = async () => {
        return null;
    }

    const updateNotificationSettings = async (payload) => {
        return true;
    }

    return {
        getAllUsers,
        getAllPendingUsers,
        resendVerificationEmail,
        getUserById,
        getUserRoles,
        createUser,
        selfRegister,
        bulkRegister,
        requestRegisterAdmin,
        updateUser,
        changeUserRole,
        resetUserPassword,
        uploadProfileAvatar,
        deleteProfileAvatar,
        requestTelegramLink,
        requestOtpTelegramLink,
        unlinkTelegram,
        getNotificationSettings,
        updateNotificationSettings,

        users,
        pendingUsers,
        user,
        userRoles,
        parsedBulkUsers,
        roleStats,
        fetchRoleStats,

        isLoading,
        page,
        perPage,
        totalItems,
        totalPages,
        sortBy,
        sortOrder,
        search,
        filters,
        pendingPage,
        pendingPerPage,
        pendingTotalItems,
        pendingTotalPages,
        pendingSearch,
        pendingSortDir,
        pendingSortBy
    };
});
