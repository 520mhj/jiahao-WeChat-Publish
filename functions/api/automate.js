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

    try {
        // 使用原生官方流式生成，开启 stream: true
        const stream = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
            messages,
            stream: true,
            max_tokens: 4000 // 调高 token 确保长文不截断
        });

        // 原生返回 Server-Sent Events 流
        return new Response(stream, {
            headers: { 
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
