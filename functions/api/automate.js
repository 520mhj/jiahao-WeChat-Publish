// 注意：需要在 wrangler.toml 中添加 [ai] 绑定
export async function onRequestPost(context) {
    const { env, request } = context;
    const { topic, persona } = await request.json();

    // 人格设定定义
    const PERSONAS = {
        formal: "你是一个正式但是易理解的写作助手，风格类似严肃媒体的社论，但用词亲切，逻辑清晰。",
        expert: "你是一个资深技术专家，行文硬核，喜欢深度分析底层原理，使用专业术语。",
        storyteller: "你是一个情感丰富的故事讲述者，善于通过细节描写打动读者，风格感性。",
        critic: "你是一个犀利的评论员，擅长使用归谬法和辩证批评，挑战常规观点。"
    };

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendStep = async (step, message, markdown = null) => {
        await writer.write(encoder.encode(JSON.stringify({ step, message, markdown })));
    };

    // 异步执行流
    (async () => {
        try {
            // 步骤 1: 选题与热点 (模拟或使用 AI 丰富题材)
            let finalTopic = topic;
            if (!topic) {
                await sendStep(1, "抓取今日科技热点中...");
                const trendRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                    messages: [{ role: "user", content: "列出 3 个当下最火的科技或互联网话题，简洁" }]
                });
                finalTopic = trendRes.response; // 简单处理
            }

            // 步骤 2: 生成大纲
            await sendStep(2, "正在构思文章大纲与结构...");
            
            // 步骤 3: 核心写作
            await sendStep(3, "AI 正在全文润色与撰写中 (预计 1500-3000 字)...");
            const writingPrompt = `基于以下题材：${finalTopic}。
            要求：按照以下人格风格写作：${PERSONAS[persona]}。
            格式：Markdown 格式。文章必须包含一个吸引人的 1 级标题，多个 2 级标题，以及一段以 '虾选金句' 开头的引用块。`;

            const articleRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages: [
                    { role: "system", content: PERSONAS[persona] },
                    { role: "user", content: writingPrompt }
                ]
            });

            // 步骤 4: SEO 优化
            await sendStep(4, "提取文章摘要与 SEO 关键词...");
            
            // 完成
            await sendStep(5, "完成", articleRes.response);
        } catch (err) {
            await writer.write(encoder.encode(JSON.stringify({ error: err.message })));
        } finally {
            await writer.close();
        }
    })();

    return new Response(stream.readable, {
        headers: { "Content-Type": "application/json" }
    });
}
