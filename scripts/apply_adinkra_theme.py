from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
THEME_FILE = "sitewide-adinkra.css"
THEME_LINK = f'<link rel="stylesheet" href="{THEME_FILE}">'


def apply_theme(html_path: Path) -> bool:
    original = html_path.read_text(encoding="utf-8")
    if THEME_FILE in original:
        return False

    updated, count = re.subn(
        r"</head>",
        f"{THEME_LINK}</head>",
        original,
        count=1,
        flags=re.IGNORECASE,
    )
    if count != 1:
        raise RuntimeError(f"Could not find a closing </head> tag in {html_path.name}")

    html_path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    changed = []
    html_files = sorted(ROOT.glob("*.html"))
    if not html_files:
        raise RuntimeError("No HTML files were found.")

    if not (ROOT / THEME_FILE).exists():
        raise RuntimeError(f"Missing required theme file: {THEME_FILE}")

    for html_path in html_files:
        if apply_theme(html_path):
            changed.append(html_path.name)

    print(f"Adinkra theme connected to {len(html_files)} HTML pages.")
    if changed:
        print("Updated:")
        for name in changed:
            print(f"- {name}")
    else:
        print("All HTML pages were already connected.")


if __name__ == "__main__":
    main()
