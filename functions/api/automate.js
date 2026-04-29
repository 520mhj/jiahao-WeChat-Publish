export async function onRequestPost(context) {
    const { env, request } = context;
    const { topic, persona } = await request.json();

    const PERSONAS = {
        formal: "你是一个正式但是易理解的写作助手，风格类似严肃媒体的社论，但用词亲切，逻辑清晰。",
        expert: "你是一个资深技术专家，行文硬核，喜欢深度分析底层原理，使用专业术语。",
        storyteller: "你是一个情感丰富的故事讲述者，善于通过细节描写打动读者，风格感性。",
        critic: "你是一个犀利的评论员，擅长使用归谬法和辩证批评，挑战常规观点。"
    };

    let finalTopic = topic || "今日最新科技或互联网热点";

    const writingPrompt = `基于以下题材：${finalTopic}。
请撰写一篇逻辑严密、细节丰富的深度长文。
要求：
1. 风格遵循：${PERSONAS[persona]}。
2. 必须包含一个极具吸引力的“爆款”1级标题，以及多个 2 级标题，吸引读者点击。
3. 必须包含一段以 '虾选金句' 开头的引用块（使用 > 符号）。
4. 尽可能详细展开，字数越丰富越好。
5. 请直接输出 Markdown 正文，不要包含任何多余的开场白或解释。`;

    const messages = [
        { role: "system", content: "你是一个专业的微信公众号爆款文章写手。" },
        { role: "user", content: writingPrompt }
    ];

    // 创建一个极其纯净的文本流管道传给前端
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 异步处理 AI 请求
    (async () => {
        try {
            const response = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages,
                stream: true,
                max_tokens: 2500 // 调低 Token 以免触发模型的长度上限报错
            });

            if (response instanceof ReadableStream) {
                const reader = response.getReader();
                const decoder = new TextDecoder("utf-8");
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    let parts = buffer.split('\n');
                    buffer = parts.pop(); // 保留最后不完整的部分
                    
                    for (const line of parts) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data:')) {
                            const dataStr = trimmed.slice(5).trim();
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                // 提取到有效文字后，直接以纯文本写入流中
                                if (data.response) {
                                    await writer.write(encoder.encode(data.response));
                                }
                                if (data.error) {
                                    await writer.write(encoder.encode(`\n\n[API 报错: ${data.error}]`));
                                }
                            } catch(e) {}
                        }
                    }
                }
                // 处理末尾残留
                if (buffer.includes('response')) {
                    try { 
                        const data = JSON.parse(buffer.replace('data:', '').trim());
                        if(data.response) await writer.write(encoder.encode(data.response));
                    } catch(e) {}
                }
            } else if (response && response.response) {
                // 模型降级为非流式时的安全兜底
                await writer.write(encoder.encode(response.response));
            } else {
                await writer.write(encoder.encode("AI 未返回预期内容，请重试。"));
            }
        } catch (err) {
            await writer.write(encoder.encode(`\n\n[生成错误：${err.message}]`));
        } finally {
            await writer.close();
        }
    })();

    // 告诉前端：这是最干净的纯文本，直接往框里塞就行
    return new Response(readable, {
        headers: { 
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });
}
