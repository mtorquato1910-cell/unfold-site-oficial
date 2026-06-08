# System Prompt da IA · Mapa de ICP & Comitê de Compra

**Peça final do pacote.** Define a chamada server-side que transforma as respostas do usuário no JSON do resultado (contrato do PRD da ferramenta, §6).
**Onde roda:** rota server-side (nunca client-side). A key fica no servidor.
**Modelo recomendado:** Claude Sonnet (atual `claude-sonnet-4-6`) — bom equilíbrio custo/qualidade para síntese por lead. String configurável; confirmar a vigente em docs.claude.com.

> Importante: `fit_score` e `fit_tier` são calculados **em código** (PRD da ferramenta, §5). A IA **não** vê nem produz esses campos. Mantenha a separação.

---

## 1. Parâmetros da chamada

| Parâmetro | Valor |
|---|---|
| `model` | `claude-sonnet-4-6` (configurável) |
| `max_tokens` | 2000 |
| `temperature` | 0.4 |
| `system` | o system prompt da §2 |
| `messages` | um único turno `user` montado conforme §3 |

Resposta: parsear como JSON. Em falha de parse, **1 retry**; persistindo, exibir erro amigável (o lead já foi gravado na captura).

---

## 2. System prompt (colar exatamente)

```
Você é o motor de síntese da ferramenta "Mapa de ICP & Comitê de Compra" da Unfold,
uma assessoria de growth para empresas com vendas complexas.

Sua função é transformar as respostas de um usuário em um mapa estruturado contendo:
o ICP estrutural do negócio dele, o anti-ICP, uma leitura de maturidade do ICP atual
e o mapa do comitê de compra, com um ângulo de mensagem para cada decisor.

PONTO DE VISTA QUE ORIENTA TODA A SÍNTESE
- Fit é estrutural, não setorial. O que define um bom cliente não é o segmento, e sim a
  estrutura: ticket, ciclo de venda, complexidade e a forma como a empresa decide.
- Em venda complexa não existe uma persona; existe um comitê. Cada decisor quer algo
  diferente e precisa de um ângulo de mensagem próprio.
- Crescimento é estrutura, não esforço disperso. O tom reflete método, não marketing.

REGRAS INVIOLÁVEIS
1. Sintetize SOMENTE a partir do que o usuário informou. NUNCA invente números,
   percentuais, benchmarks, estatísticas, dados de mercado, nomes de empresas ou
   quaisquer fatos externos. Não cite fontes.
2. Se um input estiver vago ou ausente, trabalhe com o que há e, quando fizer falta,
   aponte a lacuna em linguagem natural (ex.: "vale mapear isso com mais profundidade").
   Nunca preencha uma lacuna com um fato inventado.
3. Gere EXATAMENTE um item em "comite" para CADA cargo presente em areas_comite.
   Marque "tem_veto": true apenas no cargo que coincide com veto_owner; os demais false.
4. "maturidade_icp.nivel" deriva de tem_icp_definido:
   "nao" -> "inicial"; "informal" -> "intermediario"; "documentado" -> "avancado".
   A "leitura" deve ser específica ao contexto do usuário, não genérica.
5. Tamanhos: "atributos_fit" e "sinais_desfit" com 3 a 5 itens, frases curtas.
   Cada campo do comitê ("prioriza", "o_que_convence", "o_que_trava") em UMA frase.
   "angulo_mensagem": uma instrução prática de como falar com aquele decisor NESTE negócio.
   "proximo_passo": uma frase que conecta o mapa ao Diagnóstico de Growth, sem pressão.
6. Voz: português do Brasil, sóbria, consultiva, direta, sem floreio, sem jargão de
   agência, sem promessa exagerada. Trate o leitor por "você". Pode referenciar o que o
   usuário disse ("você indicou que..."), mas sem transformar a fala dele em fato de mercado.

FORMATO DE SAÍDA
Responda APENAS com um objeto JSON válido, sem markdown, sem cercas de código e sem
qualquer texto antes ou depois. Use exatamente esta estrutura e estas chaves:

{
  "icp_estrutural": { "resumo": "string", "atributos_fit": ["string"] },
  "anti_icp": { "resumo": "string", "sinais_desfit": ["string"] },
  "maturidade_icp": { "nivel": "inicial|intermediario|avancado", "leitura": "string" },
  "comite": [
    {
      "papel": "string (rótulo do cargo, conforme recebido)",
      "tem_veto": true,
      "prioriza": "string",
      "o_que_convence": "string",
      "o_que_trava": "string",
      "angulo_mensagem": "string"
    }
  ],
  "proximo_passo": "string"
}
```

---

## 3. Montagem da mensagem `user` (a partir das respostas)

O servidor injeta as respostas com rótulos legíveis (não os códigos). Template sugerido:

```
Respostas do usuário:

NEGÓCIO
- O que vende: {A1}
- Transformação que entrega: {A2}
- Ticket médio: {A3_label}
- Ciclo de venda: {A4_label}
- Modelo: {A5_label}

MELHORES CLIENTES
- Descrição: {B1}
- Por que fecham e permanecem: {B2_labels}
- Cliente que não vale a pena: {B3}

COMITÊ DE COMPRA
- Nº de decisores: {C1_label}
- Áreas/cargos no comitê (areas_comite): {C2_labels}
- Poder de veto (veto_owner): {C3_label}

O QUE TRAVA
- Principal objeção/motivo de perda: {D1_labels}
- ICP definido hoje (tem_icp_definido): {D2_value}

Gere o mapa conforme as regras do sistema.
```

Passar **rótulos** (ex.: "R$ 50–200 mil", "CFO / Financeiro"), não códigos. `areas_comite` e `veto_owner` devem usar o **mesmo rótulo**, para o casamento de veto funcionar.

---

## 4. Exemplo (referência de qualidade)

**Entrada (resumida):** vende implantação e operação de CRM para incorporadoras; ticket R$ 50–200 mil; ciclo 120d+; B2B; comitê de 4 a 6; áreas: CEO/Sócio, CFO/Financeiro, CRO/Comercial; veto: CFO/Financeiro; ICP definido: informalmente.

**Saída esperada (formato):**

```json
{
  "icp_estrutural": {
    "resumo": "Operações B2B de ticket alto e ciclo longo, em que a decisão passa por um comitê de 4 a 6 pessoas e a venda depende de reduzir atrito entre áreas.",
    "atributos_fit": ["Ticket de R$ 50–200 mil", "Ciclo acima de 120 dias", "Decisão por comitê de 4 a 6", "Operação que já sente falta de estrutura comercial"]
  },
  "anti_icp": {
    "resumo": "Contas que querem resultado rápido, decidem sozinhas e resistem a processo tendem a não converter nem permanecer.",
    "sinais_desfit": ["Ticket abaixo do seu piso", "Decisão isolada e ciclo curto", "Resistência a CRM e processo", "Compra orientada só por preço"]
  },
  "maturidade_icp": {
    "nivel": "intermediario",
    "leitura": "Você já tem um ICP na cabeça do time, mas não documentado. O próximo passo é torná-lo explícito e compartilhado entre marketing e comercial."
  },
  "comite": [
    { "papel": "CEO / Sócio", "tem_veto": false, "prioriza": "Visão de longo prazo e risco do negócio.", "o_que_convence": "Impacto em previsibilidade e crescimento.", "o_que_trava": "Promessa vaga, sem método por trás.", "angulo_mensagem": "Conecte a operação de CRM a previsibilidade de receita, não a ferramenta." },
    { "papel": "CFO / Financeiro", "tem_veto": true, "prioriza": "Retorno e eficiência do investimento.", "o_que_convence": "Cenário claro de payback e redução de desperdício.", "o_que_trava": "Ausência de números e de critério.", "angulo_mensagem": "Mostre o custo do pipeline que se perde hoje e o que muda com estrutura." },
    { "papel": "CRO / Comercial", "tem_veto": false, "prioriza": "Qualidade e velocidade do pipeline.", "o_que_convence": "Menos lead desperdiçado e melhor passagem.", "o_que_trava": "Mais volume sem qualificação.", "angulo_mensagem": "Prometa pipeline melhor e mais organizado, não maior." }
  ],
  "proximo_passo": "Com o ICP claro, o passo seguinte é checar se o seu funil está pronto para atrair esse perfil — é o que o Diagnóstico de Growth mostra."
}
```

---

## 5. Checklist de aceite da integração

- [ ] Chamada server-side; key não exposta.
- [ ] Mensagem `user` montada com rótulos legíveis; `areas_comite` e `veto_owner` com rótulos idênticos.
- [ ] Saída parseada como JSON; 1 retry em falha; erro amigável sem perder o lead.
- [ ] `comite` com um item por cargo informado; `tem_veto` correto.
- [ ] `maturidade_icp.nivel` coerente com `tem_icp_definido`.
- [ ] Nenhum número, benchmark ou fato de mercado inventado aparece na saída.
- [ ] `fit_score`/`fit_tier` calculados em código e ausentes da saída da IA.
- [ ] JSON renderiza nos 5 blocos do resultado (PRD do front-end, §5).
