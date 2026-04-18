import { marked } from 'marked';

export async function onRequestPost(context) {
    try {
        let { text } = await context.request.json();

        // 1. 执行文本替换需求
        text = text.replace(/我是你们的“PDF每日学习大师”！/g, "我是纸页虾！");

        // 2. Markdown 转 HTML
        const rawHtml = marked.parse(text);

        // 3. 构建内联样式 (从 default.css 提取并解析变量)
        // 微信对 CSS 变量支持较差，这里直接写死数值
        const style = `
<style>
  #MdWechat { color: #595959; font-family: Optima, serif; font-size: 16px; line-height: 1.5; }
  #MdWechat p { margin: 0; padding: 8px 0; line-height: 1.8; letter-spacing: 0.02em; }
  #MdWechat h2 { border-left: 5px solid #dec6fb; padding-left: 10px; font-size: 18px; margin: 30px 0 15px; font-weight: bold; }
  #MdWechat strong { color: #916dd5; font-weight: bold; }
  #MdWechat blockquote { background: #f6eeff; border: 1px solid #dec6fb; border-radius: 6px; padding: 14px; margin: 18px 0; }
  /* 修复分割线样式 */
  #MdWechat hr {
    height: 0;
    margin: 24px 0;
    border: none;
    border-top: 2px solid #d9b8fa; /* 对应原 css 的 --hr-color */
  }
</style>
`;

        const finalHtml = `<section id="MdWechat">${style}${rawHtml}</section>`;

        return new Response(JSON.stringify({ html: finalHtml }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
