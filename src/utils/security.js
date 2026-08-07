/**
 * security.js — Centralized frontend security utilities
 *
 * These are CLIENT-SIDE defences only. All security-critical decisions
 * (authorization, data access) MUST be enforced on the backend API.
 */

/**
 * Validates and sanitizes an ID before it is used in a URL path segment.
 * Prevents path traversal attacks via crafted IDs (e.g. "../admin").
 *
 * @param {*} id - The ID value to validate
 * @returns {number} - The validated positive integer ID
 * @throws {Error} - If the ID is invalid
 */
export function sanitizeId(id) {
    const parsed = parseInt(id, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== String(id)) {
        throw new Error(`Invalid ID: "${id}". ID must be a positive integer.`);
    }
    return parsed;
}

/**
 * Strips characters commonly used in HTML/script injection from a string.
 * This is a DISPLAY-layer defence. For rendering user content, always
 * prefer Vue's {{ }} interpolation (auto-escaped) over v-html.
 *
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized string safe for text display
 */
export function sanitizeText(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Checks whether a password meets minimum security requirements.
 * (OWASP recommendation: 8+ chars, mix of character types)
 *
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function isStrongPassword(password) {
    const errors = [];
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters.');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number.');
    }
    return { valid: errors.length === 0, errors };
}

/**
 * Masks a sensitive token for safe logging (shows only first/last 4 chars).
 * Never log full tokens — use this if you must log token state.
 *
 * @param {string} token
 * @returns {string}
 */
export function maskToken(token) {
    if (!token || token.length < 10) return '[REDACTED]';
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
