export async function onRequestGet(context) {
    const { env } = context;
    const mediaId = await env.WECHAT_KV.get('COVER_MEDIA_ID');
    if (!mediaId) {
        return new Response(JSON.stringify({ success: false, data: null }));
    }
    return new Response(JSON.stringify({ success: true, media_id: mediaId }));
}
