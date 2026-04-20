export async function onRequestGet(context) {
    const { env } = context;
    const { value, metadata } = await env.WECHAT_KV.getWithMetadata('COVER_IMAGE_DATA', 'arrayBuffer');
    
    if (!value) {
        return new Response("Not found", { status: 404 });
    }

    return new Response(value, {
        headers: { 
            'Content-Type': metadata?.type || 'image/jpeg',
            'Cache-Control': 'no-cache'
        }
    });
}
