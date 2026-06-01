"""
Gera o PDF estático do guia a partir do HTML diagramado original (que já tem
@media print + @page A4). Rodar LOCALMENTE (nunca no build da Vercel) e commitar
o resultado em public/static/. Trocar o PDF final do design = só substituir o asset.
"""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "Eleições" / "guia_eleicoes_2026_diagramado (1).html").as_uri()
OUT = ROOT / "public" / "static" / "Guia-Eleicoes-2026-Unfold-FeatWork.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(SRC, wait_until="networkidle")
    page.wait_for_timeout(2500)  # garante carregamento das Google Fonts
    page.emulate_media(media="print")
    page.pdf(
        path=str(OUT),
        format="A4",
        print_background=True,
        margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        prefer_css_page_size=True,
    )
    browser.close()

size_kb = OUT.stat().st_size / 1024
print(f"PDF gerado: {OUT}  ({size_kb:.0f} KB)")
