import { marked } from 'marked';

const THEMES = {
    "default": { //
        section: 'padding: 20px 10px; color: #595959; font-family: Optima, serif; font-size: 16px; line-height: 1.6; background-color: #f9f7fc;',
        h2: 'font-size: 18px; font-weight: 700; color: #595959; border-left: 5px solid #dec6fb; padding-left: 10px; margin: 30px 0 15px;',
        p: 'font-size: 15px; color: #595959; line-height: 1.8em; margin: 12px 0; text-align: justify;',
        strong: 'color: #916dd5; font-weight: 700;',
        hr: 'height: 0; margin: 24px 0; border: none; border-top: 2px solid #d9b8fa;',
        blockquote: 'margin: 1.5em 0; padding: 14px 16px; border: 1px solid #dec6fb; border-radius: 6px; background: #f6eeff; color: #595959;',
        pre: 'background: #282c34; border-radius: 6px; padding: 15px; color: #abb2bf; font-size: 13px; line-height: 1.6; overflow-x: auto;'
    },
    "apple": { //
        section: 'padding: 20px 10px; color: #333333; font-family: -apple-system, sans-serif; background-color: #ffffff;',
        h2: 'font-size: 20px; font-weight: 600; color: #1d1d1f; margin: 1.6em 0 0.8em 0;',
        p: 'font-size: 15px; color: #333333; line-height: 1.8; margin: 1.2em 0;',
        strong: 'font-weight: 600; color: #1d1d1f;',
        hr: 'height: 1px; border: none; background-color: #d2d2d7; margin: 2em auto; width: 60%;',
        blockquote: 'background: #F5F5F7; border-radius: 12px; padding: 16px 20px; margin: 1.5em 0; border: none;',
        pre: 'background: #1d1d1f; border-radius: 12px; padding: 30px 16px 16px; color: #f5f5f7; font-size: 13px;'
    },
    "notion": { //
        section: 'padding: 20px 10px; color: #37352F; font-family: ui-sans-serif, sans-serif; background-color: #FFFCF8;',
        h2: 'font-size: 24px; font-weight: 700; color: #37352F; margin: 1.5em 0 0.5em 0; border-bottom: 3px solid rgba(255, 212, 0, 0.4); display: inline-block;',
        p: 'font-size: 16px; color: #37352F; line-height: 1.7; margin: 0.8em 0;',
        strong: 'font-weight: 600; color: #37352F;',
        hr: 'border: none; border-top: 1px dashed rgba(55, 53, 47, 0.16); margin: 2em 0;',
        blockquote: 'padding: 2px 2px 2px 14px; margin: 1.2em 0; border-left: 3px solid #37352F; background: transparent;',
        pre: 'background: #F7F6F3; border-radius: 4px; padding: 16px; border: 1px solid rgba(223, 225, 228, 0.5);'
    },
    "vibrant": { //
        section: 'padding: 20px 10px; color: #334155; font-family: sans-serif; background-color: #FAFAFB;',
        h2: 'font-size: 20px; font-weight: 700; color: #1E293B; margin: 2em 0 1em 0; border-left: 6px solid #7C3AED; padding-left: 12px;',
        p: 'font-size: 15px; color: #334155; line-height: 1.8; margin: 1.2em 0;',
        strong: 'font-weight: 600; color: #7C3AED; background: rgba(124, 58, 237, 0.1); padding: 2px 6px; border-radius: 6px;',
        hr: 'height: 2px; border: none; background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), transparent); margin: 2.5em 0;',
        blockquote: 'background: #FFFFFF; border-radius: 12px; padding: 16px 20px; margin: 1.5em 0; border: 1px solid rgba(124, 58, 237, 0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.05);',
        pre: 'background: #1E293B; border-radius: 16px; padding: 20px; color: #E2E8F0; box-shadow: 0 10px 15px rgba(0,0,0,0.2);'
    },
    "blue": { //
        section: 'padding: 20px 10px; color: #3b4b57; font-family: serif; background-color: #eaf4ff;',
        h2: 'font-size: 18px; font-weight: 700; border-left: 5px solid #8ec5ff; padding-left: 10px; margin: 30px 0 15px;',
        p: 'font-size: 15px; color: #3b4b57; line-height: 1.8em; margin: 12px 0;',
        strong: 'color: #1976d2; font-weight: 700;',
        hr: 'height: 0; border: none; border-top: 2px solid #7dbaf5; margin: 24px 0;',
        blockquote: 'background: #eaf4ff; border: 1px solid #b8dafc; border-radius: 6px; padding: 14px 16px;',
        pre: 'background: #17304f; border-radius: 6px; padding: 15px; color: #c9e4ff;'
    },
    "green": { //
        section: 'padding: 20px 10px; color: #40504a; font-family: serif; background-color: #edf8f1;',
        h2: 'font-size: 18px; font-weight: 700; border-left: 5px solid #9ad8b7; padding-left: 10px; margin: 30px 0 15px;',
        p: 'font-size: 15px; color: #40504a; line-height: 1.8em; margin: 12px 0;',
        strong: 'color: #2f8f5b; font-weight: 700;',
        hr: 'height: 0; border: none; border-top: 2px solid #7bc799; margin: 24px 0;',
        blockquote: 'background: #edf8f1; border: 1px solid #bfe7cf; border-radius: 6px; padding: 14px 16px;',
        pre: 'background: #24332e; border-radius: 6px; padding: 15px; color: #c2efd3;'
    },
    "dark": { //
        section: 'padding: 20px 10px; color: #d6deea; font-family: serif; background-color: #131922;',
        h2: 'font-size: 18px; font-weight: 700; border-left: 5px solid #4da3ff; padding-left: 10px; margin: 30px 0 15px; color: #eef4fb;',
        p: 'font-size: 15px; color: #d6deea; line-height: 1.8em; margin: 12px 0;',
        strong: 'color: #f6fbff; background: rgba(77, 163, 255, 0.18); padding: 0 4px; border-radius: 4px;',
        hr: 'height: 0; border: none; border-top: 2px solid #2a3443; margin: 24px 0;',
        blockquote: 'background: #1a222d; border: 1px solid #2f3b4d; border-radius: 6px; padding: 14px 16px; color: #d6deea;',
        pre: 'background: #0f141b; border-radius: 6px; padding: 15px; color: #dbeafe; border: 1px solid #2f3b4d;'
    }
};

export async function onRequestPost(context) {
    try {
        let { text, theme } = await context.request.json();
        const config = THEMES[theme] || THEMES.default;

        // 1. 文本清洗与替换 [自定义需求]
        // 移除所有方括号及其内容，如 或 
        text = text.replace(/\[.*?\]/g, "");

        // 2. 文本替换：我是纸页虾！
        text = text.replace(/我是你们的“PDF每日学习大师”！/g, "我是纸页虾！");

        // 3. 转换 Markdown
        let html = marked.parse(text);

        // 4. 移除正文开头的第一个 H1 标签，避免与微信文章标题重复
        //html = html.replace(/^\s*<h1\b[^>]*>.*?<\/h1>/is, '');

        // 5. 注入行内样式 (模拟 Juice)
        html = html.replace(/<h2/g, `<h2 style="${config.h2}"`);
        html = html.replace(/<p/g, `<p style="${config.p}"`);
        html = html.replace(/<strong/g, `<strong style="${config.strong}"`);
        html = html.replace(/<hr\s*\/?>/g, `<hr style="${config.hr}" />`);
        html = html.replace(/<blockquote/g, `<blockquote style="${config.blockquote}"`);
        html = html.replace(/<pre/g, `<pre style="${config.pre}"`);

        const finalHtml = `<section id="MdWechat" style="${config.section}">${html}</section>`;

        return new Response(JSON.stringify({ html: finalHtml }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
