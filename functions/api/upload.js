export async function onRequestPost(context) {
    const { env } = context;
    const { html, title } = await context.request.json();

    // 从环境变量获取配置
    const APP_ID = env.WECHAT_APP_ID;
    const APP_SECRET = env.WECHAT_APP_SECRET;
    const DEFAULT_AUTHOR = env.WECHAT_DEFAULT_AUTHOR || "二千年间";
    const NEED_OPEN_COMMENT = 1; // 强制内置为 1

    try {
        // 1. 获取 Access Token
        const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();
        
        if (!tokenData.access_token) {
            return new Response(JSON.stringify({ success: false, error: "Access Token 获取失败" }), { status: 500 });
        }

        const accessToken = tokenData.access_token;

        // 2. 构造草稿数据
        // 根据 wechat_draft.js 的逻辑，这里需要包含 title, author, content 等
        const draftPayload = {
            articles: [{
                title: title,
                author: DEFAULT_AUTHOR,
                content: html,
                digest: "由二千年间创作助手生成",
                show_cover_pic: 0,
                need_open_comment: NEED_OPEN_COMMENT,
                only_fans_can_comment: 0,
				thumb_media_id: "Gp4atzJl6iIcXPEQOa2ANILEZo2xGxOZKMKk1LyLdlIoWitf6e54SSt2ommc9ykh",
            }]
        };

        // 3. 调用微信上传接口
        const uploadUrl = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`;
        const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: JSON.stringify(draftPayload)
        });
        const uploadData = await uploadRes.json();

        if (uploadData.media_id) {
            return new Response(JSON.stringify({ success: true, media_id: uploadData.media_id }));
        } else {
            return new Response(JSON.stringify({ success: false, error: uploadData.errmsg }), { status: 400 });
        }

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
