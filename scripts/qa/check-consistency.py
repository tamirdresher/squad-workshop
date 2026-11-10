import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[2]
expected = [(0, 12), (12, 22), (22, 52), (52, 60), (60, 95),
            (95, 105), (105, 140), (140, 166), (166, 180)]
for name in ("instructor.md", "learner-lab.md"):
    text = (root / "docs" / "ai-next" / name).read_text(encoding="utf-8-sig")
    rows = re.findall(r"^\|\s*(\d+)–(\d+)\s*\|", text, re.M)
    assert [(int(a), int(b)) for a, b in rows] == expected, name
    assert "126" in text and "180" in text


class Deck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lab_times = []
        self.cells = []
        self.in_cell = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "section" and attrs.get("data-kind") == "lab":
            self.lab_times.append((int(attrs["data-start"]), int(attrs["data-duration"])))
        if tag == "td":
            self.in_cell = True
            self.cells.append("")

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False

    def handle_data(self, data):
        if self.in_cell:
            self.cells[-1] += data


deck = Deck()
deck.feed((root / "presentations" / "ai-next-squad.html").read_text(encoding="utf-8-sig"))
clock = [tuple(map(int, cell.split("–"))) for cell in deck.cells
         if re.fullmatch(r"\d+–\d+", cell)]
assert clock == expected, clock
assert deck.lab_times == [(22, 30), (60, 35), (105, 35), (140, 26)]
assert sum(end - start for start, end in clock) == 180
assert sum(duration for _, duration in deck.lab_times) == 126
print("PASS schedule: identical nine blocks in both guides and deck; 180 total, "
      "10 break, labs 30+35+35+26=126 minutes")

files = subprocess.check_output(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
    cwd=root, text=True).splitlines()
for filename in files:
    source = root / filename
    if source.suffix.lower() not in (".md", ".html", ".yml", ".yaml"):
        continue
    text = source.read_text(encoding="utf-8-sig")
    assert not re.search(r"https?://(?:github\.com/bradygaster/squad|bradygaster\.github\.io/squad)", text), filename
print("PASS upstream: no stale product source/docs URLs in course documents or GitHub YAML")
assert (root / ".npmrc").read_text().strip() == "registry=https://packagefeedproxy.microsoft.io/npm/"
sources = ET.parse(root / "NuGet.Config").findall("./packageSources/add")
assert len(sources) == 1
assert sources[0].get("value") == "https://packagefeedproxy.microsoft.io/nuget/v3/index.json"
assert ET.parse(root / "NuGet.Config").find("./packageSources/clear") is not None
lock = json.loads((root / "labs" / "ai-next" / "starter" / "frontend" / "package-lock.json").read_text())
for package in lock["packages"].values():
    if "resolved" in package:
        assert package["resolved"].startswith("https://packagefeedproxy.microsoft.io/npm/")
print("PASS root feed configuration and starter npm lockfile: Microsoft CFS only")

for filename in ("docs/ai-next/learner-lab.md", "docs/ai-next/instructor.md",
                 ".github/agents/squad-coach.agent.md", "presentations/ai-next-squad.html"):
    text = (root / filename).read_text(encoding="utf-8-sig")
    assert "SQUAD_NO_PERSONAL" in text, filename
    assert not re.search(r"requires?\s+(?:intentional\s+)?`?configured\s*:\s*true", text), filename
    assert "onboarding" in text or filename.endswith("learner-lab.md"), filename
readme = (root / "README.md").read_text(encoding="utf-8-sig")
chooser = (root / ".github/ISSUE_TEMPLATE/config.yml").read_text(encoding="utf-8-sig")
assert "tamirdresher/squad-workshop/issues/new/choose" not in readme + chooser
assert "actions/workflows/check-links.yml" not in readme
assert "actions/workflows/verify-script.yml" not in readme
print("PASS review regressions: personal isolation, onboarding wording, removed unavailable GitHub links")
