export async function onRequestPost(context) {
    const { env } = context;
    const { html, title, digest, thumb_media_id } = await context.request.json();

    const APP_ID = env.WECHAT_APP_ID;
    const APP_SECRET = env.WECHAT_APP_SECRET;
    const AUTHOR = env.WECHAT_DEFAULT_AUTHOR || "纸页虾";
    
    // 【核心修改】优先级: 1.前端本地固化的ID -> 2.环境变量默认ID -> 3.写死的保底ID
    const THUMB_ID = thumb_media_id || env.WECHAT_DEFAULT_THUMB_MEDIA_ID || "Gp4atzJl6iIcXPEQOa2ANILEZo2xGxOZKMKk1LyLdlIoWitf6e54SSt2ommc9ykh";

    try {
        // 1. 获取 Token
        const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`);
        const tokenData = await tokenRes.json();
        
        if (!tokenData.access_token) {
            return new Response(JSON.stringify({ success: false, error: `Token获取失败: ${tokenData.errmsg}` }), { status: 500 });
        }

        // 2. 检查封面图 ID
        if (!THUMB_ID) {
            return new Response(JSON.stringify({ success: false, error: "未设置 WECHAT_DEFAULT_THUMB_MEDIA_ID。微信草稿必须要有封面图 ID。" }), { status: 400 });
        }

        // 3. 构建上传载荷
        const draftPayload = {
            articles: [{
                title: title || "新文章",
                author: AUTHOR,
                content: html,
                digest: digest || "点击查看全文",
                show_cover_pic: 0,
                thumb_media_id: THUMB_ID, // 修复 invalid media_id 报错的关键
                need_open_comment: 1,      // 默认内置为 1
                only_fans_can_comment: 0
            }]
        };

        const uploadRes = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${tokenData.access_token}`, {
            method: 'POST',
            body: JSON.stringify(draftPayload)
        });
        const uploadData = await uploadRes.json();

        if (uploadData.media_id) {
            return new Response(JSON.stringify({ success: true, media_id: uploadData.media_id }));
        } else {
            return new Response(JSON.stringify({ success: false, error: `微信端报错: ${uploadData.errmsg}` }), { status: 400 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
