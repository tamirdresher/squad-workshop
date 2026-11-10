import argparse
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("href", "src") and value:
                self.links.append(value)


root = Path(__file__).resolve().parents[2]
args_parser = argparse.ArgumentParser(description="Check local links and Markdown fences.")
scope = args_parser.add_mutually_exclusive_group()
scope.add_argument("--tracked", action="store_true", help="Check all tracked documents (default).")
scope.add_argument("--range", metavar="REF", help="Check documents changed from REF to the current worktree/HEAD.")
args = args_parser.parse_args()
git_args = (["diff", "--name-only", "--diff-filter=ACMR", args.range, "--"]
            if args.range else ["ls-files", "--cached"])
files = subprocess.check_output(["git", *git_args], cwd=root, text=True).splitlines()
failures = []
checked = 0
documents = 0
for filename in files:
    source = root / filename
    if source.suffix.lower() not in (".md", ".html"):
        continue
    documents += 1
    text = source.read_text(encoding="utf-8-sig")
    if source.suffix == ".html":
        parser = Links()
        parser.feed(text)
        links = parser.links
    else:
        without_fences = re.sub(r"```[\s\S]*?```", "", text)
        without_code = re.sub(r"(`+).*?\1", "", without_fences, flags=re.S)
        links = re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", without_code)
        if text.count("```") % 2:
            failures.append(f"{filename}: unbalanced fenced code")
    for link in links:
        link = link.split(' "', 1)[0].strip("<>")
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            continue
        if not parsed.path:
            continue
        path = unquote(parsed.path)
        if source.suffix == ".html":
            path = path.lstrip("/")
        target = source.parent / path
        checked += 1
        if not target.exists():
            failures.append(f"{filename}: missing {link}")
print(f"Checked {documents} documents and {checked} local link targets "
      f"({'range ' + args.range if args.range else 'tracked'}).")
if not documents or not checked:
    failures.append("No documents/local targets selected; refusing an empty green result.")
if failures:
    print("\n".join(failures))
    raise SystemExit(1)
print("PASS: local targets exist and Markdown code fences are balanced.")
