'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireRole } from '@/lib/painel-auth'

async function payload() {
  return getPayload({ config })
}

// ─── POSTS ───────────────────────────────────────────────────────
export async function createPost(data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).create({ collection: 'posts', data })
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
}

export async function updatePost(id: string, data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  const updated: any = await (p as any).update({ collection: 'posts', id, data })
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  if (updated?.slug) revalidatePath(`/blog/${updated.slug}`)
}

export async function deletePost(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'posts', id } as any)
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
}

// ─── CASES ───────────────────────────────────────────────────────
export async function createCase(data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).create({ collection: 'cases', data })
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/')
}

export async function updateCase(id: string, data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  const updated: any = await (p as any).update({ collection: 'cases', id, data })
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/')
  if (updated?.slug) revalidatePath(`/cases/${updated.slug}`)
}

export async function deleteCase(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'cases', id } as any)
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/')
}

// ─── TESTIMONIALS ────────────────────────────────────────────────
export async function createTestimonial(data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).create({ collection: 'testimonials', data })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
}

export async function updateTestimonial(id: string, data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).update({ collection: 'testimonials', id, data })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
}

export async function deleteTestimonial(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'testimonials', id } as any)
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
}

// ─── CATEGORIES ──────────────────────────────────────────────────
export async function createCategory(data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).create({ collection: 'categories', data })
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
}

export async function updateCategory(id: string, data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).update({ collection: 'categories', id, data })
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
}

export async function deleteCategory(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'categories', id } as any)
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
}

// ─── QUIZ QUESTIONS ──────────────────────────────────────────────
export async function createQuizQuestion(data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).create({ collection: 'quiz-questions', data })
  revalidatePath('/admin/quiz')
  revalidatePath('/diagnostico')
}

export async function updateQuizQuestion(id: string, data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).update({ collection: 'quiz-questions', id, data })
  revalidatePath('/admin/quiz')
  revalidatePath('/diagnostico')
}

export async function deleteQuizQuestion(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'quiz-questions', id } as any)
  revalidatePath('/admin/quiz')
  revalidatePath('/diagnostico')
}

// ─── INSIGHTS VARIATIONS ─────────────────────────────────────────
export async function createInsight(data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).create({ collection: 'insights-variations', data })
  revalidatePath('/admin/insights')
}

export async function updateInsight(id: string, data: Record<string, any>) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).update({ collection: 'insights-variations', id, data })
  revalidatePath('/admin/insights')
}

export async function deleteInsight(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'insights-variations', id } as any)
  revalidatePath('/admin/insights')
}

// ─── AI PROMPTS ──────────────────────────────────────────────────
export async function createPrompt(data: Record<string, any>) {
  await requireRole('admin')
  const p = await payload()
  await (p as any).create({ collection: 'ai-prompts', data })
  revalidatePath('/admin/prompts')
}

export async function updatePrompt(id: string, data: Record<string, any>) {
  await requireRole('admin')
  const p = await payload()
  await (p as any).update({ collection: 'ai-prompts', id, data })
  revalidatePath('/admin/prompts')
}

export async function deletePrompt(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'ai-prompts', id } as any)
  revalidatePath('/admin/prompts')
}

// ─── LEADS ───────────────────────────────────────────────────────
export async function updateLeadStatus(id: string, rd_sync_status: string) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).update({ collection: 'leads', id, data: { rd_sync_status } })
  revalidatePath('/admin/leads')
}

export async function updateLeadNotes(id: string, notes: string) {
  await requireRole('editor')
  const p = await payload()
  await (p as any).update({ collection: 'leads', id, data: { notes } })
  revalidatePath('/admin/leads')
}

export async function deleteLead(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'leads', id } as any)
  revalidatePath('/admin/leads')
}

// ─── USERS (Payload collection 'users' — diferente de Supabase!) ─
// Para gerenciar usuários do painel use src/lib/actions/user-actions.ts
export async function createUser(data: Record<string, any>) {
  await requireRole('admin')
  const p = await payload()
  await (p as any).create({ collection: 'users', data })
  revalidatePath('/admin/users')
}

export async function updateUserRole(id: string, role: string) {
  await requireRole('admin')
  const p = await payload()
  await (p as any).update({ collection: 'users', id, data: { role } })
  revalidatePath('/admin/users')
}

export async function deleteUser(id: string) {
  await requireRole('admin')
  const p = await payload()
  await p.delete({ collection: 'users', id } as any)
  revalidatePath('/admin/users')
}

// ─── SITE SETTINGS ───────────────────────────────────────────────
export async function updateSiteSettings(data: Record<string, any>) {
  await requireRole('admin')
  const p = await payload()
  await (p as any).updateGlobal({ slug: 'site-settings', data })
  revalidateTag('site-settings')
  revalidatePath('/', 'layout')
}
