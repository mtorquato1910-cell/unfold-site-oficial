'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

async function payload() {
  return getPayload({ config })
}

// ─── POSTS ───────────────────────────────────────────────────────
export async function createPost(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'posts', data })
  revalidatePath('/painel/posts')
}

export async function updatePost(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'posts', id, data })
  revalidatePath('/painel/posts')
}

export async function deletePost(id: string) {
  const p = await payload()
  await p.delete({ collection: 'posts', id } as any)
  revalidatePath('/painel/posts')
}

// ─── CASES ───────────────────────────────────────────────────────
export async function createCase(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'cases', data })
  revalidatePath('/painel/cases')
}

export async function updateCase(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'cases', id, data })
  revalidatePath('/painel/cases')
}

export async function deleteCase(id: string) {
  const p = await payload()
  await p.delete({ collection: 'cases', id } as any)
  revalidatePath('/painel/cases')
}

// ─── TESTIMONIALS ────────────────────────────────────────────────
export async function createTestimonial(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'testimonials', data })
  revalidatePath('/painel/testimonials')
}

export async function updateTestimonial(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'testimonials', id, data })
  revalidatePath('/painel/testimonials')
}

export async function deleteTestimonial(id: string) {
  const p = await payload()
  await p.delete({ collection: 'testimonials', id } as any)
  revalidatePath('/painel/testimonials')
}

// ─── CATEGORIES ──────────────────────────────────────────────────
export async function createCategory(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'categories', data })
  revalidatePath('/painel/categories')
}

export async function updateCategory(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'categories', id, data })
  revalidatePath('/painel/categories')
}

export async function deleteCategory(id: string) {
  const p = await payload()
  await p.delete({ collection: 'categories', id } as any)
  revalidatePath('/painel/categories')
}

// ─── QUIZ QUESTIONS ──────────────────────────────────────────────
export async function createQuizQuestion(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'quiz-questions', data })
  revalidatePath('/painel/quiz')
}

export async function updateQuizQuestion(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'quiz-questions', id, data })
  revalidatePath('/painel/quiz')
}

export async function deleteQuizQuestion(id: string) {
  const p = await payload()
  await p.delete({ collection: 'quiz-questions', id } as any)
  revalidatePath('/painel/quiz')
}

// ─── INSIGHTS VARIATIONS ─────────────────────────────────────────
export async function createInsight(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'insights-variations', data })
  revalidatePath('/painel/insights')
}

export async function updateInsight(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'insights-variations', id, data })
  revalidatePath('/painel/insights')
}

export async function deleteInsight(id: string) {
  const p = await payload()
  await p.delete({ collection: 'insights-variations', id } as any)
  revalidatePath('/painel/insights')
}

// ─── AI PROMPTS ──────────────────────────────────────────────────
export async function createPrompt(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'ai-prompts', data })
  revalidatePath('/painel/prompts')
}

export async function updatePrompt(id: string, data: Record<string, any>) {
  const p = await payload()
  await (p as any).update({ collection: 'ai-prompts', id, data })
  revalidatePath('/painel/prompts')
}

export async function deletePrompt(id: string) {
  const p = await payload()
  await p.delete({ collection: 'ai-prompts', id } as any)
  revalidatePath('/painel/prompts')
}

// ─── LEADS (campos reais: nome, email, empresa, rd_sync_status) ──
export async function updateLeadStatus(id: string, rd_sync_status: string) {
  const p = await payload()
  await (p as any).update({ collection: 'leads', id, data: { rd_sync_status } })
  revalidatePath('/painel/leads')
}

export async function updateLeadNotes(id: string, notes: string) {
  const p = await payload()
  await (p as any).update({ collection: 'leads', id, data: { notes } })
  revalidatePath('/painel/leads')
}

export async function deleteLead(id: string) {
  const p = await payload()
  await p.delete({ collection: 'leads', id } as any)
  revalidatePath('/painel/leads')
}

// ─── USERS ───────────────────────────────────────────────────────
export async function createUser(data: Record<string, any>) {
  const p = await payload()
  await (p as any).create({ collection: 'users', data })
  revalidatePath('/painel/users')
}

export async function updateUserRole(id: string, role: string) {
  const p = await payload()
  await (p as any).update({ collection: 'users', id, data: { role } })
  revalidatePath('/painel/users')
}

export async function deleteUser(id: string) {
  const p = await payload()
  await p.delete({ collection: 'users', id } as any)
  revalidatePath('/painel/users')
}

// ─── SITE SETTINGS ───────────────────────────────────────────────
export async function updateSiteSettings(data: Record<string, any>) {
  const p = await payload()
  await (p as any).updateGlobal({ slug: 'site-settings', data })
  revalidatePath('/painel/settings')
}
