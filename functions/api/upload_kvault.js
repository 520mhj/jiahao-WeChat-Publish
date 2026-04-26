// 文件路径：functions/api/upload_kvault.js
export async function onRequestPost(context) {
    const { env, request } = context;
    
    // 从环境变量获取你的配置
    const API_URL = "https://file.jiahaolikeyou.de5.net/api/v1/upload"; // 也可以配置成环境变量 KVAULT_URL
    const AUTH_TOKEN = env.KVAULT_TOKEN; 

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return new Response(JSON.stringify({ success: false, error: "未找到文件" }), { status: 400 });

        // 构造发送到图床的请求
        const kvaultFormData = new FormData();
        kvaultFormData.append('file', file);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: kvaultFormData
        });

        const result = await response.json();

        // 根据你提供的格式返回链接
        if (result.success && result.links && result.links.download) {
            return new Response(JSON.stringify({ 
                success: true, 
                url: result.links.download 
            }));
        } else {
            return new Response(JSON.stringify({ success: false, error: "图床上传失败" }), { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
