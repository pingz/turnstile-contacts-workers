// index.mjs
import htmlContentTxt from './index.html.txt'; // 导入 HTML 文本

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 处理验证请求
    if (request.method === 'POST' && url.pathname.endsWith('/verify')) {
      const formData = await request.formData();
      const token = formData.get('cf-turnstile-response');
      
      // 向 Cloudflare 验证 token
      const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${token}`
      });
      
      const verifyData = await verifyResponse.json();
      console.log(verifyData);

      if (verifyData.success) {
        // 验证成功，返回邮箱显示 HTML
        return new Response(
          `<div class="email-display" style="padding: 20px; background: #808080; border-radius: 8px; font-size: 18px;">
             邮箱地址: <strong>${env.EMAIL_ADDRESS}</strong>
           </div>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      } else {
        // 验证失败
        return new Response('Verification failed', { status: 403 });
      }
    }
    const htmlContent = htmlContentTxt.replace("TURNSTILE_SITE_KEY", env.TURNSTILE_SITE_KEY);
    // 返回初始 HTML 页面
    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
