/**
 * E2E — fluxo completo do Diagnóstico (Etapa 1 → Etapa 2 → Resultado).
 *
 * STATUS: stub. Para rodar este teste, instalar Playwright:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *
 * Após instalação, basta rodar:
 *   npx playwright test tests/e2e/diagnostico-fluxo-completo.spec.ts
 *
 * Ativar em CI: adicionar job ao `.github/workflows/diagnostico-smoke.yml`.
 */

// @ts-expect-error: módulo não instalado por padrão (deps de dev opcionais).
import { expect, test } from '@playwright/test'

test.describe('Diagnóstico de Growth — fluxo completo', () => {
  test('caso Roberto bate score 22 + faixa Fit Médio + padrões P4/P8/P2', async ({ page }) => {
    await page.goto('/diagnostico')

    // Etapa 1 — 7 campos exatos da spec §3.
    await page.fill('input[name="nome"]', 'Roberto Almeida')
    await page.fill('input[name="email"]', 'roberto.almeida@construsigma.com.br')
    await page.fill('input[name="empresa"]', 'ConstruSigma')
    await page.selectOption('select[name="cargo"]', 'ceo')
    await page.selectOption('select[name="setor"]', 'construcao')
    await page.selectOption('select[name="faturamento_faixa"]', '200k-500k')
    await page.selectOption('select[name="urgencia"]', '6-meses')
    await page.check('input[name="consentimento"]')
    await page.click('button[type="submit"]')

    // Etapa 2 — dispensa interlude inicial.
    await page.getByRole('button', { name: /Continuar/i }).click()

    const respostas: Array<'A' | 'B' | 'C' | 'D'> = [
      'B', 'A', 'B', 'A', 'B', 'C', 'A', 'D', 'B', 'D', 'A', 'A',
    ]
    for (const letra of respostas) {
      // Aceita botões com letra + texto. Spec garante 1 botão por opção.
      const opcao = page.locator(`button:has(span:text-is("${letra}"))`)
      await opcao.first().click()
      await page.getByRole('button', { name: /Próxima|Ver meu diagnóstico/ }).click()
      // Pode haver interlude entre pilares — dispensa se aparecer.
      const continuar = page.getByRole('button', { name: /Continuar/i })
      if (await continuar.isVisible({ timeout: 800 }).catch(() => false)) {
        await continuar.click()
      }
    }

    // Resultado (URL hash).
    await page.waitForURL(/\/diagnostico\/r\//, { timeout: 10_000 })
    await expect(page.getByText(/Olá, Roberto/)).toBeVisible()
    await expect(page.getByText('22', { exact: false })).toBeVisible()
    // Padrões esperados (testids do InsightCard).
    await expect(page.locator('[data-testid="insight-P4"]')).toBeVisible()
    await expect(page.locator('[data-testid="insight-P8"]')).toBeVisible()
    await expect(page.locator('[data-testid="insight-P2"]')).toBeVisible()
    // Caminhos esperados.
    await expect(page.locator('[data-testid="caminho-C3"]')).toBeVisible()
    await expect(page.locator('[data-testid="caminho-C4"]')).toBeVisible()
    await expect(page.locator('[data-testid="caminho-C2"]')).toBeVisible()
    // CTA Fit Médio.
    await expect(page.locator('[data-testid="cta-fit-medio"]')).toBeVisible()
  })

  test('hash inválido retorna 404', async ({ page }) => {
    const res = await page.goto('/diagnostico/r/nao-existe-12345')
    expect(res?.status()).toBe(404)
  })
})
