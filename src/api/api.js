import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import Cookies from "js-cookie"; // For client-side access token management

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    },
    withCredentials: true
});

function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function isTokenExpiringSoon(token, bufferSeconds = 15) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;
    return payload.exp - Math.floor(Date.now() / 1000) <= bufferSeconds;
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

async function refreshAccessToken() {
    const { data } = await axios.post(
        `${baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true }
    );

    const newAccessToken = data?.accessToken;
    if (newAccessToken) {
        Cookies.set('accessToken', newAccessToken, {
            secure: window.location.protocol === 'https:',
            sameSite: 'Lax'
        });

        try {
            const authStore = useAuthStore();
            authStore.accessToken = newAccessToken;
        } catch { }
        return newAccessToken;
    }

    throw new Error('Failed to refresh token');
}

function handleRefreshFailure() {
    try {
        const authStore = useAuthStore();
        authStore.logout(false);
    } catch {
        Cookies.remove('accessToken');
        Cookies.remove('otpSessionToken');
        Cookies.remove('changePasswordToken');
    }
    window.location.href = '/login';
}

const SKIP_PATHS = [
    '/auth/login',
    '/auth/verify-otp',
    '/auth/refresh-token',
    '/auth/change-default-password',
    '/auth/logout'
];

function shouldSkipAuth(url) {
    return SKIP_PATHS.some(p => url?.includes(p));
}

api.interceptors.request.use(async (req) => {
    if (shouldSkipAuth(req.url)) return req;

    let token = Cookies.get('accessToken');

    if (token && isTokenExpiringSoon(token, 15)) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    processQueue(null, newAccessToken);
                    token = newAccessToken;
                }
            } catch (error) {
                processQueue(error, null);
                handleRefreshFailure();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        } else {
            // Wait for the existing refresh promise to finish
            try {
                token = await new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
            } catch (error) {
                return Promise.reject(error);
            }
        }
    }

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !shouldSkipAuth(originalRequest.url)
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    processQueue(null, newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                handleRefreshFailure();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        if (error.response?.status === 403) {
            if (window.location.pathname !== '/403') {
                window.location.href = '/403';
            }
            return new Promise(() => {});
        }

        return Promise.reject(error);
    }
);

export default api;