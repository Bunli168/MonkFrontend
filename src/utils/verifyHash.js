export function getVerifyTokenSync(userId) {
    if (!userId) return '';
    const secret = 'neakavorn_secure_verify_salt_2026';
    const str = `NV_PROFILE_${userId}_${secret}`;
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0')).substring(0, 16);
}

export async function getVerifyToken(userId) {
    if (!userId) return '';
    try {
        const secret = 'neakavorn_secure_verify_salt_2026';
        const msgUint8 = new TextEncoder().encode(`NV_PROFILE_${userId}_${secret}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.substring(0, 16);
    } catch {
        return getVerifyTokenSync(userId);
    }
}
