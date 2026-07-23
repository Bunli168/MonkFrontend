import Cookies from 'js-cookie';

/**
 * Appends the authorization JWT token as a query parameter to backend upload URLs.
 * This is required to load static files protected by static file authentication.
 * 
 * @param {string} url - The original image URL
 * @returns {string} The authenticated image URL
 */
export function getAuthImageUrl(url) {
    if (!url) return '';
    if (typeof url === 'string' && url.includes('uploads/')) {
        let finalUrl = url;
        
        // Make sure we have the full backend URL, not relative
        if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/api';
            const backendRoot = apiBase.replace(/\/api$/, '');
            finalUrl = `${backendRoot}/${url.replace(/^\//, '')}`;
        }
        
        const token = Cookies.get('accessToken');
        if (token) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            if (!finalUrl.includes('token=')) {
                return `${finalUrl}${separator}token=${token}`;
            }
        }
        return finalUrl;
    }
    return url;
}
