export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // 如果没有 id 参数则读取旧版 Key 做保底
    const key = id ? `COVER_IMAGE_DATA_${id}` : 'COVER_IMAGE_DATA';
    const { value, metadata } = await env.WECHAT_KV.getWithMetadata(key, 'arrayBuffer');
    
    if (!value) return new Response("Not found", { status: 404 });

    return new Response(value, {
        headers: { 
            'Content-Type': metadata?.type || 'image/jpeg',
            'Cache-Control': 'no-cache'
        }
    });
}
