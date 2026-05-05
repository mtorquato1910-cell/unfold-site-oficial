import { escapeHtml } from '../send-template'

export function templatePostRejectedHtml(d: {
  authorName: string
  title: string
  reason: string
}): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Post precisa de ajustes</title></head>
<body style="font-family:Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#0a2a35;border-radius:12px;padding:40px;border:1px solid #1a3a45;">
    <p style="font-family:monospace;font-size:11px;color:#93BAFB;text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">Submissão · ajustes necessários</p>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:16px;color:#E7E7E7;">Olá, ${escapeHtml(d.authorName)}</h1>
    <p style="color:#9db5c0;line-height:1.7;margin-bottom:16px;">Sobre o post <strong style="color:#E7E7E7;">${escapeHtml(d.title)}</strong> — agradecemos a contribuição, mas ele precisa de alguns ajustes antes de poder ser publicado.</p>
    <div style="background:#001E29;border-left:3px solid #93BAFB;padding:16px;margin-bottom:20px;border-radius:6px;">
      <p style="margin:0;color:#E7E7E7;line-height:1.6;font-size:14px;"><strong>Feedback da equipe editorial:</strong></p>
      <p style="margin:8px 0 0 0;color:#9db5c0;line-height:1.7;font-size:13px;">${escapeHtml(d.reason)}</p>
    </div>
    <p style="color:#9db5c0;line-height:1.7;">Você pode revisar e enviar uma nova versão pelo formulário do blog.</p>
    <p style="color:#6a8a94;font-size:12px;margin-top:32px;border-top:1px solid #1a3a45;padding-top:16px;">© ${new Date().getFullYear()} Unfold Growth</p>
  </div>
</body></html>`
}
