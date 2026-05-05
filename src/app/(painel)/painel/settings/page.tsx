import { redirect } from 'next/navigation'

/**
 * /admin/settings está descontinuada — substituída por:
 * - /admin/site-config (contato, redes sociais, identidade do rodapé)
 * - /admin/home-config (Hero, Stats, Client Logos)
 *
 * Mantemos apenas redirect para evitar 404 em links antigos.
 */
export default function SettingsRedirectPage() {
  redirect('/admin/site-config')
}
