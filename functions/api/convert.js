import { marked } from 'marked';

// 全套 7 款主题样式仓库
const THEMES = {
    "default": { // 典雅紫
        section: 'padding: 20px 10px; color: #595959; font-family: Optima, serif; font-size: 16px; line-height: 1.6; background-color: #f9f7fc;',
        h1: 'font-size: 24px; font-weight: 700; color: #595959; margin: 30px 0 15px;',
        h2: 'font-size: 18px; font-weight: 700; color: #595959; border-left: 5px solid #dec6fb; padding-left: 10px; margin: 30px 0 15px;',
        h3: 'font-size: 17px; font-weight: 700; color: #595959; border-bottom: 2px solid #dec6fb; display: inline-block; margin: 30px 0 15px;',
        h4: 'font-size: 16px; font-weight: 700; color: #595959; margin: 24px 0 12px;',
        p: 'font-size: 15px; color: #595959; line-height: 1.8em; margin: 12px 0; text-align: justify;',
        ul: 'margin: 8px 0; padding-left: 25px; list-style-type: circle;',
        ol: 'margin: 8px 0; padding-left: 25px; list-style-type: decimal;',
        li: 'font-size: 14px; color: #595959; line-height: 1.8em; margin: 5px 0;',
        strong: 'color: #916dd5; font-weight: 700;',
        em: 'color: #916dd5; font-style: normal; background: linear-gradient(transparent 65%, #f6eeff 35%);',
        a: 'color: #664d9d; text-decoration: none; border-bottom: 1px solid #664d9d;',
        del: 'color: #777;',
        hr: 'height: 0; margin: 24px 0; border: none; border-top: 2px solid #d9b8fa;',
        blockquote: 'margin: 1.5em 0; padding: 14px 16px; border: 1px solid #dec6fb; border-radius: 6px; background: #f6eeff; color: #595959;',
        inlineCode: 'color: #916dd5; background: rgba(27, 31, 35, 0.05); padding: 2px 4px; border-radius: 4px; font-family: monospace;',
        pre: 'background: #282c34; border-radius: 6px; padding: 15px; color: #abb2bf; font-size: 13px; line-height: 1.6; overflow-x: auto;',
        img: 'display: block; max-width: 100%; border-radius: 6px; margin: 20px auto;',
        table: 'width: 100%; border-collapse: collapse; margin: 14px 0;',
        th: 'font-size: 14px; color: #595959; border: 1px solid #dec6fb; padding: 8px 10px; background: rgba(222, 198, 251, 0.22); font-weight: 700;',
        td: 'font-size: 14px; color: #595959; border: 1px solid #dec6fb; padding: 8px 10px;'
    },
    "apple": { // 极简科技
        section: 'padding: 20px 10px; color: #333333; font-family: -apple-system, sans-serif; background-color: #ffffff; line-height: 1.8;',
        h1: 'font-size: 26px; font-weight: 700; color: #1d1d1f; margin: 1.8em 0 0.8em 0; letter-spacing: -0.5px;',
        h2: 'font-size: 20px; font-weight: 600; color: #1d1d1f; margin: 1.6em 0 0.8em 0; letter-spacing: -0.3px;',
        h3: 'font-size: 17px; font-weight: 600; color: #1d1d1f; margin: 1.4em 0 0.6em 0;',
        h4: 'font-size: 16px; font-weight: 600; color: #1d1d1f; margin: 1.2em 0 0.6em 0;',
        p: 'font-size: 15px; color: #333333; line-height: 1.8; margin: 1.2em 0;',
        ul: 'margin: 1em 0; padding-left: 20px;',
        ol: 'margin: 1em 0; padding-left: 20px;',
        li: 'font-size: 15px; color: #333333; line-height: 1.7; margin: 0.5em 0;',
        strong: 'font-weight: 600; color: #1d1d1f;',
        em: 'font-style: italic; color: #86868b;',
        a: 'color: #0071E3; text-decoration: none;',
        del: 'text-decoration: line-through; color: #86868b;',
        hr: 'height: 1px; border: none; background-color: #d2d2d7; margin: 2em auto; width: 60%;',
        blockquote: 'background: #F5F5F7; border-radius: 12px; padding: 16px 20px; margin: 1.5em 0; border: none;',
        inlineCode: 'font-family: monospace; font-size: 13.5px; color: #eb4d4b; background: rgba(245, 245, 247, 0.8); padding: 2px 6px; border-radius: 4px;',
        pre: 'background: #1d1d1f; border-radius: 12px; padding: 30px 16px 16px; color: #f5f5f7; font-size: 13px; line-height: 1.6; overflow-x: auto;',
        img: 'border-radius: 12px; max-width: 100%; margin: 1.5em auto; display: block;',
        table: 'width: 100%; border-collapse: collapse; margin: 1.5em 0;',
        th: 'background: #F5F5F7; color: #1d1d1f; font-weight: 600; padding: 10px; border: 1px solid #d2d2d7;',
        td: 'padding: 10px; color: #333333; border: 1px solid #d2d2d7;'
    },
    "notion": { // 优雅手帐
        section: 'padding: 15px 10px; color: #37352F; font-family: ui-sans-serif, sans-serif; background-color: #FFFCF8; line-height: 1.7;',
        h1: 'font-size: 30px; font-weight: 700; color: #37352F; margin: 1.2em 0 0.5em 0;',
        h2: 'font-size: 24px; font-weight: 700; color: #37352F; margin: 1.5em 0 0.5em 0; border-bottom: 3px solid rgba(255, 212, 0, 0.4); display: inline-block;',
        h3: 'font-size: 20px; font-weight: 600; color: #37352F; margin: 1.2em 0 0.5em 0;',
        h4: 'font-size: 18px; font-weight: 600; color: #37352F; margin: 1em 0 0.4em 0;',
        p: 'font-size: 16px; color: #37352F; line-height: 1.7; margin: 0.8em 0;',
        ul: 'margin: 0.8em 0; padding-left: 28px;',
        ol: 'margin: 0.8em 0; padding-left: 28px;',
        li: 'font-size: 16px; color: #37352F; margin: 0.3em 0;',
        strong: 'font-weight: 600; color: #37352F;',
        em: 'font-style: italic; color: #9B9A97;',
        a: 'color: #9B9A97; text-decoration: none; border-bottom: 1px solid rgba(155, 154, 151, 0.4);',
        del: 'text-decoration: line-through; color: #9B9A97;',
        hr: 'border: none; border-top: 1px dashed rgba(55, 53, 47, 0.16); margin: 2em 0;',
        blockquote: 'padding: 2px 2px 2px 14px; margin: 1.2em 0; border-left: 3px solid #37352F; background: transparent;',
        inlineCode: 'color: #EB5757; background: rgba(135, 131, 120, 0.15); padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 85%;',
        pre: 'background: #F7F6F3; border-radius: 4px; padding: 16px; border: 1px solid rgba(223, 225, 228, 0.5); font-size: 14px; line-height: 1.5; overflow-x: auto;',
        img: 'border-radius: 4px; max-width: 100%; margin: 1.2em auto; display: block;',
        table: 'width: 100%; border-collapse: collapse; margin: 1.2em 0;',
        th: 'background: #F7F6F3; color: #37352F; font-weight: 600; text-align: left; padding: 8px 12px; border-bottom: 1px solid rgba(55, 53, 47, 0.16);',
        td: 'padding: 8px 12px; color: #37352F; border-bottom: 1px solid rgba(55, 53, 47, 0.09);'
    },
    "vibrant": { // 炫彩现代
        section: 'padding: 16px 10px; color: #334155; font-family: sans-serif; background-color: #FAFAFB; line-height: 1.8;',
        h1: 'font-size: 28px; font-weight: 800; color: #7C3AED; margin: 1.6em 0 1em 0; text-align: center;',
        h2: 'font-size: 20px; font-weight: 700; color: #1E293B; margin: 2em 0 1em 0; border-left: 6px solid #7C3AED; padding-left: 12px; border-radius: 4px;',
        h3: 'font-size: 18px; font-weight: 600; color: #334155; margin: 1.4em 0 0.8em 0;',
        h4: 'font-size: 17px; font-weight: 600; color: #334155; margin: 1.2em 0 0.6em 0;',
        p: 'font-size: 15px; color: #334155; line-height: 1.8; margin: 1.2em 0;',
        ul: 'margin: 1em 0; padding-left: 20px; color: #475569;',
        ol: 'margin: 1em 0; padding-left: 20px; color: #475569;',
        li: 'margin: 0.5em 0; font-size: 15px;',
        strong: 'font-weight: 600; color: #7C3AED; background: rgba(124, 58, 237, 0.1); padding: 2px 6px; border-radius: 6px;',
        em: 'font-style: italic; color: #3B82F6;',
        a: 'color: #3B82F6; text-decoration: none; border-bottom: 2px solid rgba(59, 130, 246, 0.3); font-weight: 500;',
        del: 'text-decoration: line-through; color: #94A3B8;',
        hr: 'height: 2px; border: none; background: linear-gradient(90deg, rgba(124, 58, 237, 0), rgba(124, 58, 237, 0.5), rgba(124, 58, 237, 0)); margin: 2.5em 0;',
        blockquote: 'background: #FFFFFF; border-radius: 12px; padding: 16px 20px; margin: 1.5em 0; border: 1px solid rgba(124, 58, 237, 0.1); box-shadow: 0 4px 6px rgba(124, 58, 237, 0.05);',
        inlineCode: 'color: #EC4899; background: #FCE7F3; padding: 3px 6px; border-radius: 6px; font-size: 13.5px; font-family: monospace;',
        pre: 'background: #1E293B; border-radius: 16px; padding: 20px; margin: 1.8em 0; color: #E2E8F0; font-size: 13.5px; line-height: 1.6; overflow-x: auto; box-shadow: 0 10px 15px rgba(30, 41, 59, 0.3);',
        img: 'border-radius: 16px; max-width: 100%; margin: 1.8em auto; display: block; box-shadow: 0 10px 15px rgba(124, 58, 237, 0.1);',
        table: 'width: 100%; border-collapse: separate; border-spacing: 0; margin: 1.5em 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);',
        th: 'background: #F1F5F9; color: #1E293B; font-weight: 600; padding: 12px; text-align: left;',
        td: 'padding: 12px; color: #475569; background: #FFFFFF; border-top: 1px solid #F1F5F9;'
    },
    "blue": { // 学术科技
        section: 'padding: 20px 10px; color: #3b4b57; font-family: Optima, serif; background-color: #eaf4ff; line-height: 1.5em;',
        h1: 'font-size: 24px; font-weight: 700; color: #3b4b57; margin: 30px 0 15px;',
        h2: 'font-size: 18px; font-weight: 700; color: #3b4b57; border-left: 5px solid #8ec5ff; padding-left: 10px; margin: 30px 0 15px;',
        h3: 'font-size: 17px; font-weight: 700; color: #3b4b57; border-bottom: 2px solid #8ec5ff; display: inline-block; margin: 30px auto 15px;',
        h4: 'font-size: 16px; font-weight: 700; color: #3b4b57; margin: 24px 0 12px;',
        p: 'font-size: 15px; color: #3b4b57; line-height: 1.8em; margin: 12px 0;',
        ul: 'margin: 8px 0; padding-left: 25px; list-style-type: circle;',
        ol: 'margin: 8px 0; padding-left: 25px; list-style-type: decimal;',
        li: 'font-size: 14px; color: #3b4b57; line-height: 1.8em; margin: 5px 0;',
        strong: 'color: #1976d2; font-weight: 700;',
        em: 'color: #1976d2; background: linear-gradient(transparent 65%, #eaf4ff 35%);',
        a: 'color: #1459a8; text-decoration: none; border-bottom: 1px solid #1459a8;',
        del: 'color: #6f8190;',
        hr: 'height: 0; border: none; border-top: 2px solid #7dbaf5; margin: 24px 0;',
        blockquote: 'background: #eaf4ff; border: 1px solid #b8dafc; border-radius: 6px; padding: 14px 16px; color: #3b4b57;',
        inlineCode: 'color: #1976d2; background: rgba(25, 118, 210, 0.10); padding: 2px 4px; border-radius: 4px; font-family: monospace;',
        pre: 'background: #17304f; border-radius: 6px; padding: 15px; color: #c9e4ff; font-size: 13px; line-height: 1.6; overflow-x: auto;',
        img: 'border-radius: 6px; max-width: 100%; margin: 20px auto; display: block;',
        table: 'width: 100%; border-collapse: collapse; margin: 14px 0;',
        th: 'background: rgba(142, 197, 255, 0.18); font-weight: 700; padding: 8px 10px; border: 1px solid #b8dafc;',
        td: 'padding: 8px 10px; border: 1px solid #b8dafc; color: #3b4b57;'
    },
    "green": { // 清新森林
        section: 'padding: 20px 10px; color: #40504a; font-family: Optima, serif; background-color: #edf8f1; line-height: 1.5em;',
        h1: 'font-size: 24px; font-weight: 700; color: #40504a; margin: 30px 0 15px;',
        h2: 'font-size: 18px; font-weight: 700; color: #40504a; border-left: 5px solid #9ad8b7; padding-left: 10px; margin: 30px 0 15px;',
        h3: 'font-size: 17px; font-weight: 700; color: #40504a; border-bottom: 2px solid #9ad8b7; display: inline-block; margin: 30px auto 15px;',
        h4: 'font-size: 16px; font-weight: 700; color: #40504a; margin: 24px 0 12px;',
        p: 'font-size: 15px; color: #40504a; line-height: 1.8em; margin: 12px 0;',
        ul: 'margin: 8px 0; padding-left: 25px; list-style-type: circle;',
        ol: 'margin: 8px 0; padding-left: 25px; list-style-type: decimal;',
        li: 'font-size: 14px; color: #40504a; line-height: 1.8em; margin: 5px 0;',
        strong: 'color: #2f8f5b; font-weight: 700;',
        em: 'color: #2f8f5b; background: linear-gradient(transparent 65%, #edf8f1 35%);',
        a: 'color: #2a6f4f; text-decoration: none; border-bottom: 1px solid #2a6f4f;',
        del: 'color: #6c7f76;',
        hr: 'height: 0; border: none; border-top: 2px solid #7bc799; margin: 24px 0;',
        blockquote: 'background: #edf8f1; border: 1px solid #bfe7cf; border-radius: 6px; padding: 14px 16px; color: #40504a;',
        inlineCode: 'color: #2f8f5b; background: rgba(47, 143, 91, 0.10); padding: 2px 4px; border-radius: 4px; font-family: monospace;',
        pre: 'background: #24332e; border-radius: 6px; padding: 15px; color: #c2efd3; font-size: 13px; line-height: 1.6; overflow-x: auto;',
        img: 'border-radius: 6px; max-width: 100%; margin: 20px auto; display: block;',
        table: 'width: 100%; border-collapse: collapse; margin: 14px 0;',
        th: 'background: rgba(154, 216, 183, 0.20); font-weight: 700; padding: 8px 10px; border: 1px solid #bfe7cf;',
        td: 'padding: 8px 10px; border: 1px solid #bfe7cf; color: #40504a;'
    },
    "dark": { // 静谧深蓝
        section: 'padding: 20px 10px; color: #d6deea; font-family: Optima, serif; background-color: #131922; line-height: 1.5em;',
        h1: 'font-size: 24px; font-weight: 700; color: #f3f7fb; margin: 30px 0 15px;',
        h2: 'font-size: 18px; font-weight: 700; color: #eef4fb; border-left: 5px solid #4da3ff; padding-left: 10px; margin: 30px 0 15px;',
        h3: 'font-size: 17px; font-weight: 700; color: #e6eef8; border-bottom: 2px solid #4da3ff; display: inline-block; margin: 30px auto 15px;',
        h4: 'font-size: 16px; font-weight: 700; color: #e6eef8; margin: 24px 0 12px;',
        p: 'font-size: 15px; color: #d6deea; line-height: 1.8em; margin: 12px 0;',
        ul: 'margin: 8px 0; padding-left: 25px; color: #f4f7fb; list-style-type: circle;',
        ol: 'margin: 8px 0; padding-left: 25px; color: #f4f7fb; list-style-type: decimal;',
        li: 'font-size: 14px; color: #d6deea; line-height: 1.8em; margin: 5px 0;',
        strong: 'color: #f6fbff; font-weight: 700; background: rgba(77, 163, 255, 0.18); padding: 0 4px; border-radius: 4px;',
        em: 'color: #dff0ff; background: linear-gradient(transparent 65%, rgba(77, 163, 255, 0.20) 35%);',
        a: 'color: #8bc2ff; text-decoration: none; border-bottom: 1px solid #8bc2ff;',
        del: 'color: #8793a2;',
        hr: 'height: 0; border: none; border-top: 2px solid #2a3443; margin: 24px 0;',
        blockquote: 'background: #1a222d; border: 1px solid #2f3b4d; border-radius: 6px; padding: 14px 16px; color: #d6deea;',
        inlineCode: 'color: #e8f4ff; background: rgba(120, 183, 255, 0.16); padding: 2px 4px; border-radius: 4px; font-family: monospace;',
        pre: 'background: #0f141b; border-radius: 6px; padding: 15px; color: #dbeafe; font-size: 13px; line-height: 1.6; overflow-x: auto; border: 1px solid #2f3b4d;',
        img: 'border-radius: 6px; max-width: 100%; margin: 20px auto; display: block; border: 1px solid #2f3b4d;',
        table: 'width: 100%; border-collapse: collapse; margin: 14px 0;',
        th: 'background: rgba(77, 163, 255, 0.16); font-weight: 700; color: #eef4fb; padding: 8px 10px; border: 1px solid #2f3b4d;',
        td: 'padding: 8px 10px; border: 1px solid #2f3b4d; color: #d6deea;'
    }
};

export async function onRequestPost(context) {
    try {
        let { text, theme } = await context.request.json();
        const config = THEMES[theme] || THEMES.default;

        // --- 1. 动态提取“核心金句”作为摘要 ---
        const zhaiyao = text.split("**纸页虾点评：** ")[1];
        const segment = zhaiyao.split('\n')[0];
        let digest = segment.substring(0, 120);

        // --- 2. 文本清洗与精准替换 ---
        text = text.replace(/\[cite_start\]/g, "");
        // 精准匹配 并清除，防语法报错的终极写法
        text = text.replace(/\[cite.*\]/g, "");

        // --- 3. 完美标题提取法：“物理截胡”（兼容版） ---
        let lines = text.split('\n');
        let titleIndex = -1;
        let extractedTitle = "";

        // 使用传统的 for 循环代替 findIndex，彻底避开旧版 TS/JS 语法报错
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                titleIndex = i;
                break; // 找到第一行非空文字后立即停止
            }
        }

        if (titleIndex !== -1) {
            // 提取纯文本标题（自动剔除 #、**、__ 等 Markdown 符号）
            extractedTitle = lines[titleIndex].replace(/#+\s*|\*\*|__/g, '').trim();
            // 直接将这一行从数组中彻底抹除！
            lines.splice(titleIndex, 1);
            // 重新拼合剩下的文本交给下游转换
            text = lines.join('\n');
        }

        // --- 3. 转换 Markdown ---
        let html = marked.parse(text);

        // 第一步：粉碎 <li> 内部的 <p> 标签，并去掉首尾多余空格
        html = html.replace(/<li>([\s\S]*?)<\/li>/g, function(match, innerContent) {
            return '<li>' + innerContent.replace(/<\/?p[^>]*>/g, '').trim() + '</li>';
        });

        // 第二步（本次核心修复）：彻底榨干列表标签之间的隐藏换行符（\n）
        // 微信正是把这些换行符误解析成了空的 5. 和 7.！
        html = html.replace(/<\/li>\s+<li/g, '</li><li');
        html = html.replace(/<ul>\s+<li/g, '<ul><li');
        html = html.replace(/<ol>\s+<li/g, '<ol><li');
        html = html.replace(/<\/li>\s+<\/ul>/g, '</li></ul>');
        html = html.replace(/<\/li>\s+<\/ol>/g, '</li></ol>');

        // 移除被榨干后完全空白的列表项
        html = html.replace(/<li><\/li>/g, '');

        // --- 5. 全要素精准注入行内样式 ---
        html = html.replace(/<h1/g, `<h1 style="${config.h1}"`);
        html = html.replace(/<h2/g, `<h2 style="${config.h2}"`);
        html = html.replace(/<h3/g, `<h3 style="${config.h3}"`);
        html = html.replace(/<h4/g, `<h4 style="${config.h4}"`);
        html = html.replace(/<p/g, `<p style="${config.p}"`);
        html = html.replace(/<ul/g, `<ul style="${config.ul}"`);
        html = html.replace(/<ol/g, `<ol style="${config.ol}"`);
        html = html.replace(/<li/g, `<li style="${config.li}"`);
        html = html.replace(/<blockquote/g, `<blockquote style="${config.blockquote}"`);
        html = html.replace(/<strong/g, `<strong style="${config.strong}"`);
        html = html.replace(/<em/g, `<em style="${config.em}"`);
        html = html.replace(/<a/g, `<a style="${config.a}"`);
        html = html.replace(/<del/g, `<del style="${config.del}"`);
        html = html.replace(/<hr\s*\/?>/g, `<hr style="${config.hr}" />`);
        html = html.replace(/<code/g, `<code style="${config.inlineCode}"`);
        html = html.replace(/<pre/g, `<pre style="${config.pre}"`);
        html = html.replace(/<img/g, `<img style="${config.img}"`);
        html = html.replace(/<table/g, `<table style="${config.table}"`);
        html = html.replace(/<th/g, `<th style="${config.th}"`);
        html = html.replace(/<td/g, `<td style="${config.td}"`);

        const finalHtml = `<section id="MdWechat" style="${config.section}">${html}</section>`;

        return new Response(JSON.stringify({ html: finalHtml, digest: digest, title: extractedTitle }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
