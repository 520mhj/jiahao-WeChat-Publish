export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // 如果传了 id 则读取特定的图，否则兼容读取旧版单图
    const key = id ? `COVER_IMAGE_DATA_${id}` : 'COVER_IMAGE_DATA';
    
    const { value, metadata } = await env.WECHAT_KV.getWithMetadata(key, 'arrayBuffer');
    
    if (!value) {
        // 如果按 id 找不到，尝试提供旧版的全局图做 fallback
        if (id) {
            const fallback = await env.WECHAT_KV.getWithMetadata('COVER_IMAGE_DATA', 'arrayBuffer');
            if (fallback.value) {
                return new Response(fallback.value, {
                    headers: { 'Content-Type': fallback.metadata?.type || 'image/jpeg', 'Cache-Control': 'no-cache' }
                });
            }
        }
        return new Response("Not found", { status: 404 });
    }

    return new Response(value, {
        headers: { 
            'Content-Type': metadata?.type || 'image/jpeg',
            'Cache-Control': 'no-cache'
        }
    });
}
