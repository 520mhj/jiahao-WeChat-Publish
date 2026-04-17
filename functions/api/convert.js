import { marked } from 'marked';

const DEFAULT_CSS = `
#MdWechat { color: #595959; font-family: Optima, serif; font-size: 16px; line-height: 1.5; padding: 10px; }
#MdWechat h2 { border-left: 5px solid #dec6fb; padding-left: 10px; font-size: 18px; margin: 30px 0 15px; font-weight: bold; }
#MdWechat p { margin: 0; padding: 8px 0; line-height: 1.8; letter-spacing: 0.02em; }
#MdWechat strong { color: #916dd5; font-weight: bold; }
#MdWechat blockquote { background: #f6eeff; border: 1px solid #dec6fb; border-radius: 6px; padding: 14px; margin: 18px 0; }
`;

export async function onRequestPost(context) {
    const { text } = await context.request.json();
    
    // 1. Markdown 转 HTML
    const rawHtml = marked.parse(text);
    
    // 2. 包裹微信特有容器并注入行内样式 (模拟 convert.js 的 inline 逻辑)
    // 注意：在正式生产环境，建议使用 juice 的库，
    // 这里为演示简洁，直接通过 section 包裹。
    const finalHtml = `<section id="MdWechat" style="color: #595959; font-family: Optima, sans-serif; font-size: 16px;">
        <style>${DEFAULT_CSS}</style>
        ${rawHtml}
    </section>`;

    return new Response(JSON.stringify({ html: finalHtml }), {
        headers: { "Content-Type": "application/json" }
    });
}