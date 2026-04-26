// 文件路径：functions/api/url_to_wechat.js
export async function onRequestPost(context) {
    const { env, request } = context;
    const { external_url } = await request.json();

    if (!external_url) return new Response(JSON.stringify({ success: false, error: "缺少 URL" }), { status: 400 });

    try {
        // 1. 获取微信 Token
        const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}`);
        const tokenData = await tokenRes.json();
        
        // 2. 从你的 Kvault 图床（或外部地址）下载图片内容
        const imageRes = await fetch(external_url);
        const imageBuffer = await imageRes.arrayBuffer();
        
        // 3. 构建表单，准备传给微信
        const wxFormData = new FormData();
        // 必须构造一个 File 对象，微信接口强制校验 filename
        const file = new File([imageBuffer], "image.png", { type: imageRes.headers.get('content-type') || 'image/png' });
        wxFormData.append('media', file);

        // 4. 调用微信正文图片上传接口
        const uploadRes = await fetch(`https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${tokenData.access_token}`, {
            method: 'POST',
            body: wxFormData
        });
        const uploadData = await uploadRes.json();

        if (uploadData.url) {
            return new Response(JSON.stringify({ success: true, wechat_url: uploadData.url }));
        } else {
            return new Response(JSON.stringify({ success: false, error: uploadData.errmsg }), { status: 400 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
