export async function getVerifyToken(userId) {
    if (!userId) return '';
    const secret = 'neakavorn_secure_verify_salt_2026';
    const msgUint8 = new TextEncoder().encode(`NV_PROFILE_${userId}_${secret}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16);
}
