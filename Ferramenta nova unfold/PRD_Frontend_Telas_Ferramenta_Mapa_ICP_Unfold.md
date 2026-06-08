# PRD — Front-end das Telas da Ferramenta · Mapa de ICP & Comitê de Compra

**Adendo ao** *PRD_Mapa_ICP_Comite_de_Compra* (este documento cobre só o **front-end das telas internas**).
**Referência:** `proto_ferramenta_mapa_icp_unfold.html` — protótipo interativo completo, funcional, pronto para portar.
**Stack-alvo:** Next.js + Vercel (mesmo projeto da LP).

---

## 0. O que este documento é e não é

| | |
|---|---|
| **É** | UI/UX das telas: fluxo de perguntas, captura, processamento e resultado. Estados, componentes, validação, contrato de renderização do resultado, o que é mock × real, analytics, aceite. |
| **Não é** | A lógica de negócio. Scoring de fit, prompt e chamada de IA, JSON de saída, integração com RD Station e automações → **já estão no PRD da ferramenta.** Não duplicar. |

O protótipo entregue **percorre o fluxo de verdade** (perguntas → captura → loading → resultado de amostra). Toda a lógica server-side (scoring, IA, CRM) está **simulada** — ver §5.

---

## 1. Mapa de telas

```
LP (/ferramentas/mapa-icp)
        │  CTA "Montar meu mapa"
        ▼
[1] Fluxo de perguntas — 13 telas, 1 pergunta por tela
        ▼
[2] Captura (gate) — gera o lead
        ▼
[3] Processamento — loading (POST server-side: scoring + IA + RD)
        ▼
[4] Resultado — ICP · anti-ICP · maturidade · mapa do comitê · próximo passo
```

Rotas internas (`/montar`, steps) devem ser `noindex` (a LP é a única página indexável).

---

## 2. Tela de pergunta — comportamento

- **Uma pergunta por tela**, barra de progresso no topo, contador "Etapa X / N".
- Tipos de campo (já no array `STEPS` do protótipo, que serve de **schema**): `text`, `textarea`, `single`, `multi`, `capture`.
- **Seleção:** `single` = radio (uma opção); `multi` = checkbox (várias). Estado selecionado em mint.
- **Navegação:** "Voltar" preserva respostas já dadas; "Continuar" valida antes de avançar. Enter avança nos campos de texto.
- **Validação:** campos `required` bloqueiam avanço com mensagem de erro inline. Texto = não-vazio; single = uma opção; multi = ≥1 opção.
- **Persistência de estado:** respostas guardadas em memória durante a sessão (no protótipo, objeto `state.answers`). No app, manter em estado de cliente; opcionalmente persistir em `sessionStorage` para resistir a refresh (decisão do dev). **Não usar** dados além do necessário.
- **Acessibilidade:** foco automático no input ao trocar de tela; opções navegáveis por teclado; `aria` apropriado para grupos de rádio/checkbox.

**Observação de implementação:** no protótipo, a opção "outro" foi omitida dos `multi` para simplicidade. No app, "outro" deve revelar um campo de texto curto (B2, C2, D1).

---

## 3. Tela de captura (gate)

- Vem **depois** das 13 perguntas e **antes** do resultado (decisão sancionada no PRD da ferramenta).
- Campos: Nome, E-mail corporativo, Empresa, Cargo (obrigatórios); Telefone (opcional); checkbox de **consentimento LGPD** com link para a Política de Privacidade (obrigatório).
- Validação de e-mail (formato) no cliente.
- Ao enviar: dispara o POST server-side que (a) calcula o fit, (b) chama a IA, (c) grava no RD Station — tudo conforme o PRD da ferramenta. A UI mostra o **processamento** enquanto isso ocorre.

---

## 4. Tela de processamento

- Estado de loading com spinner e **microcopy rotativa** (ex.: "Organizando suas respostas…", "Mapeando o comitê de compra…").
- O lead **já foi gravado** na captura — se a IA falhar, exibir erro amigável com retry, sem perder o lead (ver aceite).
- Meta de tempo: resultado em < 15s.

---

## 5. Tela de resultado — contrato de renderização

O resultado é renderizado a partir do **JSON da IA** definido no PRD da ferramenta:

```json
{ "icp_estrutural":{...}, "anti_icp":{...}, "maturidade_icp":{...},
  "comite":[{"papel","tem_veto","prioriza","o_que_convence","o_que_trava","angulo_mensagem"}],
  "proximo_passo":"" }
```

Blocos a renderizar, na ordem:
1. **ICP estrutural** — resumo + chips de atributos de fit.
2. **Anti-ICP** — resumo + chips de sinais de desfit.
3. **Maturidade** — nível (badge) + leitura.
4. **Mapa do comitê** — **SVG radial** (um nó por `papel`, nó com `tem_veto` destacado em mint) + **um cartão por decisor** (prioriza / convence / trava / veto / ângulo de mensagem).
5. **Próximo passo** — bloco destacado com CTA para `/diagnostico` + opção "Receber em PDF".

**Mock × real no protótipo:**
- O protótipo **monta o resultado a partir das respostas reais do usuário** (o mapa do comitê reflete os papéis escolhidos em C2 e o veto de C3, a maturidade vem de D2). Isso demonstra o contrato de renderização.
- Porém o **conteúdo textual por decisor é fixo** (dicionário `ROLE_DATA`), não gerado por IA. No app, esse texto vem do JSON da IA. O protótipo sinaliza isso com a faixa "Resultado de amostra".
- O **SVG radial** calcula posições por nº de papéis — reaproveitar a função `committeeSVG`.

---

## 6. Identidade visual

Mesmos tokens da LP (não repetir aqui — ver *PRD_Implementacao_LP*): navy `#001E29`, mint `#6DF9C6`, Host Grotesk (display) / Inter (corpo) / JetBrains Mono (labels). O motivo do **mapa de comitê** conecta visualmente a ferramenta à LP — manter.

---

## 7. Analytics (eventos desta etapa)

| Evento | Disparo |
|---|---|
| `tool_start` | entrada na primeira pergunta |
| `step_complete` | avanço de cada pergunta (com `step_id`) |
| `step_abandon` | saída sem concluir (best-effort) |
| `lead_capture` | envio da captura |
| `result_view` | renderização do resultado |
| `cta_diagnostico_click` | clique no CTA do Diagnóstico |
| `pdf_download` | clique em "Receber em PDF" |

Funil de abandono por etapa é métrica-chave de UX. UTMs vindas da LP devem acompanhar até o `lead_capture`.

---

## 8. Critérios de aceite

- [ ] Fluxo completo navegável: 13 perguntas → captura → loading → resultado.
- [ ] Uma pergunta por tela, progresso e contador corretos, Voltar preserva respostas.
- [ ] Validação bloqueia avanço em campos obrigatórios, com erro inline.
- [ ] "outro" abre campo de texto em B2/C2/D1 (no app).
- [ ] Captura grava o lead **antes** do processamento; falha de IA não perde o lead (retry).
- [ ] Resultado renderiza os 5 blocos a partir do JSON da IA (§5).
- [ ] Mapa do comitê: um nó por papel, veto destacado; um cartão por decisor com os 5 campos.
- [ ] CTA do resultado leva a `/diagnostico`; "Receber em PDF" funcional.
- [ ] Telas internas `noindex`.
- [ ] Eventos da §7 disparando; UTMs preservadas até a captura.
- [ ] Mobile-first íntegro (320px+); contraste AA; teclado; `prefers-reduced-motion` respeitado.
- [ ] Tempo até resultado < 15s, com estado de loading.

---

## 9. Pendências para o Gabriel decidir

- [ ] Persistência em `sessionStorage` (resistir a refresh) — sim/não.
- [ ] "Receber em PDF": gera PDF na hora ou só envia por e-mail (já previsto na automação do PRD da ferramenta)?
- [ ] Texto definitivo do dicionário de comitê é responsabilidade da **IA** (prompt) — confirmar que o system prompt da IA será o próximo entregável.
