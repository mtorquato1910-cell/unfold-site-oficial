"""Gera a imagem Open Graph (1200x630) provisória do hotsite. Substituir pela versão final do design (D-05)."""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "guia" / "og-guia-eleicoes.png"

HTML = """
<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  * { margin:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#001E29; color:#E7E7E7;
         font-family:'Space Grotesk',sans-serif; padding:72px; display:flex; flex-direction:column; justify-content:space-between; }
  .tag { font-family:'JetBrains Mono',monospace; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#6DF9C6; }
  h1 { font-size:68px; font-weight:700; line-height:1.05; max-width:1000px; letter-spacing:-0.02em; }
  .sub { color:#6DF9C6; font-size:26px; margin-top:20px; }
  .marcas { display:flex; align-items:center; gap:20px; font-size:30px; font-weight:700; }
  .divisor { width:1px; height:32px; background:rgba(109,249,198,0.5); }
  .dot { width:14px; height:14px; border-radius:50%; background:#00E649; display:inline-block; margin-right:8px; }
</style></head>
<body>
  <div>
    <div class="tag">Guia Executivo · 2026</div>
  </div>
  <div>
    <h1>Guia de Anúncios Digitais para as Eleições de 2026</h1>
    <div class="sub">Regras do TSE, plataformas, IA, LGPD e prestação de contas.</div>
  </div>
  <div class="marcas">
    <span>UNFOLD</span>
    <span class="divisor"></span>
    <span><span class="dot"></span>Feat.Work</span>
  </div>
</body></html>
"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.set_content(HTML, wait_until="networkidle")
    pg.wait_for_timeout(1500)
    pg.screenshot(path=str(OUT))
    b.close()
print(f"OG gerada: {OUT} ({OUT.stat().st_size/1024:.0f} KB)")
