import { marked } from 'marked';

export async function onRequestPost(context) {
    try {
        let { text } = await context.request.json();

        // 1. 文本替换：我是纸页虾！
        text = text.replace(/我是你们的“PDF每日学习大师”！/g, "我是纸页虾！");

        // 2. 将 Markdown 转换为 HTML
        let html = marked.parse(text);

        // 3. 定义从 default.css 提取的数值样式
        const styles = {
            section: 'padding: 10px; color: #595959; font-family: Optima, serif; font-size: 16px; line-height: 1.5;',
            h2: 'font-size: 18px; font-weight: 700; color: #595959; border-left: 5px solid #dec6fb; padding-left: 10px; margin: 30px 0 15px; line-height: 1.8em;',
            p: 'font-size: 15px; color: #595959; line-height: 1.8em; letter-spacing: 0.02em; margin: 0; padding: 8px 0;',
            strong: 'color: #916dd5; font-weight: 700;',
            hr: 'height: 0; margin: 24px 0; border: none; border-top: 2px solid #d9b8fa;', // 分割线样式修复
            blockquote: 'margin: 18px 0; padding: 14px 16px; border: 1px solid #dec6fb; border-radius: 6px; background: #f6eeff; color: #595959;'
        };

        // 4. 手动进行行内样式替换 (模拟 juice 功能)
        html = html.replace(/<h2/g, `<h2 style="${styles.h2}"`);
        html = html.replace(/<p/g, `<p style="${styles.p}"`);
        html = html.replace(/<strong/g, `<strong style="${styles.strong}"`);
        html = html.replace(/<hr\s*\/?>/g, `<hr style="${styles.hr}" />`);
        html = html.replace(/<blockquote/g, `<blockquote style="${styles.blockquote}"`);

        // 最终包裹容器
        const finalHtml = `<section id="MdWechat" style="${styles.section}">${html}</section>`;

        return new Response(JSON.stringify({ html: finalHtml }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
