# S07 — Redação e preenchimento (Ferraz)

**Itens do doc:** 1.4 (FAQ), 1.5 (títulos/resumos), 1.6 (alts), 1.7 (páginas curtas)
**Prioridade:** acompanha a prioridade de cada item · **Responsável:** Ferraz (redação)
**Dependências de inserção:** os campos precisam existir no painel — S02 (resumo de busca), S03 (alt na imagem), S04 (FAQ). Nenhum item depende do código para ser **produzido**; só para ser **inserido**.
**Estimativa:** trabalho de redação, paralelo ao código

---

## Contexto

Tudo aqui é conteúdo do Ferraz. O código entrega os campos e as ferramentas (S02–S04); o Ferraz produz e insere. Registrado como story para rastrear a parte de redação do épico.

---

## Acceptance Criteria

### 1.5 — Títulos e resumos de busca
- [ ] **AC1** Reescrever **42 títulos de busca** para caber em 60 caracteres, com a palavra principal no começo.
- [ ] **AC2** Escrever **36 resumos de busca** dentro de 155 caracteres (campo próprio de S02, separado do resumo do card).
- [ ] **AC3** Ampliar os **2 títulos** e **2 resumos** curtos demais (aproveitar espaço).
- [ ] **AC4** Encurtar **14 títulos principais (H1)** que passam de 70 caracteres.
- [ ] **AC5** Encurtar **2 títulos de seção (H2)** acima do limite.

### 1.4 — FAQ por artigo (regras de escrita para IA)
- [ ] **AC6** Escrever **3–8 perguntas** por artigo seguindo as regras do doc: pergunta como a pessoa perguntaria; resposta completa nas 40 primeiras palavras; sem "como vimos acima"; uma resposta por pergunta; sem linguagem de venda; perguntas diferentes em cada artigo; "Unfold Growth" 1× natural; números com fonte/período; frases curtas.
- [ ] **AC7** Aplicar as mesmas regras ao **corpo do artigo** (resposta direta nas primeiras 40–60 palavras da seção; título de seção como pergunta/conceito; sem referência ao que veio antes; tabela/lista em HTML real; autor nomeado e data visível).

### 1.6 — Descrições de imagem (alt)
- [ ] **AC8** Preencher as **69 descrições** faltantes — uma frase curta do que a imagem mostra, sem repetir o título do artigo (ex.: "Diagrama comparando funil, pipeline e jornada de compra", não "Funil de vendas Unfold Growth").
- [ ] **AC9** Encurtar **1 descrição** acima de 100 caracteres.

### 1.7 — Páginas com pouco conteúdo
- [ ] **AC10** Ampliar para 200–400 palavras cada: `/diagnostico`, `/ferramentas`, `/ferramentas/calculadora-trafego`, `/contato` — cobrindo: o que faz, para quem, o que a pessoa recebe, quanto tempo leva.
- [ ] **AC11** `/blog/contribuir` → marcado como `noindex` (tarefa do Torquato, S01/AC1.8c) — não ampliar.
- [ ] **AC12** `/lgpd`, `/termos`, `/politica-de-privacidade` → ignorar (página legal é curta mesmo).

---

## Definition of Done

- [ ] Nenhum título de busca >60 nem resumo de busca >155.
- [ ] Todo artigo publicado tem seção FAQ com 3–8 perguntas nas regras de IA.
- [ ] Nenhuma imagem de conteúdo sem alt.
- [ ] As 4 páginas de conversão com 200–400 palavras.

---

## Dependências de campo (quando cada item destrava)

| Item Ferraz | Destrava quando |
|-------------|-----------------|
| Resumos de busca (AC2) | S02 entrega o campo `resumo_busca` |
| Alts (AC8/AC9) | S03 entrega o alt obrigatório na imagem (e S01 torna o campo obrigatório) |
| FAQ (AC6) | S04 entrega o campo de FAQ |
| Títulos/H1/H2 (AC1,4,5) | Podem ser produzidos já; inserção de H1/H2 melhor após S02/S03 |
| Páginas de conversão (AC10) | Independem de código |

---

*— SM · 2026-08-07*
