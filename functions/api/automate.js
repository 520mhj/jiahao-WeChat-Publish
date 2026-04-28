// 文件路径：functions/api/automate.js
export async function onRequestPost(context) {
    const { env, request } = context;
    const { topic, persona } = await request.json();

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
        await writer.write(encoder.encode(JSON.stringify({ step, message, markdown }) + '\n'));
    };

    (async () => {
        try {
            // 步骤 1：选题与丰富题材
            let finalTopic = topic;
            if (!topic) {
                await sendStep(1, "捕捉灵感：抓取今日科技热点中...");
                const trendRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                    messages: [{ role: "user", content: "列出 3 个当下最火的科技或互联网话题，简洁描述" }]
                });
                finalTopic = trendRes.response;
            }

            // 步骤 2：生成精细大纲 (关键：防止模型“迷路”)
            await sendStep(2, "逻辑构思：正在设计文章深度大纲...");
            const outlineRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages: [
                    { role: "system", content: PERSONAS[persona] },
                    { role: "user", content: `针对题材《${finalTopic}》，规划一份详细的 Markdown 大纲。要求包含：1个一级标题，4个二级标题，并注明每个部分的写作重点。` }
                ],
                max_tokens: 1000 
            });
            const outline = outlineRes.response;

            // 步骤 3：全文扩写 (调高 max_tokens)
            await sendStep(3, "内容生产：AI 正在进行深度写作与润色 (约需 15-25 秒)...");
            
            const writingPrompt = `你现在正在为公众号“纸页虾”创作。
            参考大纲：
            ${outline}

            请根据上述大纲，撰写出一篇逻辑严密、细节丰富的深度长文。
            要求：
            1. 风格遵循：${PERSONAS[persona]}。
            2. 必须包含一段以 '虾选金句' 开头的引用块（使用 > 符号）。
            3. 字数要求：尽量丰富，不少于 1500 字。
            4. 输出格式：纯 Markdown。`;

            // 核心修改：手动指定较高的 max_tokens，并使用更稳定的指令
            const articleRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages: [
                    { role: "system", content: PERSONAS[persona] },
                    { role: "user", content: writingPrompt }
                ],
                max_tokens: 3500 // 调高单次生成上限
            });

            // 步骤 4：SEO 与摘要提取
            await sendStep(4, "产品打磨：正在提取摘要并优化 SEO 关键词...");
            
            // 步骤 5：完成
            await sendStep(5, "完成", articleRes.response);
        } catch (err) {
            await writer.write(encoder.encode(JSON.stringify({ error: `生成中断：${err.message}` }) + '\n'));
        } finally {
            await writer.close();
        }
    })();

    return new Response(stream.readable, {
        headers: { "Content-Type": "application/x-ndjson" }
    });
}
