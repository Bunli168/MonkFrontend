import api from "@/api/api";
import { handleApiError } from "@/utils/apiError";
import Cookies from "js-cookie";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToastStore } from "./toast";
import { socket } from "@/utils/socket";

export const useAuthStore = defineStore('auth', () => {
    const toastStore = useToastStore();

    // ⚠️  SECURITY: Never read the access token from sessionStorage — it is fully readable by XSS.
    //    The cookie MUST be set as httpOnly by the server (backend) so JS cannot read it at all.
    //    js-cookie (client-side) cannot set httpOnly; this is a backend responsibility.
    const accessToken = ref(Cookies.get('accessToken') || null);
    const user = ref(null);

    // Always authenticated in mock mode
    const isAuthenticated = computed(() => !!user.value);

    const fullName = computed(() => {
        if (!user.value) return '';
        return user.value.name || '';
    });

    const userRole = computed(() => {
        if (!user.value?.role) return null;
        const rawRole = typeof user.value.role === 'string'
            ? user.value.role
            : user.value.role?.name || user.value.role;
        return rawRole ? rawRole.replace(/\s+/g, '') : null;
    });

    const isAdmin = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['ADMIN', 'MEKUDI'].includes(uRole);
    });
    const isSuperAdmin = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['SUPERADMIN', 'SUPER_ADMIN'].includes(uRole);
    });
    const isTeacher = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['MEKUDI', 'TEACHER', 'ADMIN'].includes(uRole);
    });
    const isStudent = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['MONK', 'STUDENT', 'BHIKKHU', 'ATTENDANCETAKER', 'ATTENDANCE_TAKER'].includes(uRole);
    });
    const isMonk = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['MONK', 'BHIKKHU', 'MEKUDI', 'ATTENDANCETAKER', 'ATTENDANCE_TAKER', 'ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'].includes(uRole);
    });
    const isBhikkhu = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['BHIKKHU', 'ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'].includes(uRole);
    });
    const isAttendanceTaker = computed(() => {
        const uRole = userRole.value?.toUpperCase();
        return ['ATTENDANCETAKER', 'ATTENDANCE_TAKER'].includes(uRole);
    });

    const hasRole = (roles) => {
        const uRole = userRole.value?.toUpperCase();
        const uppercaseRoles = roles.map(r => {
            const up = r.toUpperCase();
            if (up === 'ADMIN') return ['ADMIN', 'MEKUDI'];
            if (up === 'SUPERADMIN') return ['SUPERADMIN', 'SUPER_ADMIN'];
            if (up === 'ATTENDANCETAKER') return ['ATTENDANCETAKER', 'ATTENDANCE_TAKER'];
            return [up];
        }).flat();
        return uppercaseRoles.includes(uRole);
    };

    const joinSocketRooms = () => {
        if (!user.value) return;
        socket.emit('join_user', user.value.id);
        if (isAdmin.value) {
            socket.emit('join_admin');
        }
    };

    socket.on('connect', () => {
        joinSocketRooms();
    });

    socket.on('new_message', async (message) => {
        toastStore.showToast(`New Message: ${message.subject || 'No Subject'}`, 'info');
        try {
            const { useMessageStore } = await import('./messages');
            const messageStore = useMessageStore();
            await messageStore.getInbox();
        } catch (e) {}
    });

    socket.on('new_leave_request', (payload) => {
        toastStore.showToast('New leave request needs approval', 'info');
    });

    const setTokens = ({ access }) => {
        if (access) {
            accessToken.value = access;
            // ⚠️  SECURITY NOTE FOR BACKEND TEAM:
            //    This cookie MUST be set server-side with httpOnly: true to prevent JS access.
            //    The frontend sets it here as a fallback only; remove once backend sets it.
            //    Cookie expires in 1 day — access tokens should be short-lived.
            Cookies.set('accessToken', access, {
                path: '/',
                secure: window.location.protocol === 'https:',
                sameSite: 'Strict',
                expires: 1
            });
            // ✅  Do NOT store the access token in sessionStorage — it is fully readable by JS.
            socket.disconnect();
            socket.connect();
        }
    };

    const login = async (payload) => {
        try {
            if (!payload.email || !payload.password) throw new Error('Email and Password are required!')
            const response = await api.post('/auth/login', payload);
            const data = response.data?.data || response.data;
            
            if (data.requirePasswordChange) {
                // ✅ sessionStorage: scoped to this tab only (better than localStorage)
                sessionStorage.setItem('changePasswordToken', data.token);
                return { requirePasswordChange: true };
            }
            
            if (data.requireOtp) {
                // ✅ sessionStorage: scoped to this tab — prevents cross-tab MFA token theft
                sessionStorage.setItem('mfaType', data.mfaType || 'email');
                sessionStorage.setItem('otpSessionToken', data.otpSessionToken);
                return { requireOtp: true };
            }

            if (data.tokens?.accessToken) {
                sessionStorage.removeItem('changePasswordToken');
                setTokens({ access: data.tokens.accessToken });
                user.value = data.user;
                joinSocketRooms();
                return { user: data.user, tokens: data.tokens };
            }
            return data;
        } catch (error) {
            handleApiError(error, toastStore);
            return null;
        }
    };

    const verifyOtp = async (otpCode) => {
        try {
            const otpSessionToken = sessionStorage.getItem('otpSessionToken');
            if (!otpSessionToken) throw new Error('Invalid session. Please login again.');
            if (!otpCode) throw new Error('OTP Code is required!');

            const response = await api.post('/auth/verify-otp', { otpSessionToken, otpCode });
            const data = response.data?.data || response.data;

            sessionStorage.removeItem('otpSessionToken');
            sessionStorage.removeItem('mfaType');

            if (data.requirePasswordChange) {
                sessionStorage.setItem('changePasswordToken', data.token);
                return { requirePasswordChange: true };
            }

            if (data.accessToken) {
                sessionStorage.removeItem('changePasswordToken');
                setTokens({ access: data.accessToken });
                user.value = data.user;
                joinSocketRooms();
            }

            toastStore.showToast(response?.data?.message, 'success')
            return data;
        } catch (error) {
            handleApiError(error, toastStore);
            if (error?.response?.data?.message === 'Invalid or expired session') {
                sessionStorage.removeItem('otpSessionToken');
                sessionStorage.removeItem('mfaType');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
            return false;
        }
    };

    const resendOtp = async () => {
        try {
            // ✅ Fixed: was checking an object (always truthy) — now checks the raw string value
            const rawToken = sessionStorage.getItem('otpSessionToken');
            if (!rawToken) throw new Error('Invalid session. Please login again.');
            const otpSessionToken = { otpSessionToken: rawToken };

            const res = await api.post('auth/resend-otp', otpSessionToken);

            toastStore.showToast(res?.data?.message, 'success');
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const changeDefaultPassword = async (payload) => {
        try {
            const changePasswordToken = sessionStorage.getItem('changePasswordToken');
            if (!changePasswordToken) return;

            // ✅ SECURITY FIX: Token sent in request body instead of URL path.
            //    Previously `/auth/change-default-password/${token}` leaked the token
            //    into server logs, browser history, and Referer headers.
            const response = await api.put('/auth/change-default-password', { ...payload, token: changePasswordToken });
            toastStore.showToast(response?.data?.message, 'success');

            sessionStorage.removeItem('changePasswordToken');
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            if (error?.response?.data?.message === 'Invalid or expired token' || error?.response?.data?.message === 'User not found') {
                sessionStorage.removeItem('changePasswordToken');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
            return false;
        }
    };

    const updateMyPassword = async (payload) => {
        try {
            const response = await api.put('/auth/change-password', payload);
            toastStore.showToast(response?.data?.message || 'ប្តូរពាក្យសម្ងាត់ជោគជ័យ!', 'success');
            
            // Set new tokens to stay logged in on the current device
            if (response?.data?.data?.tokens?.accessToken) {
                setTokens({ access: response.data.data.tokens.accessToken });
            }
            
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    };

    const getProfile = async () => {
        try {
            const response = await api.get('/users/me');
            const data = response.data?.data || response.data;
            user.value = data;
            joinSocketRooms();
            return user.value;
        } catch (error) {
            console.error('Failed to get profile', error);
            clearAuth();
            throw error;
        }
    };

    const updateProfile = async (payload) => {
        try {
            const res = await api.put('auth/profile', payload);
            toastStore.showToast(res?.data?.message, 'success')
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const enableTotp = async (payload) => {
        try {
            const res = await api.post('auth/totp/setup', payload)
            toastStore.showToast(res?.data?.message, 'success')
            return res.data;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    }

    const verifyTotpSetup = async (payload) => {
        try {
            const res = await api.post('auth/totp/verify-setup', payload)
            toastStore.showToast(res?.data?.message, 'success')
            return true;
        } catch (error) {
            handleApiError(error, toastStore)
            return false;
        }
    }

    const disableTotp = async (payload) => {
        try {
            const res = await api.post('auth/totp/disable', payload)
            toastStore.showToast(res?.data?.message, 'success')
            return true;
        } catch (error) {
            handleApiError(error, toastStore)
            return false;
        }
    }

    const unlinkTelegram = async () => {
        try {
            const res = await api.post('auth/unlink-telegram');
            toastStore.showToast(res?.data?.message || 'Telegram account unlinked', 'success');
            if (user.value) {
                user.value.telegram_chat_id = null;
                user.value.telegram_username = null;
            }
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    };

    const unlinkOtpTelegram = async () => {
        try {
            const res = await api.post('auth/unlink-otp-telegram');
            toastStore.showToast(res?.data?.message || 'OTP Telegram account unlinked', 'success');
            if (user.value) {
                user.value.otp_telegram_chat_id = null;
                user.value.otp_telegram_username = null;
            }
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    };

    const logout = async (callApi = true) => {
        if (callApi) {
            try {
                await api.post('/auth/logout');
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        clearAuth();
        return true;
    };

    const clearAuth = () => {
        accessToken.value = null;
        user.value = null;
        Cookies.remove('accessToken', {
            path: '/',
            secure: window.location.protocol === 'https:',
            sameSite: 'Strict'
        });
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('accessToken');

        // Also remove refreshToken cookie client side if non-httpOnly fallback
        Cookies.remove('refreshToken', { path: '/' });
        Cookies.remove('refreshToken');

        // ✅ Clear all session-scoped auth state
        sessionStorage.removeItem('otpSessionToken');
        sessionStorage.removeItem('mfaType');
        sessionStorage.removeItem('changePasswordToken');
        if (socket && typeof socket.disconnect === 'function') {
            socket.disconnect();
        }
    };

    const forgotPassword = async (payload) => {
        try {
            const res = await api.post('auth/forgot-password', payload);
            toastStore.showToast(res?.data?.message, 'success');
            return { success: true };
        } catch (error) {
            const errorMsg = error?.response?.data?.message;
            if (errorMsg === "USER_RESET_FORBIDDEN") {
                return { success: false, isUserForbidden: true };
            }
            handleApiError(error, toastStore);
            return { success: false };
        }
    };

    const resetPassword = async (payload) => {
        try {
            const res = await api.post('auth/reset-password', payload);
            toastStore.showToast(res?.data?.message, 'success');
            return true;
        } catch (error) {
            handleApiError(error, toastStore);
            return false;
        }
    };

    const fetchProfile = getProfile;
    const fetchCurrentUser = getProfile;

    return {
        accessToken,
        user,
        userRole,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        isTeacher,
        isStudent,
        isMonk,
        isBhikkhu,
        isAttendanceTaker,
        fullName,
        login,
        verifyOtp,
        resendOtp,
        enableTotp,
        disableTotp,
        unlinkTelegram,
        unlinkOtpTelegram,
        verifyTotpSetup,
        changeDefaultPassword,
        hasRole,
        getProfile,
        updateProfile,
        fetchProfile,
        fetchCurrentUser,
        logout,
        clearAuth,
        setTokens,
        forgotPassword,
        resetPassword,
        updateMyPassword
    };
});