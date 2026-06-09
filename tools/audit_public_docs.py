#!/usr/bin/env python3
"""Audit the public website tree for IP/sensitive markers and consistency.

This gate is intentionally conservative. It checks only the public website tree
(`docs/` by default), not internal working material. It fails on sensitive terms,
mojibake, broken local links, and inconsistent public Markdown headers.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

STRICT_MARKERS = [
    "AIG INTERNAL",
    "AIG CONFIDENTIAL",
    "CONFIDENTIAL",
    "PROPRIETARY",
    "PATENT PENDING",
    "PATENT STATUS",
    "AIG-PAT",
    "Patent Ref",
    "provisional patent",
    "provisional application",
    "Oasis",
    "Farmstead",
    "SKYFORGE",
    "RF-aware optics",
    "RF AWARE OPTICS",
    "SMASH",
    "DARPA interview",
    "INTERNAL EMPIRICAL",
    "PRIVATE",
    "DO NOT DISTRIBUTE",
    "ITAR",
    "export controlled",
    "customer-sensitive",
    "partner targets",
    "Kevin Aoki",
    "Aoki",
    "unpublished IP",
]

SOFT_MARKER_RE = re.compile(
    r"\b(internal|private|proprietary|patent|confidential|Oasis|Farmstead|AIG-PAT|unpublished IP)\b",
    re.IGNORECASE,
)

MOJIBAKE_MARKERS = ["â", "Â", "�"]

REQUIRED_MD_HEADER_BITS = [
    "AKAMAI INTELLIGENCE GROUP",
    "Document ID:",
    "Classification: UNCLASSIFIED // PUBLIC RELEASE",
    "Author: Christopher Ramos",
    "Research and drafting support: Deus ex Machina",
    "Status:",
]

SKIP_NAMES = {".nojekyll", "CNAME", "_headers"}
TEXT_SUFFIXES = {".html", ".md", ".txt", ".css", ".js", ""}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def is_text_file(path: Path) -> bool:
    return path.is_file() and path.name not in SKIP_NAMES and path.suffix in TEXT_SUFFIXES


def audit_content(root: Path) -> list[str]:
    failures: list[str] = []
    for path in sorted(root.rglob("*")):
        if not is_text_file(path):
            continue
        text = read_text(path)
        rel = path.relative_to(root)
        for marker in STRICT_MARKERS:
            if marker in text:
                failures.append(f"{rel}: strict marker found: {marker!r}")
        soft = SOFT_MARKER_RE.search(text)
        if soft:
            failures.append(f"{rel}: soft marker found: {soft.group(0)!r}")
        for marker in MOJIBAKE_MARKERS:
            if marker in text:
                failures.append(f"{rel}: mojibake marker found: {marker!r}")
    return failures


def audit_links(root: Path) -> list[str]:
    failures: list[str] = []
    for html in sorted(root.glob("*.html")):
        text = read_text(html)
        for href in re.findall(r'href="([^"]+)"', text):
            if href.startswith(("http://", "https://", "mailto:", "#", "javascript:")):
                continue
            clean = href.split("#", 1)[0].split("?", 1)[0]
            if not clean:
                continue
            target = (html.parent / clean).resolve()
            try:
                target.relative_to(root.resolve())
            except ValueError:
                failures.append(f"{html.relative_to(root)}: link escapes docs root: {href}")
                continue
            if not target.exists():
                failures.append(f"{html.relative_to(root)}: broken local link: {href}")
    return failures


def audit_markdown_headers(root: Path) -> list[str]:
    failures: list[str] = []
    aig_dir = root / "aig"
    if not aig_dir.exists():
        return failures
    for md in sorted(aig_dir.glob("*.md")):
        header = "\n".join(read_text(md).splitlines()[:14])
        for required in REQUIRED_MD_HEADER_BITS:
            if required not in header:
                failures.append(f"{md.relative_to(root)}: missing public header bit: {required!r}")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit public website docs for sensitive markers and consistency.")
    parser.add_argument("root", nargs="?", default="docs", help="Public website root to audit, default: docs")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        print(f"ERROR: public docs root not found: {root}", file=sys.stderr)
        return 2

    failures = []
    failures.extend(audit_content(root))
    failures.extend(audit_links(root))
    failures.extend(audit_markdown_headers(root))

    checked = sum(1 for p in root.rglob("*") if p.is_file())
    if failures:
        print(f"PUBLIC DOCS AUDIT FAILED: {len(failures)} issue(s), {checked} file(s) checked")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"PUBLIC DOCS AUDIT PASSED: {checked} file(s) checked")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
