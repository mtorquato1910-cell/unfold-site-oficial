"""Gera as imagens Open Graph do site (1200x630) — S04 do épico seo-tecnico-2026-10.

- public/og/default.png: og:image da home e fallback de páginas sem imagem própria
  (texto do posicionamento, "Versão para o site" de 10/10/2026).
- public/og/mapa-icp.png: ferramenta Radar de Comitê de Compra (o arquivo era
  referenciado desde jun/2026, mas não existia → 404 no compartilhamento).
Rodar: python scripts/gen-og-default.py
"""
import base64
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
WORDMARK = base64.b64encode((ROOT / "public" / "unfold-wordmark.png").read_bytes()).decode()

TEMPLATE = """
<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  * {{ margin:0; box-sizing:border-box; }}
  body {{ width:1200px; height:630px; background:#001E29; color:#E7E7E7; font-family:'Space Grotesk',sans-serif;
         padding:72px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; }}
  .glow {{ position:absolute; inset:0; background:radial-gradient(ellipse at 85% 10%, rgba(109,249,198,0.18), transparent 55%); }}
  .badge {{ position:relative; background:#F7F9FB; border-radius:18px; padding:18px 26px; display:inline-flex; width:fit-content; }}
  .badge img {{ height:46px; }}
  .tag {{ font-family:'IBM Plex Mono',monospace; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#6DF9C6; margin-bottom:22px; }}
  h1 {{ position:relative; font-size:76px; font-weight:700; line-height:1.02; letter-spacing:-0.02em; max-width:980px; }}
  h1 span {{ color:#6DF9C6; }}
  .sub {{ position:relative; font-size:27px; line-height:1.35; color:rgba(231,231,231,0.82); max-width:900px; margin-top:22px; }}
  .foot {{ position:relative; font-family:'IBM Plex Mono',monospace; font-size:18px; color:rgba(231,231,231,0.7); letter-spacing:1px; }}
</style></head>
<body>
  <div class="glow"></div>
  <div class="badge"><img src="data:image/png;base64,{wordmark}" alt=""></div>
  <div>
    <div class="tag">{tag}</div>
    <h1>{title}</h1>
    <div class="sub">{sub}</div>
  </div>
  <div class="foot">unfoldgrowth.com.br</div>
</body></html>
"""

IMAGES = [
    ("default.png", "Assessoria de Growth · Método UGS", "Growth para vendas <span>complexas B2B</span>",
     "Marketing, vendas, CRM e automação em um só sistema, com resultado comercial que você consegue medir."),
    ("mapa-icp.png", "Ferramenta gratuita · Radar de Comitê de Compra", "Quem decide <span>do outro lado</span>?",
     "Monte o ICP e o mapa do comitê de compra: quem usa, quem aprova, quem paga e quem barra. Em cerca de 4 minutos."),
]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    for name, tag, title, sub in IMAGES:
        out = ROOT / "public" / "og" / name
        pg.set_content(TEMPLATE.format(wordmark=WORDMARK, tag=tag, title=title, sub=sub), wait_until="networkidle")
        pg.wait_for_timeout(1200)
        pg.screenshot(path=str(out))
        print(f"OG gerada: {out.name} ({out.stat().st_size/1024:.0f} KB)")
    b.close()
