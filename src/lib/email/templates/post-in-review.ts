import { escapeHtml } from '../send-template'

export function templatePostInReviewHtml(d: {
  authorName: string
  authorEmail: string
  authorCompany: string
  title: string
  summary: string
  reviewUrl: string
}): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Nova submissão de blog</title></head>
<body style="font-family:Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#0a2a35;border-radius:12px;padding:40px;border:1px solid #1a3a45;">
    <p style="font-family:monospace;font-size:11px;color:#6DF9C6;text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">Nova submissão · Blog</p>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:16px;color:#E7E7E7;">${escapeHtml(d.title)}</h1>
    <div style="background:#001E29;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 6px 0;color:#9db5c0;font-size:13px;"><strong>Autor:</strong> ${escapeHtml(d.authorName)}</p>
      <p style="margin:0 0 6px 0;color:#9db5c0;font-size:13px;"><strong>Email:</strong> ${escapeHtml(d.authorEmail)}</p>
      ${d.authorCompany ? `<p style="margin:0;color:#9db5c0;font-size:13px;"><strong>Empresa:</strong> ${escapeHtml(d.authorCompany)}</p>` : ''}
    </div>
    <p style="color:#E7E7E7;line-height:1.7;margin-bottom:24px;">${escapeHtml(d.summary)}</p>
    <a href="${escapeHtml(d.reviewUrl)}" style="display:inline-block;background:#6DF9C6;color:#001E29;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Revisar no painel</a>
    <p style="color:#6a8a94;font-size:12px;margin-top:32px;border-top:1px solid #1a3a45;padding-top:16px;">© ${new Date().getFullYear()} Unfold Growth · Workflow editorial</p>
  </div>
</body></html>`
}
