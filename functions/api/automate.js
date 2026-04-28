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
        // 使用 \n 分隔每个 JSON 对象，确保前端解析不报错
        await writer.write(encoder.encode(JSON.stringify({ step, message, markdown }) + '\n'));
    };

    (async () => {
        try {
            // 1. 选题
            let finalTopic = topic;
            if (!topic) {
                await sendStep(1, "正在抓取今日热点并构思选题...");
                const trendRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                    messages: [{ role: "user", content: "列出 3 个当下最火的科技或互联网话题，简洁描述" }]
                });
                finalTopic = trendRes.response;
            }

            // 2. 生成详细大纲
            await sendStep(2, "正在构思深度大纲 (分段规划中)...");
            const outlineRes = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages: [
                    { role: "system", content: PERSONAS[persona] },
                    { role: "user", content: `针对题材《${finalTopic}》，规划一份包含 4 个章节的详细 Markdown 大纲。只需要输出标题列表。` }
                ]
            });
            const outline = outlineRes.response;

            // 3. 撰写上半部分 (解决超时关键步)
            await sendStep(3, "内容生产：正在撰写文章上半部分...");
            const part1Res = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages: [
                    { role: "system", content: PERSONAS[persona] },
                    { role: "user", content: `参考大纲：\n${outline}\n\n请撰写文章的前两个章节。要求：Markdown格式，包含吸引人的1级标题。不要写结论。` }
                ],
                max_tokens: 1800 
            });
            const part1 = part1Res.response;

            // 4. 撰写下半部分与总结
            await sendStep(4, "内容生产：正在撰写下半部分并润色全文...");
            const part2Res = await env.AI.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
                messages: [
                    { role: "system", content: PERSONAS[persona] },
                    { role: "user", content: `这是文章的前半部分：\n${part1}\n\n请继续写完剩下的章节。要求：衔接自然，包含一段以 '虾选金句' 开头的引用块(> 符号)，并给出深度总结。直接输出后续内容。` }
                ],
                max_tokens: 1800
            });
            const part2 = part2Res.response;

            // 5. 合并并提取 SEO
            const fullMarkdown = part1 + "\n\n" + part2;
            await sendStep(5, "流程执行完毕，内容已就绪！", fullMarkdown);

        } catch (err) {
            await writer.write(encoder.encode(JSON.stringify({ error: `AI 写作中断：${err.message}` }) + '\n'));
        } finally {
            await writer.close();
        }
    })();

    return new Response(stream.readable, {
        headers: { "Content-Type": "application/x-ndjson" }
    });
}
