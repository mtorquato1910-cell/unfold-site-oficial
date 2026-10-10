# S06 — Schema Organization com @id fixo, logo válido e dados da empresa no site

**Origem:** Plano de Ação (crítica: "Completar o schema Organization… address, telephone, founder e sameAs") · Checklist M09 (Dados da empresa para o Google) · Decisão D5
**Prioridade:** 🔥 P1 · **Risco:** Baixo · **Executor:** @dev · **Revisão:** @qa
**Dependências:** dados do cliente (**P5**, **P8**). Bloqueia parcialmente S07 (`worksFor` usa o `@id` daqui) e S09.
**Status:** 🟢 Implementado com os dados disponíveis (2026-10-10). Faltam do cliente (P5): rua/CEP, fundadores, ano de fundação, demais redes. Quando chegarem, entram pelo painel (/painel/site-config) e pelo `COMPANY` em `src/lib/company.ts`, sem mudar estrutura

---

## Contexto

`src/components/SchemaOrg.tsx:3-22`: Organization com name, url, `logo: ${BASE_URL}/logo.svg` (**arquivo não existe** — `public/` tem `logo.jpeg`, `logo-unfold.jpeg`, `unfold-wordmark.png`), description, `sameAs` só com o LinkedIn, `contactPoint` só com e-mail. O mesmo logo inexistente é usado como `publisher.logo` no Article.

## Ficha da empresa (Checklist M09)

| Campo | Valor | Fonte |
|---|---|---|
| Nome | Unfold Growth | site |
| Tipo de schema | **Organization** (atendimento remoto/nacional) | D5 |
| Descrição curta | "Assessoria de growth de Maceió (AL) para empresas B2B de ciclo de venda longo e decisão complexa. Integramos marketing, vendas, CRM e automação em um só sistema." *(derivado do texto "Versão para o site"; validar com o cliente)* | Versão para o site |
| Cidade/UF | Maceió (AL) | Versão para o site |
| Área atendida | Brasil | Versão para o site |
| E-mail | gabriel@unfoldgrowth.com.br | Versão para o site |
| Telefone / WhatsApp | +55-82-99647-1621 | Versão para o site |
| Horário | Segunda a sexta, 09h–19h | Versão para o site |
| Associações (`memberOf`) | Assespro; Abradi Alagoas | Versão para o site |
| Parcerias (texto visível, não schema) | RD Station, Meta Business, Kommo | Versão para o site |
| Endereço (rua, nº, bairro, CEP) | ⏳ **P5** (ou só cidade/UF, se não quiserem expor) | — |
| Fundadores (nome + cargo) | ⏳ **P5** | — |
| Ano de fundação | ⏳ **P5** | — |
| Redes (`sameAs`) | LinkedIn `https://www.linkedin.com/company/unfoldgrowth` (já no código) + ⏳ Instagram, YouTube etc. **P5** | — |
| Logo oficial | ⏳ **P5** — fallback: `unfold-wordmark.png` se ≥112×112 e legível em fundo branco | — |

---

## Acceptance Criteria

### Fonte única dos dados
- [x] **AC6.1** Criar `src/lib/company.ts` com a ficha acima tipada (fonte única para schema, rodapé, contato e `llms.txt`). Nenhum dado da empresa duplicado em outro lugar do código.

### Schema
- [x] **AC6.2** Organization com `@id: "https://unfoldgrowth.com.br/#organization"` na home (e no layout, como hoje), contendo: name, url, logo (`ImageObject` com URL **que responde 200**, PNG/SVG ≥112×112), description, email, telephone, address (`PostalAddress` com addressLocality "Maceió", addressRegion "AL", addressCountry "BR" + rua/CEP quando P5 chegar), areaServed (`Country` Brasil), contactPoint (telefone + e-mail + `contactType: "sales"` + `availableLanguage: "pt-BR"` + horário), founder (Person[]) e foundingDate quando P5 chegar, memberOf (2 `Organization`), sameAs.
- [x] **AC6.3** WebSite com `@id: "https://unfoldgrowth.com.br/#website"` e `publisher: { "@id": ".../#organization" }`. (SearchAction é tratado na S08.)
- [x] **AC6.4** Article (`SchemaOrg.tsx:40-67`): `publisher: { "@id": ".../#organization" }` em vez do objeto com o logo quebrado.

### No site (Checklist M09: dados do schema = dados visíveis)
- [x] **AC6.5** Rodapé (`src/components/layout/Footer.tsx`): nome, cidade/UF (ou endereço completo), telefone clicável (`tel:+5582996471621`), WhatsApp, e-mail e links das redes oficiais **iguais ao `sameAs`**, como texto (não imagem). **P8:** se o cliente quiser, aplicar também os textos de "Versão para o site" nas páginas visíveis (Hero/Sobre/Atuação) — story separada se for o caso.
- [x] **AC6.6** Página `/contato`: endereço (ou cidade/UF), telefone clicável, WhatsApp, e-mail e **horário** (seg–sex, 9h–19h). Mapa incorporado só se houver endereço físico (P5).
- [ ] **AC6.7** Página `/sobre`: frases declarativas (o que é, para quem, onde atua, desde quando, quem são os sócios) — copy depende de P5/P8; o dev só garante os campos.

### Validação
- [ ] **AC6.8** Teste de Resultados Avançados + Schema Markup Validator na home sem erros; URL do logo responde 200.
- [x] **AC6.9** Lint, typecheck, testes e build verdes.

## Definition of Done
- Schema completo com os dados disponíveis em produção; pendências de P5 listadas no Change Log; dados idênticos em schema, rodapé e contato.

## Registro de implementação (2026-10-10)

- **Mudança de abordagem no AC6.1:** o rodapé já lia os dados da empresa de um **global editável no painel** (`site-settings`: e-mail, telefone, WhatsApp, endereço, CNPJ e redes). Em vez de criar uma segunda fonte, o schema passou a ler **o mesmo global**. Assim, schema, rodapé e /contato sempre batem (Checklist M09), e o que o cliente preencher depois no painel entra no schema sem deploy.
  - `src/lib/company.ts` guarda só o que não tem campo no painel: descrição, cidade/UF, área atendida, horário, `memberOf`, parceiros, logo, e fundadores/fundação (vazios até P5).
- **O global estava vazio no banco** (`site.site_settings` = 0 linhas), e o site usava padrões antigos: `tecnologia@`, sem telefone, sem redes. Os padrões passaram a ser os da "Versão para o site": **gabriel@unfoldgrowth.com.br**, **(82) 99647-1621** (telefone e WhatsApp) e o LinkedIn da empresa. O painel continua tendo prioridade.
- **Schema Organization:**
  - `@id` `https://unfoldgrowth.com.br/#organization`, com logo `ImageObject` em `/unfold-wordmark.png` (2064×453, existe; antes era `/logo.svg`, que dava 404).
  - Telefone `+55-82-99647-1621`, `PostalAddress` (Maceió/AL/BR; `streetAddress` só se o painel tiver endereço), `areaServed` Brasil.
  - `contactPoint` (sales, telefone, e-mail, seg–sex 09–19), `memberOf` Assespro e Abradi Alagoas, `sameAs` igual às redes do rodapé, `taxID` se houver CNPJ.
  - **Nada inventado:** campo vazio não entra.
- **WebSite:** `@id` `/#website`, `publisher` → `@id` da Organization. **SearchAction removido** (era o AC8.2 da S08).
- **Article:** `publisher` → `@id` da Organization, sem o logo quebrado.
- **Rodapé:** telefone clicável com "(telefone e WhatsApp)", "Falar no WhatsApp", endereço (se houver) e horário. O H3 da newsletter virou `<p>` (era o AC8.5a da S08).
- **/contato:** "Onde estamos" lê o global: e-mail, telefone (`tel:`), WhatsApp, endereço e horário. O e-mail fixo `tecnologia@` saiu. O `ConversaoContent` ganhou o bloco `links`.
- **AC6.7 (/sobre):** a copy depende de P5/P8 (decisão do cliente sobre usar o texto da "Versão para o site" nas páginas). Não alterado.
- **Fora do escopo, registrado:** o hotsite do Guia (`guia-eleicoes-2026`) e o fallback do resultado do diagnóstico ainda citam `tecnologia@unfoldgrowth.com.br`.

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido (aprovável).** tsc ✅ · vitest 263 ✅ · lint ✅. Propriedades do Organization conferidas contra a lista do Google; `hoursAvailable` é válido em ContactPoint; telefone `+55-82-…` aceito; nada inventado. O `OrganizationSchema` async segue o padrão do `Footer` (também async no mesmo global) e não força renderização dinâmica.

| Sev. | Achado | Tratamento |
|---|---|---|
| Média | `s?.telefone \|\| DEFAULT` impedia ocultar o campo: apagado no painel, o padrão voltava | ✅ padrões só valem enquanto o global **nunca foi salvo** (`updatedAt`); depois disso, campo vazio fica oculto |
| Baixa | `publisher` só com `@id` | ✅ `@id` + `name` + `logo` (Article e WebSite) |
| Baixa | `telHref`/`whatsappHref` confundiam DDD 55 (RS) com o +55 | ✅ mesma regra do formatador (12–13 dígitos); teste novo |
| Baixa | Placeholder do painel ainda `tecnologia@` | ✅ trocado |
| Baixa | `availableLanguage` "Portuguese" × AC "pt-BR" | ✅ AC alinhado (as duas formas são válidas) |
| Baixa | Logo é wordmark largo (4,5:1), e o Google mostra em quadrado | Pendente do cliente (P5): enviar ícone quadrado ≥112 px; o wordmark fica em `image` |
| Baixa | Redes no rodapé são ícones com `aria-label` (AC6.5 pedia texto) | Atendido em parte: os links são `<a href>` rastreáveis e a lista é a mesma do `sameAs` |

## File List
- `src/lib/company.ts` (novo): `COMPANY`, `buildOrganizationSchema`, helpers de telefone
- `src/lib/__tests__/company.test.ts` (novo, 5 testes)
- `src/lib/site-settings.ts`: padrões da "Versão para o site"
- `src/components/SchemaOrg.tsx`: Organization async com @id; WebSite com @id/publisher e sem SearchAction; Article com publisher @id
- `src/components/layout/Footer.tsx`: contato, horário; H3 → p
- `src/app/(site)/contato/page.tsx`: "Onde estamos" a partir do global
- `src/components/site/ConversaoContent.tsx`: bloco `links`
- `src/app/(painel)/painel/site-config/SiteConfigClient.tsx`: placeholder do e-mail
