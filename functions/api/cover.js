export async function onRequestGet(context) {
    const { env } = context;
    const mediaId = await env.WECHAT_KV.get('COVER_MEDIA_ID');
    const listStr = await env.WECHAT_KV.get('COVER_LIST');
    
    let list = [];
    if (listStr) {
        try { list = JSON.parse(listStr); } catch (e) {}
    }

    // 兼容老数据（以前固化的图没有存入 LIST）
    if (mediaId && list.length === 0) {
        list.push({ id: mediaId, name: '默认老封面' });
    }

    if (!mediaId && list.length === 0) {
        return new Response(JSON.stringify({ success: false, data: null }));
    }
    
    return new Response(JSON.stringify({ success: true, media_id: mediaId, list: list }));
}
