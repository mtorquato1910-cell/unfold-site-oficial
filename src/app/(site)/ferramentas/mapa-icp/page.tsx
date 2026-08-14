import type { Metadata } from 'next'
import CtaMapa from './_components/CtaMapa'
import RevealRoot from './_components/RevealRoot'
import styles from './mapa-icp.module.css'

export const metadata: Metadata = {
  title: 'Radar de Comitê de Compra',
  description:
    'Monte o ICP do seu negócio e o mapa de quem decide do outro lado: quem usa, quem aprova, quem paga e quem barra. Gratuito, em cerca de 4 minutos.',
  alternates: { canonical: '/ferramentas/mapa-icp' },
}

const Arrow = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <path
      d="M1 7h15M11 1l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function MapaIcpPage() {
  return (
    <RevealRoot revealInClass={styles.revealIn}>
      <div className={styles.root}>
        {/* HERO (nav/footer globais do site são reaproveitados — mesma regra da Calculadora) */}
        <header className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.reveal} ${styles.revealIn}`}>
                Radar de Comitê de Compra
              </span>
              <h1 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1}`}>
                Em venda complexa, você não vende para <em>uma pessoa</em>.
              </h1>
              <p className={`${styles.lead} ${styles.reveal} ${styles.revealIn} ${styles.delay2}`}>
                Monte o ICP estrutural do seu negócio e o mapa do comitê de compra — com o ângulo
                certo para falar com cada decisor.
              </p>
              <div className={`${styles.ctaRow} ${styles.reveal} ${styles.revealIn} ${styles.delay3}`}>
                <CtaMapa location="hero" className={styles.btn}>
                  Montar meu mapa
                  <Arrow />
                </CtaMapa>
                <span className={styles.ctaNote}>~4 min · gratuito · sem compromisso</span>
              </div>
            </div>

            <div
              className={`${styles.map} ${styles.reveal} ${styles.revealIn} ${styles.delay2}`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 400 400">
                {/* edges */}
                <path className={styles.edge} d="M200 200 L200 70" />
                <path className={styles.edge} d="M200 200 L330 140" />
                <path className={styles.edge} d="M200 200 L330 280" />
                <path className={styles.edge} d="M200 200 L200 340" />
                <path className={styles.edge} d="M200 200 L70 280" />
                <path className={`${styles.edge} ${styles.pulse}`} d="M200 200 L70 140" />
                {/* center */}
                <circle className={styles.center} cx="200" cy="200" r="34" />
                <text className={styles.centerLabel} x="200" y="204" textAnchor="middle">
                  DECISÃO
                </text>
                {/* nodes */}
                <g>
                  <rect className={styles.node} x="160" y="46" width="80" height="36" rx="3" />
                  <text className={styles.nodeLabel} x="200" y="69" textAnchor="middle">
                    CEO
                  </text>
                </g>
                <g>
                  <rect className={styles.node} x="288" y="120" width="84" height="36" rx="3" />
                  <text className={styles.nodeLabel} x="330" y="143" textAnchor="middle">
                    CFO
                  </text>
                </g>
                <g>
                  <rect className={styles.node} x="288" y="262" width="84" height="36" rx="3" />
                  <text className={styles.nodeLabel} x="330" y="285" textAnchor="middle">
                    CMO
                  </text>
                </g>
                <g>
                  <rect className={styles.node} x="158" y="322" width="84" height="36" rx="3" />
                  <text className={styles.nodeLabel} x="200" y="345" textAnchor="middle">
                    CRO
                  </text>
                </g>
                <g>
                  <rect className={styles.node} x="28" y="262" width="84" height="36" rx="3" />
                  <text className={styles.nodeLabel} x="70" y="285" textAnchor="middle">
                    TI / CIO
                  </text>
                </g>
                {/* veto node */}
                <g>
                  <rect className={styles.veto} x="22" y="120" width="96" height="44" rx="3" />
                  <text className={styles.nodeLabel} x="70" y="140" textAnchor="middle">
                    COMPRAS
                  </text>
                  <text className={styles.vetoTag} x="70" y="156" textAnchor="middle">
                    VETO
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </header>

        <div className={styles.divider} />

        {/* PROBLEM */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.reveal}`} data-reveal>
              <span className={styles.eyebrow}>O problema</span>
              <h2>Um ICP chapado não sustenta uma venda de comitê.</h2>
              <p>
                Quanto maior o ticket e o ciclo, mais gente decide — e cada uma quer uma coisa
                diferente. Tratar tudo como uma persona só é o que faz pipeline qualificado morrer
                no meio do caminho.
              </p>
            </div>
            <div className={`${styles.problem} ${styles.reveal} ${styles.delay1}`} data-reveal>
              <div className={styles.bad}>
                <span className={styles.tagBad}>Abordagem comum</span>
                <h3>Uma persona</h3>
                <p>
                  Uma descrição genérica de &quot;cliente ideal&quot;, uma mensagem só, esperando que ela
                  convença financeiro, marketing, comercial e TI ao mesmo tempo.
                </p>
              </div>
              <div className={styles.good}>
                <span className={styles.tagGood}>Abordagem Unfold</span>
                <h3>Um comitê</h3>
                <p>
                  ICP por fit estrutural, anti-ICP explícito e um mapa de quem decide — com o que
                  convence e o que trava cada decisor, incluindo quem tem poder de veto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className={`${styles.section} ${styles.sectionTight}`}>
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.reveal}`} data-reveal>
              <span className={styles.eyebrow}>O que você recebe</span>
              <h2>O mapa completo da sua conta-alvo.</h2>
            </div>
            <div className={styles.cards}>
              <div className={`${styles.card} ${styles.reveal}`} data-reveal>
                <div className={styles.cardIdx}>01</div>
                <h3>ICP estrutural</h3>
                <p>
                  Os atributos de fit que realmente preveem fechamento e permanência — definidos por
                  estrutura, não por segmento.
                </p>
              </div>
              <div className={`${styles.card} ${styles.reveal} ${styles.delay1}`} data-reveal>
                <div className={styles.cardIdx}>02</div>
                <h3>Anti-ICP</h3>
                <p>
                  Os sinais de desfit que indicam onde você não deveria gastar pipeline. Saber dizer
                  não é parte do método.
                </p>
              </div>
              <div className={`${styles.card} ${styles.reveal} ${styles.delay2}`} data-reveal>
                <div className={styles.cardIdx}>03</div>
                <h3>Mapa do comitê</h3>
                <p>
                  Para cada decisor: o que prioriza, o que o convence, o que o trava e o ângulo de
                  mensagem. Veto sinalizado.
                </p>
              </div>
              <div className={`${styles.card} ${styles.reveal} ${styles.delay3}`} data-reveal>
                <div className={styles.cardIdx}>04</div>
                <h3>Maturidade do ICP</h3>
                <p>
                  Uma leitura honesta de onde sua definição de cliente está hoje — e o que falta
                  para virar estrutura.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.reveal}`} data-reveal>
              <span className={styles.eyebrow}>Como funciona</span>
              <h2>Quatro minutos. Um mapa que você usa de verdade.</h2>
            </div>
            <div className={styles.steps}>
              <div className={`${styles.step} ${styles.reveal}`} data-reveal>
                <div className={styles.stepNum}>01</div>
                <h3>Você responde</h3>
                <p>
                  Perguntas estratégicas sobre seu negócio, seus melhores clientes e quem participa
                  da decisão de compra.
                </p>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles.delay1}`} data-reveal>
                <div className={styles.stepNum}>02</div>
                <h3>Nós estruturamos</h3>
                <p>
                  Suas respostas são organizadas na lógica de fit estrutural e comitê de compra —
                  sem achismo, sem dado inventado.
                </p>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles.delay2}`} data-reveal>
                <div className={styles.stepNum}>03</div>
                <h3>Você recebe o mapa</h3>
                <p>
                  ICP, anti-ICP, maturidade e o mapa do comitê com ângulo por decisor — na tela e em
                  PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        {/* DIFFERENTIATION */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.reveal}`} data-reveal>
              <span className={styles.eyebrow}>Por que é diferente</span>
              <h2>A lente certa para vendas complexas.</h2>
            </div>
            <div className={styles.diff}>
              <div className={`${styles.diffBlock} ${styles.reveal}`} data-reveal>
                <h3>Fit estrutural, não segmento</h3>
                <p>
                  Setor não define se um cliente é bom. O que define é estrutura: ticket, ciclo,
                  complexidade e como a empresa decide. É nisso que o mapa se apoia.
                </p>
              </div>
              <div className={`${styles.diffBlock} ${styles.reveal} ${styles.delay1}`} data-reveal>
                <h3>Comitê, não persona</h3>
                <p>
                  Em ticket alto e ciclo longo, a decisão é coletiva. Ferramentas genéricas devolvem
                  uma figura só. Aqui você sai com o mapa de quem realmente decide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className={`${styles.section} ${styles.sectionTight}`}>
          <div className={styles.wrap}>
            <div className={`${styles.secHead} ${styles.reveal}`} data-reveal>
              <span className={styles.eyebrow}>Para quem é</span>
              <h2>Feito para quem já vende — e quer vender com método.</h2>
            </div>
            <div className={styles.aud}>
              <div className={`${styles.audCol} ${styles.audIs} ${styles.reveal}`} data-reveal>
                <h3>Faz sentido se você</h3>
                <ul>
                  <li>Já tem clientes e quer transformar isso em ICP estruturado</li>
                  <li>Vende com ticket alto e ciclo longo</li>
                  <li>Lida com mais de um decisor por negócio</li>
                  <li>Sente que perde pipeline com conta errada</li>
                </ul>
              </div>
              <div
                className={`${styles.audCol} ${styles.audNot} ${styles.reveal} ${styles.delay1}`}
                data-reveal
              >
                <h3>Não é para você se</h3>
                <ul>
                  <li>Vende ticket baixo, ciclo curto, uma decisão só</li>
                  <li>Procura uma lista pronta de leads para comprar</li>
                  <li>Ainda não tem nenhuma operação comercial</li>
                  <li>Quer um quiz de marketing sem profundidade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={`${styles.section} ${styles.sectionTight}`}>
          <div className={styles.wrap}>
            <div className={`${styles.final} ${styles.reveal}`} data-reveal>
              <span className={`${styles.eyebrow} ${styles.finalEyebrow}`}>Comece agora</span>
              <h2>
                Seu ICP é uma <em>estrutura</em> ou um chute?
              </h2>
              <p>
                Monte o mapa em quatro minutos. Se quiser ir além e olhar o funil que atrai esse
                ICP, o próximo passo é o Diagnóstico de Growth.
              </p>
              <CtaMapa location="final" className={styles.btn}>
                Montar meu mapa
                <Arrow />
              </CtaMapa>
            </div>
          </div>
        </section>
      </div>
    </RevealRoot>
  )
}
