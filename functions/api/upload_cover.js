export async function onRequestPost(context) {
    const { env, request } = context;
    const APP_ID = env.WECHAT_APP_ID;
    const APP_SECRET = env.WECHAT_APP_SECRET;

    try {
        // 1. 获取 Token
        const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`);
        const tokenData = await tokenRes.json();
        
        if (!tokenData.access_token) {
            return new Response(JSON.stringify({ success: false, error: `Token获取失败` }), { status: 500 });
        }

        // 2. 解析前端传来的图片文件
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ success: false, error: "未找到文件" }), { status: 400 });
        }

        // 3. 构建发往微信的 FormData
        const wxFormData = new FormData();
        wxFormData.append('media', file);

        // 4. 上传为新增永久素材 (类型为 thumb 封面)
        const uploadRes = await fetch(`https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${tokenData.access_token}&type=thumb`, {
            method: 'POST',
            body: wxFormData
        });
        const uploadData = await uploadRes.json();

        if (uploadData.media_id) {
            return new Response(JSON.stringify({ success: true, media_id: uploadData.media_id }));
        } else {
            return new Response(JSON.stringify({ success: false, error: `微信报错: ${uploadData.errmsg}` }), { status: 400 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
