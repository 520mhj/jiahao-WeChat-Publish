function base64url(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function base64urlToString(data) {
    const bytes = base64urlDecode(data);
    return new TextDecoder().decode(bytes);
}

const PBKDF2_ITERATIONS = 100000;
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256);
    return `${base64url(salt)}.${base64url(hash)}`;
}

async function deriveKey(passwordHash) {
    const hashPart = passwordHash.includes('.') ? passwordHash.split('.')[1] : passwordHash;
    return crypto.subtle.importKey('raw', new TextEncoder().encode(hashPart), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createToken(passwordHash) {
    const key = await deriveKey(passwordHash);
    const payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
    const payloadB64 = base64url(new TextEncoder().encode(payload));
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
    return `${payloadB64}.${base64url(sig)}`;
}

export async function verifyToken(token, passwordHash) {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, sigB64] = parts;
    const key = await deriveKey(passwordHash);
    const valid = await crypto.subtle.verify('HMAC', key, base64urlDecode(sigB64), new TextEncoder().encode(payloadB64));
    if (!valid) return false;
    try {
        const payload = JSON.parse(base64urlToString(payloadB64));
        return payload.exp > Math.floor(Date.now() / 1000);
    } catch { return false; }
}

export async function verifyPassword(input, storedHash) {
    const dotIdx = storedHash.indexOf('.');
    if (dotIdx < 0) return false;
    const salt = base64urlDecode(storedHash.slice(0, dotIdx));
    const expectedHash = storedHash.slice(dotIdx + 1);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(input), 'PBKDF2', false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256);
    const inputHash = base64url(derived);
    // 简化版 timing-safe compare
    return inputHash === expectedHash; 
}
