"""
Gradi "Great Vibes HU" — Great Vibes sa presađenim velikim A.

ZAŠTO POSTOJI
-------------
Great Vibes crta veliko A kao obao trbuh sa stablom, što se čita kao uvećano
malo "a". Ćirilično А (U+0410) je u originalu SLOŽEN glif koji samo pokazuje na
latinično A — dakle isti obris — pa zamena unutar fonta ne pomaže: slovo mora
da dođe spolja.

Darodavac je Alex Brush (OFL, već ga nosimo): dvokrako A sa visokom petljom,
najbliže po debljini poteza i duhu Great Vibes-u od svega što imamo.

ŠTA SE SVE MENJA
----------------
1. `A` — osnovni obris.
2. `uni0410.alt` — kontekstualna varijanta koju Great Vibes crta na POČETKU
   reči (init/calt). Bez nje se izmena vidi svuda osim tamo gde ime počinje na
   A, dakle tačno tamo gde je bitna.
3. Znaci nad A (Ä, Á, Â, Ã, Ā, Å, Ă, Ą, i ćirilično uni0410) su složeni glifovi
   nad `A`. Obris nasleđuju sam, ali im je pomeraj znaka podešen za staru,
   užu širinu — zato se svakome pomera komponenta znaka za razliku središta
   starog i novog obrisa, i preračunava širina.

LICENCA
-------
Oba fonta su OFL 1.1. Great Vibes NEMA Reserved Font Name klauzulu (provereno u
ofl/greatvibes/OFL.txt u google/fonts), pa je izmena dozvoljena. Familija se
ipak preimenuje — vidi rename_family() za tehnički razlog.

POKRETANJE
----------
Traži fontTools sa brotli podrškom, koji NIJE deo npm zavisnosti projekta:

    python -m venv .venv-fonts
    .venv-fonts/Scripts/python -m pip install "fonttools[woff]"
    .venv-fonts/Scripts/python scripts/build-great-vibes-hu.py

Piše u public/fonts/invitation/ (jsPDF), src/app/pozivnica/[slug]/fonts/ (OG
slike) i src/app/fonts/ (web, preko next/font/local).
"""

import os
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public", "fonts", "invitation")
OG = os.path.join(ROOT, "src", "app", "pozivnica", "[slug]", "fonts")
WEB = os.path.join(ROOT, "src", "app", "fonts")

BASE = os.path.join(PUB, "GreatVibes-Regular.ttf")
DONOR = os.path.join(PUB, "AlexBrush-Regular.ttf")
FAMILY = "Great Vibes HU"
STEM = "GreatVibesHU-Regular"


def bounds(font, glyph_name):
    glyf = font["glyf"]
    g = glyf[glyph_name]
    g.recalcBounds(glyf)
    return g.xMin, g.yMin, g.xMax, g.yMax


def rename_family(font, family):
    """
    A patched copy must not keep the original family name. Both fontconfig and
    the browser key on it, so two files claiming "Great Vibes" resolve to
    whichever was seen first — which silently renders the unpatched original.
    This cost an hour of "why does nothing change" during development.
    """
    ps = family.replace(" ", "")
    name = font["name"]
    for rec in list(name.names):
        if rec.nameID in (1, 4, 16):
            name.setName(family, rec.nameID, rec.platformID, rec.platEncID, rec.langID)
        elif rec.nameID == 6:
            name.setName(
                ps + "-Regular", rec.nameID, rec.platformID, rec.platEncID, rec.langID
            )


def build():
    base = TTFont(BASE)
    donor = TTFont(DONOR)
    glyf = base["glyf"]

    base_cmap = base.getBestCmap()
    donor_a = donor.getBestCmap()[0x0041]

    old_x0, old_y0, old_x1, old_y1 = bounds(base, "A")
    old_centre = (old_x0 + old_x1) / 2

    d_x0, d_y0, _, d_y1 = bounds(donor, donor_a)
    # Scale on letter height rather than em square: the em differs between
    # families, but the eye compares how tall the letter looks.
    scale = (old_y1 - old_y0) / (d_y1 - d_y0)
    off_x = old_x0 - d_x0 * scale
    off_y = old_y0 - d_y0 * scale
    advance = int(round(donor["hmtx"][donor_a][0] * scale))

    donor_set = donor.getGlyphSet()

    def grafted():
        pen = TTGlyphPen(base.getGlyphSet())
        donor_set[donor_a].draw(TransformPen(pen, (scale, 0, 0, scale, off_x, off_y)))
        g = pen.glyph()
        g.recalcBounds(glyf)
        return g

    # 1 + 2 — the base outline and the word-initial contextual variant.
    replaced = []
    for name in ("A", "uni0410.alt"):
        if name in glyf:
            glyf[name] = g = grafted()
            base["hmtx"][name] = (advance, g.xMin)
            replaced.append(name)

    new_x0, _, new_x1, _ = bounds(base, "A")
    shift = int(round((new_x0 + new_x1) / 2 - old_centre))

    # 3 — every composite built on A: nudge the mark and refresh the advance.
    adjusted = []
    for name in glyf.keys():
        g = glyf[name]
        if not g.isComposite():
            continue
        if not any(c.glyphName == "A" for c in g.components):
            continue
        for c in g.components:
            if c.glyphName != "A":
                c.x += shift
        g.recalcBounds(glyf)
        base["hmtx"][name] = (advance, g.xMin)
        adjusted.append(name)

    rename_family(base, FAMILY)

    ttf = os.path.join(PUB, STEM + ".ttf")
    base.save(ttf)
    base.save(os.path.join(OG, STEM + ".ttf"))

    web = TTFont(ttf)
    web.flavor = "woff2"
    web.save(os.path.join(WEB, STEM + ".woff2"))

    check = TTFont(ttf)
    cmap = check.getBestCmap()
    missing = [c for c in "ЂЈЉЊЋЏђјљњћџ" if ord(c) not in cmap]

    print(f"familija        : {FAMILY}")
    print(f"skaliranje      : {scale:.4f}   nova sirina: {advance} (bila {base['hmtx']['A'][0] if False else 716})")
    print(f"zamenjeni obrisi: {replaced}")
    print(f"pomeraj znakova : {shift:+d} jedinica")
    print(f"slozeni nad A   : {', '.join(sorted(adjusted))}")
    print(f"srpska slova    : {'sva prisutna' if not missing else 'FALE ' + ''.join(missing)}")
    print(f"-> {ttf}")
    print(f"-> {os.path.join(OG, STEM + '.ttf')}")
    print(f"-> {os.path.join(WEB, STEM + '.woff2')}")


if __name__ == "__main__":
    build()
