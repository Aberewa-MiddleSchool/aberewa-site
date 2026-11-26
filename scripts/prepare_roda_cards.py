"""Prepare full-resolution same-origin JPEGs for the RODA card gallery.
Only the listed original artwork is retrieved; failure of an individual download
never prevents the game itself from being deployed.
"""
import concurrent.futures
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'roda-card-downloads' / 'cards.json'
ALLOWED_HOST = 'roda-angola-arcade.woodsystone14.chatgpt.site'

def read_source(source):
    if source.startswith('https://'):
        if urlparse(source).hostname != ALLOWED_HOST:
            raise ValueError('Unexpected asset host')
        request = Request(source, headers={'User-Agent': 'RODA-card-gallery/1.0', 'Accept': 'image/*'})
        with urlopen(request, timeout=18) as response:
            data = response.read(12_000_001)
        if len(data) > 12_000_000:
            raise ValueError('Image too large')
        return data
    path = (ROOT / source).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError('Invalid source path')
    return path.read_bytes()

def make_card(row):
    slug, source = row['slug'], row['source']
    if not slug.replace('-', '').isalnum():
        raise ValueError('Invalid card name')
    target = MANIFEST.parent / (slug + '.jpg')
    try:
        data = read_source(source)
        with Image.open(io.BytesIO(data)) as original:
            original.load()
            if original.width < 200 or original.height < 300:
                raise ValueError('Image is not a full character card')
            if original.format == 'JPEG':
                output = data
            else:
                rgb = original.convert('RGB')
                buffer = io.BytesIO()
                rgb.save(buffer, format='JPEG', quality=96, subsampling=0, optimize=True)
                output = buffer.getvalue()
        with Image.open(io.BytesIO(output)) as jpeg:
            jpeg.verify()
            if jpeg.format != 'JPEG':
                raise ValueError('Not JPEG')
        target.write_bytes(output)
        print(f'Prepared {slug}: {len(output)} bytes', flush=True)
        return True
    except Exception as error:
        print(f'::warning::RODA card {slug} unavailable: {error}', flush=True)
        return False

def main():
    rows = json.loads(MANIFEST.read_text())
    if len(rows) != 16 or len({r['slug'] for r in rows}) != 16:
        raise ValueError('Expected exactly sixteen distinct cards')
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(make_card, rows))
    print(f'{sum(results)}/{len(results)} JPG cards prepared.')

if __name__ == '__main__':
    main()
