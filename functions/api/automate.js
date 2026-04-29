export async function onRequestPost(context) {
    const { env, request } = context;
    const { topic, persona } = await request.json();

    const PERSONAS = {
        formal: "你是一个正式但是易理解的写作助手，风格类似严肃媒体的社论，用词亲切，逻辑清晰。",
        expert: "你是一个资深技术专家，行文硬核，喜欢深度分析底层原理，使用专业术语。",
        storyteller: "你是一个情感丰富的故事讲述者，善于通过细节描写打动读者，风格感性。",
        critic: "你是一个犀利的评论员，擅长使用归谬法和辩证批评，挑战常规观点。"
    };

    let finalTopic = topic || "今日最新科技或互联网热点";

    const writingPrompt = const writingPrompt = `请为题材《${finalTopic}》写一篇深度微信公众号长文。
要求：
1. 风格：${PERSONAS[persona] || PERSONAS.formal}
2. 包含1个“爆款”一级标题，以及结构清晰的多个二级标题。
3. 必须包含一段以 '三级标题 虾选金句' 换行开头的引用块（必须带 > 符号）。
4. 内容详细丰富，逻辑严密，提供深度的见解。
5. 【严格语言纪律】全文必须使用纯正的中文（简体）撰写！严禁夹杂任何英文单词或短语（遇到外文专有名词请全部意译为中文，例如将 "cat memes" 译为 "猫咪梗图"，"nationalism" 译为 "民族主义"）。
6. 【直接输出】请直接输出标准 Markdown 正文，绝对不要输出“好的”、“没问题”等任何开场白或自我介绍！`;

    const messages = [
        { role: "system", content: "你是一个专业的微信公众号爆款文章写手。" },
        { role: "user", content: writingPrompt }
    ];

    // 创建一个极其纯净的文本流管道传给前端
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
        try {
            // 调用 NVIDIA (Kimi) 接口
            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "moonshotai/kimi-k2.5",
                    messages: messages,
                    stream: true,
                    max_tokens: 4096 // NVIDIA 支持生成超长文本
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`NVIDIA API 拒绝访问 (${response.status}): ${errText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let lines = buffer.split('\n');
                buffer = lines.pop(); // 保留不完整的部分

                for (let line of lines) {
                    line = line.trim();
                    if (line.startsWith("data:")) {
                        const dataStr = line.slice(5).trim();
                        if (dataStr === "[DONE]") continue;
                        
                        try {
                            const parsed = JSON.parse(dataStr);
                            // OpenAI 兼容格式提取文字的核心逻辑
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                await writer.write(encoder.encode(content));
                            }
                        } catch (e) {
                            // 忽略单个碎片的解析错误
                        }
                    }
                }
            }
        } catch (err) {
            await writer.write(encoder.encode(`\n\n[生成错误：${err.message}]`));
        } finally {
            await writer.close();
        }
    })();

    // 告诉前端：这是最干净的纯文本流
    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });
}
