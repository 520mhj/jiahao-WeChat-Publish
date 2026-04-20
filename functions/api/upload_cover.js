export async function onRequestPost(context) {
    const { env, request } = context;
    const APP_ID = env.WECHAT_APP_ID;
    const APP_SECRET = env.WECHAT_APP_SECRET;

    try {
        const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`);
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) return new Response(JSON.stringify({ success: false, error: `Token获取失败` }), { status: 500 });

        // 为了能同时上传微信和存 KV，先将文件内容读到内存
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
            // === 核心修改：上传成功后存入 KV 覆盖旧数据 ===
            await env.WECHAT_KV.put('COVER_MEDIA_ID', uploadData.media_id);
            const arrayBuffer = await file.arrayBuffer();
            await env.WECHAT_KV.put('COVER_IMAGE_DATA', arrayBuffer, {
                metadata: { type: file.type || 'image/jpeg' }
            });

            return new Response(JSON.stringify({ success: true, media_id: uploadData.media_id }));
        } else {
            return new Response(JSON.stringify({ success: false, error: `微信报错: ${uploadData.errmsg}` }), { status: 400 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
