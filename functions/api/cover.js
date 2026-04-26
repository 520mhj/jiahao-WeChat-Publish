export async function onRequestGet(context) {
    const { env } = context;
    const mediaId = await env.WECHAT_KV.get('COVER_MEDIA_ID');
    const listStr = await env.WECHAT_KV.get('COVER_LIST');
    
    let list = [];
    if (listStr) {
        try { list = JSON.parse(listStr); } catch (e) {}
    }

    // 兼容逻辑：如果列表中没有但有 mediaId，说明是旧版数据上传的，补进去
    if (mediaId && !list.find(i => i.id === mediaId)) {
        list.push({ id: mediaId, name: '默认封面' });
    }

    return new Response(JSON.stringify({ 
        success: true, 
        media_id: mediaId, 
        list: list 
    }));
}
