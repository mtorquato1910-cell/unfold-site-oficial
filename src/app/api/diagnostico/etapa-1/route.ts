import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SignJWT } from 'jose'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  empresa: z.string().min(2),
  cargo: z.string().optional(),
  tamanho_equipe: z.string().optional(),
  receita_anual: z.string().optional(),
  consentimento: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { nome, email, empresa, cargo, tamanho_equipe, receita_anual } = parsed.data
    const payload = await getPayload({ config: configPromise })

    // Verificar se já existe lead com este email para não duplicar
    let leadId: string | number
    try {
      const existing = await payload.find({
        collection: 'leads',
        where: { email: { equals: email } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        leadId = existing.docs[0].id
      } else {
        const lead = await payload.create({
          collection: 'leads',
          data: {
            nome,
            email,
            empresa,
            cargo: cargo || '',
            tamanho_equipe: tamanho_equipe as 'string' | undefined,
            receita_anual: receita_anual as 'string' | undefined,
            origem: 'diagnostico',
            rd_sync_status: 'pending',
            consentimento_lgpd: parsed.data.consentimento || false,
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          },
        })
        leadId = lead.id
      }
    } catch {
      // Tabela não migrada ainda — usar ID fictício para dev
      leadId = `mock-${Date.now()}`
    }

    // Gerar JWT com informações do lead
    const secret = new TextEncoder().encode(
      process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION'
    )
    const token = await new SignJWT({ leadId: String(leadId), email, nome, empresa })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(secret)

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    console.error('[diagnostico/etapa-1]', err)
    return NextResponse.json({ error: 'Erro interno ao processar diagnóstico' }, { status: 500 })
  }
}
