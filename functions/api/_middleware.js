import { verifyToken } from '../utils/auth.js';

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 允许直接访问鉴权接口和封面图片资源
    if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/cover_image')) {
        return next();
    }

    const passwordHash = await env.WECHAT_KV.get('password_hash');
    
    // 如果 KV 中尚未设置密码，返回特定的 401 错误码让前端提示初始化
    if (!passwordHash) {
        return new Response(JSON.stringify({ error: '请先设置初始密码', code: 'SETUP_REQUIRED' }), { status: 401 });
    }

    // 校验 Cookie 中的 Token
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(new RegExp('(^| )asspp_session=([^;]+)'));
    const token = match ? match[2] : null;

    if (token && await verifyToken(token, passwordHash)) {
        return next();
    }

    return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), { status: 401 });
}
