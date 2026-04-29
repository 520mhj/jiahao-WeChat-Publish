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

    // 【核心修复】：不再强求几千字，顺应免费模型的输出极限，要求它写出紧凑、完整的全篇。
    const writingPrompt = `请为题材《${finalTopic}》写一篇微信公众号文章。
要求：
1. 风格：${PERSONAS[persona] || PERSONAS.formal}
2. 包含1个“爆款”一级标题，和 2-3 个二级标题。
3. 必须包含一段以 '> 虾选金句' 开头的引用块（必须带 > 符号）。
4. 【重要】受限于输出长度，篇幅请控制在 800-1000 字左右，确保文章结构完整，必须有明确的结尾段落，不要生成一半断掉。
5. 请跳过任何问候语，直接输出纯 Markdown 正文。`;

    const messages = [
        { role: "system", content: "你是一个专业的微信公众号爆款文章写手。" },
        { role: "user", content: writingPrompt }
    ];

    try {
        // 恢复使用 CF 免费提供的 Beta 模型，不再强制传入超高的 max_tokens 触发报错
        const stream = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
            messages,
            stream: true
        });

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
