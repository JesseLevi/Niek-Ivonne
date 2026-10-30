"""Zet de ChatGPT-illustraties om naar de beelden in public/images/.

Vrijstellen (rembg, model isnet-general-use), bijsnijden, schalen en exporteren als
WebP met transparantie. Het vliegtuigraam wordt opgesplitst in lagen die precies op
elkaar passen: kozijn (glas uitgesneden), glasmasker, rolluik en drie uitzichten.

Vereist: pip install "rembg[cpu]" pillow numpy
Gebruik: python scripts/process-illustrations.py <map-met-originele-png's>

De bestandsnamen hieronder zijn die van de originele export (Images.zip).
"""

import math
import sys
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove

SRC = Path(sys.argv[1])
# Optioneel: alleen deze uitvoerbestanden schrijven, bijv. 11-amsterdam.webp
ONLY = set(sys.argv[2:])
OUT = Path(__file__).resolve().parent.parent / 'public' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
session = new_session('isnet-general-use')


def source(name: str) -> Path:
    """Bestandsnaam ongeacht Unicode-normalisatie (macOS-zips schrijven é als e + accent)."""
    want = unicodedata.normalize('NFC', name)
    for path in SRC.iterdir():
        if unicodedata.normalize('NFC', path.name) == want:
            return path
    raise FileNotFoundError(SRC / name)


def cut(name: str, floor: int = 20) -> Image.Image:
    """Vrijstellen. Kleuren blijven die van het origineel (rembg maakt transparante pixels zwart),
    zodat later gevulde gaten hun echte kleur houden; alfa onder `floor` wordt 0."""
    original = Image.open(source(name)).convert('RGB')
    alpha = remove(original, session=session).getchannel('A').point(lambda a: 0 if a < floor else a)
    out = original.convert('RGBA')
    out.putalpha(alpha)
    return out


def fill_holes(im: Image.Image) -> Image.Image:
    """Maakt ingesloten transparante gaten (uitzicht door een raam, telefoonscherm) weer dekkend."""
    alpha = im.getchannel('A')
    mask = alpha.point(lambda a: 255 if a >= 128 else 0)
    w, h = mask.size
    # Alles wat vanaf de rand bereikbaar is, is echte achtergrond.
    padded = Image.new('L', (w + 2, h + 2), 0)
    padded.paste(mask, (1, 1))
    ImageDraw.floodfill(padded, (0, 0), 128)
    outside = np.asarray(padded.crop((1, 1, w + 1, h + 1))) == 128
    a = np.asarray(alpha).copy()
    a[~outside] = 255
    out = im.copy()
    out.putalpha(Image.fromarray(a))
    return out


def trim(im: Image.Image, pad: float = 0.02) -> Image.Image:
    box = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    w, h = im.size
    p = int(max(w, h) * pad)
    return im.crop((max(box[0] - p, 0), max(box[1] - p, 0), min(box[2] + p, w), min(box[3] + p, h)))


def save(im: Image.Image, name: str, max_width: int = 1200, quality: int = 80) -> None:
    if ONLY and name not in ONLY:
        return
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    path = OUT / name
    if name.endswith('.png'):
        im.save(path, optimize=True)
    else:
        im.save(path, 'WEBP', quality=quality, method=6)
    print(f'{name:32s} {im.width}×{im.height}  {path.stat().st_size // 1024} KB')


# Losse objecten en plekken (naam: bron, maximale breedte, eventueel alfa-ondergrens) ---
# Bij de polder valt zo de half doorzichtige lucht weg; de scènekleur is daar de lucht.

simple = {
    '04-wereldkaart.webp': ('Minimalist Ivory World Map Relief.png', 1400),
    '06-nederland.webp': ('Dutch Polder Diorama at Golden Hour.png', 1200, 110),
    '07-barcelona-gevel.webp': ('Ornate Mediterranean Facade with Balconies.png', 1000),
    '08-deurbel.webp': ('Vintage Brass Intercom Panel.png', 900),
    '10-koffer.webp': ('Vintage Sage Green Ribbed Suitcase.png', 900),
    '13-mas-terrats.webp': ('Mediterranean Stone Farmhouse Diorama-1.png', 1000),
    '13-mas-terrats-wijd.webp': ('Mediterranean Stone Farmhouse Diorama.png', 1400),
}
for out_name, (src_name, width, *floor) in simple.items():
    save(trim(cut(src_name, *floor)), out_name, width)

# Amsterdam: rembg ziet de lichte ruiten als achtergrond. Alle ramen weer dicht, behalve de
# twee boven MARHABA: die blijven open, zodat de site er licht achter kan laten branden.
house = trim(cut('Marhaba Café at Dusk.png'))
filled = fill_holes(house)
alpha = np.asarray(filled.getchannel('A')).copy()
original = np.asarray(house.getchannel('A'))
for x0, y0, x1, y1 in ((0.325, 0.54, 0.43, 0.65), (0.486, 0.54, 0.608, 0.65)):  # % van het bijgesneden beeld
    ys, xs = slice(int(y0 * house.height), int(y1 * house.height)), slice(int(x0 * house.width), int(x1 * house.width))
    alpha[ys, xs] = original[ys, xs]
filled.putalpha(Image.fromarray(alpha))
save(filled, '11-amsterdam.webp', 1000)

# Lima: het uitzicht door het balkonraam hoort bij het beeld.
save(trim(fill_holes(cut('Sunlit Coastal Balcony View.png'))), '05-lima.webp', 1000)

# Telefoon: scherm dicht en rechtop gezet, zodat de chat er recht overheen kan.
phone = fill_holes(cut('Minimal Ivory Smartphone Mockup.png'))
ys, xs = np.nonzero(np.asarray(phone.getchannel('A')) > 128)
cov = np.cov(np.vstack([xs - xs.mean(), ys - ys.mean()]))
vals, vecs = np.linalg.eigh(cov)
major = vecs[:, np.argmax(vals)]
tilt = math.degrees(math.atan2(major[0], major[1]))  # afwijking van verticaal
if tilt > 90:
    tilt -= 180
if tilt < -90:
    tilt += 180
phone = phone.rotate(-tilt, resample=Image.BICUBIC, expand=True)
print(f'telefoon rechtgezet: {tilt:.1f}°')
save(trim(phone), '09-telefoon.webp', 800)

# Ringdoosjes: één beeld met dicht (links) en open (rechts), even groot uitgesneden.
boxes = cut('Paired Blush Velvet Ring Boxes.png')
half = boxes.width // 2
closed, opened = trim(boxes.crop((0, 0, half, boxes.height)), 0), trim(boxes.crop((half, 0, boxes.width, boxes.height)), 0)
size = (max(closed.width, opened.width), max(closed.height, opened.height))
for im, name in ((closed, '12-ringdoosje-dicht.webp'), (opened, '12-ringdoosje-open.webp')):
    canvas = Image.new('RGBA', (int(size[0] * 1.1), int(size[1] * 1.1)), (0, 0, 0, 0))
    # Onderkant en midden gelijk, zodat het wisselen niet verspringt.
    canvas.alpha_composite(im, ((canvas.width - im.width) // 2, canvas.height - im.height - int(size[1] * 0.05)))
    save(canvas, name, 900)

# Vliegtuigraam in lagen ------------------------------------------------------

frame_src = Image.open(source('Minimalist Airplane Window Frame.png')).convert('RGB')
frame = cut('Minimalist Airplane Window Frame.png')
box = frame.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
pad = int(frame.width * 0.02)
box = (box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad)

# Glas: het egale vlak in het midden van de originele foto (flood fill vanuit het midden).
# rembg ziet delen van het ivoorkleurige kozijn als achtergrond, dus dat doen we zelf.
probe = frame_src.copy()
ImageDraw.floodfill(probe, (probe.width // 2, probe.height // 2), (255, 0, 0), thresh=10)
glass = (np.asarray(probe) == [255, 0, 0]).all(axis=2)
glass_img = Image.fromarray((glass * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5))

# Kozijn: binnen de buitenrand volledig dekkend, de rand zelf zacht zoals rembg hem geeft, glas eruit.
inside = np.asarray(fill_holes(frame).getchannel('A').point(lambda a: 255 if a >= 128 else 0).filter(ImageFilter.MinFilter(7))) > 0
frame_alpha = np.where(inside, 255, np.asarray(frame.getchannel('A')))
frame_alpha = np.where(np.asarray(glass_img.filter(ImageFilter.MinFilter(3))) > 0, 0, frame_alpha)
frame = frame_src.convert('RGBA')
frame.putalpha(Image.fromarray(frame_alpha.astype('uint8')).filter(ImageFilter.GaussianBlur(0.6)))

# Lagen achter het glas lopen iets door onder het kozijn.
glass_img = glass_img.filter(ImageFilter.MaxFilter(9))
glass_box = glass_img.getbbox()

mask = Image.new('RGBA', frame.size, (0, 0, 0, 0))
mask.putalpha(glass_img)
save(frame.crop(box), '01-raam.webp', 900, 85)
save(mask.crop(box), '01-raam-glas.png', 450)

# Rolluik: rechthoekig paneel over het hele glas, uit de foto met gesloten rolluik.
# Buiten het glas (de ronde hoeken) wordt elke rij aangevuld met de dichtstbijzijnde
# paneelpixel, zodat er bij het omhoogschuiven geen stukjes kozijn meeschuiven.
# Het afsnijden op de vorm van het glas doet de site zelf met 01-raam-glas.png als masker.
shade_src = np.asarray(Image.open(source('Minimalist Airplane Window Shade.png')).convert('RGB')).copy()
inner = np.asarray(glass_img.filter(ImageFilter.MinFilter(9))) > 0
gx0, gy0, gx1, gy1 = glass_box
panel = np.zeros((frame.height, frame.width, 4), dtype='uint8')
rows = [y for y in range(gy0, gy1) if inner[y, gx0:gx1].any()]
for y in range(gy0, gy1):
    source_y = min(rows, key=lambda r: abs(r - y))  # rijen zonder glas lenen van de dichtstbijzijnde
    cols = np.nonzero(inner[source_y, gx0:gx1])[0] + gx0
    row = shade_src[source_y]
    left, right = cols.min(), cols.max()
    panel[y, gx0:gx1, :3] = row[gx0:gx1]
    panel[y, gx0:left, :3] = row[left]
    panel[y, right:gx1, :3] = row[right]
    panel[y, gx0:gx1, 3] = 255
save(Image.fromarray(panel).crop(box), '02-rolluik.webp', 900, 85)

# Uitzichten: rechthoek uit elk raam van de drie-uitzichten-foto, geschaald over het glas.
views = Image.open(source('Three Views from the Sky.png')).convert('RGBA')
view_starts = {'03-uitzicht-dag.webp': 214, '03-uitzicht-nacht.webp': 930, '03-uitzicht-emporda.webp': 1639}
for name, x in view_starts.items():
    view = views.crop((x + 24, 188, x + 292, 532))
    scale = max((gx1 - gx0) / view.width, (gy1 - gy0) / view.height)
    view = view.resize((math.ceil(view.width * scale), math.ceil(view.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    canvas.alpha_composite(view, (gx0 - (view.width - (gx1 - gx0)) // 2, gy0 - (view.height - (gy1 - gy0)) // 2))
    canvas.putalpha(Image.fromarray(np.minimum(np.asarray(canvas.getchannel('A')), np.asarray(glass_img))))
    save(canvas.crop(box), name, 900, 82)

cw, ch = box[2] - box[0], box[3] - box[1]
print(f'raam-canvas {cw}×{ch}; glas (voor Window.astro): left {100 * (gx0 - box[0]) / cw:.2f}% top {100 * (gy0 - box[1]) / ch:.2f}% width {100 * (gx1 - gx0) / cw:.2f}% height {100 * (gy1 - gy0) / ch:.2f}%')
