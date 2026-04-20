import { hashPassword, verifyPassword, createToken } from '../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { password, isSetup } = await request.json();
    
    let passwordHash = await env.WECHAT_KV.get('password_hash');

    // 1. 初始化密码
    if (isSetup && !passwordHash) {
        passwordHash = await hashPassword(password);
        await env.WECHAT_KV.put('password_hash', passwordHash);
        const token = await createToken(passwordHash);
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Set-Cookie': `asspp_session=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 3600}; SameSite=Lax` }
        });
    }

    // 2. 正常登录校验
    if (passwordHash && await verifyPassword(password, passwordHash)) {
        const token = await createToken(passwordHash);
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Set-Cookie': `asspp_session=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 3600}; SameSite=Lax` }
        });
    }

    return new Response(JSON.stringify({ success: false, error: '密码错误' }), { status: 401 });
}
