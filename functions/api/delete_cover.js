export async function onRequestPost(context) {
    const { env, request } = context;
    const { media_id } = await request.json();

    if (!media_id) return new Response(JSON.stringify({ success: false, error: "缺少 ID" }), { status: 400 });

    try {
        // 1. 从列表中移除记录
        let list = [];
        const listStr = await env.WECHAT_KV.get('COVER_LIST');
        if (listStr) {
            list = JSON.parse(listStr);
            list = list.filter(item => item.id !== media_id);
            await env.WECHAT_KV.put('COVER_LIST', JSON.stringify(list));
        }

        // 2. 删除图片二进制数据
        await env.WECHAT_KV.delete(`COVER_IMAGE_DATA_${media_id}`);

        // 3. 如果删除的是当前选中的 ID，则更新当前默认 ID
        const currentMediaId = await env.WECHAT_KV.get('COVER_MEDIA_ID');
        if (currentMediaId === media_id) {
            const nextId = list.length > 0 ? list[list.length - 1].id : "";
            await env.WECHAT_KV.put('COVER_MEDIA_ID', nextId);
        }

        return new Response(JSON.stringify({ success: true }));
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
