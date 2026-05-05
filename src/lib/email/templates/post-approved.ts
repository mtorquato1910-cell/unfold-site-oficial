import { escapeHtml } from '../send-template'

export function templatePostApprovedHtml(d: {
  authorName: string
  title: string
  url: string
}): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Post aprovado</title></head>
<body style="font-family:Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#0a2a35;border-radius:12px;padding:40px;border:1px solid #1a3a45;">
    <p style="font-family:monospace;font-size:11px;color:#6DF9C6;text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">Post aprovado · publicado</p>
    <h1 style="font-size:26px;font-weight:700;margin-bottom:16px;color:#E7E7E7;">Parabéns, ${escapeHtml(d.authorName)}!</h1>
    <p style="color:#9db5c0;line-height:1.7;margin-bottom:24px;">Seu post <strong style="color:#E7E7E7;">${escapeHtml(d.title)}</strong> foi aprovado e está publicado no blog da Unfold Growth.</p>
    <a href="${escapeHtml(d.url)}" style="display:inline-block;background:#6DF9C6;color:#001E29;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Ver post publicado</a>
    <p style="color:#6a8a94;font-size:12px;margin-top:32px;border-top:1px solid #1a3a45;padding-top:16px;">© ${new Date().getFullYear()} Unfold Growth</p>
  </div>
</body></html>`
}
