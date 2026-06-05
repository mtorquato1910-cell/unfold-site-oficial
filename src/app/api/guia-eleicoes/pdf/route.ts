/**
 * GET /api/guia-eleicoes/pdf — entrega o PDF do guia SOMENTE para quem passou pelo
 * cadastro (cookie httpOnly assinado `guia_unlock`). O arquivo vive fora de /public
 * (private-assets/), então não há mais URL pública direta para o documento.
 */
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { UNLOCK_COOKIE_NAME, isValidUnlockValue } from '@/app/guia-eleicoes-2026/_lib/unlock-cookie'

const PDF_FILE = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(UNLOCK_COOKIE_NAME)?.value
  if (!isValidUnlockValue(cookie, Date.now())) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized', message: 'Cadastre-se para baixar o estudo.' },
      { status: 401 },
    )
  }

  try {
    const file = await readFile(path.join(process.cwd(), 'private-assets', PDF_FILE))
    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILE}"`,
        'Content-Length': String(file.length),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'pdf_indisponivel' }, { status: 500 })
  }
}
