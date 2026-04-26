export async function onRequestPost(context) {
    const { env, request } = context;
    const APP_ID = env.WECHAT_APP_ID;
    const APP_SECRET = env.WECHAT_APP_SECRET;

    try {
        const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`);
        const tokenData = await tokenRes.json();
        
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return new Response(JSON.stringify({ success: false, error: "未找到文件" }), { status: 400 });

        const wxFormData = new FormData();
        wxFormData.append('media', file);

        const uploadRes = await fetch(`https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${tokenData.access_token}&type=thumb`, {
            method: 'POST',
            body: wxFormData
        });
        const uploadData = await uploadRes.json();

        if (uploadData.media_id) {
            const mediaId = uploadData.media_id;
            
            // 1. 存入当前选中状态
            await env.WECHAT_KV.put('COVER_MEDIA_ID', mediaId);
            
            // 2. 独立存储图片数据（Key 包含 ID）
            const arrayBuffer = await file.arrayBuffer();
            await env.WECHAT_KV.put(`COVER_IMAGE_DATA_${mediaId}`, arrayBuffer, {
                metadata: { type: file.type || 'image/jpeg' }
            });

            // 3. 更新封面列表索引
            let list = [];
            const listStr = await env.WECHAT_KV.get('COVER_LIST');
            if (listStr) { list = JSON.parse(listStr); }
            
            if (!list.find(item => item.id === mediaId)) {
                list.push({ id: mediaId, name: file.name || `封面_${Date.now()}` });
                await env.WECHAT_KV.put('COVER_LIST', JSON.stringify(list));
            }

            return new Response(JSON.stringify({ success: true, media_id: mediaId }));
        }
        return new Response(JSON.stringify({ success: false, error: uploadData.errmsg }), { status: 400 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
