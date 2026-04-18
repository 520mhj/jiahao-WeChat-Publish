export async function onRequestPost(context) {
    const { env } = context;
    const { html, title } = await context.request.json();

    // 关键：确保你在 Cloudflare Dashboard 的 Settings -> Functions 中配置了这些变量
    const APP_ID = env.WECHAT_APP_ID;
    const APP_SECRET = env.WECHAT_APP_SECRET;
    const DEFAULT_AUTHOR = env.WECHAT_DEFAULT_AUTHOR || "纸页虾";

    try {
        // 1. 获取 Access Token
        const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            // 返回具体的微信错误信息，方便排查 (如 IP 不在白名单会显示 errcode: 40164)
            return new Response(JSON.stringify({ success: false, error: `微信接口错误: ${tokenData.errmsg || 'Token获取失败'}` }), { status: 500 });
        }

        const accessToken = tokenData.access_token;

        // 2. 上传草稿
        const draftPayload = {
            articles: [{
                title: title,
                author: DEFAULT_AUTHOR,
                content: html,
                digest: "由转换助手同步",
                show_cover_pic: 0,
                need_open_comment: 1, // 默认开启留言
                only_fans_can_comment: 0,
                WECHAT_DEFAULT_THUMB_MEDIA_ID: "Gp4atzJl6iIcXPEQOa2ANILEZo2xGxOZKMKk1LyLdlIoWitf6e54SSt2ommc9ykh"
            }]
        };

        const uploadRes = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`, {
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
