#!/usr/bin/env python3
"""Download one small, openly licensed, anonymized tabular strabismus dataset.

This intentionally downloads ONLY the Figshare spreadsheet described below.
It does not fetch facial photographs, videos, or datasets with unclear rights.
The file is stored locally under data/raw/ and is excluded from Git.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ARTICLE_ID = 28001906
EXPECTED_FILE_ID = 51086813
EXPECTED_TITLE_FRAGMENT = "Dataset Comparison of strabismus angle performed with synoptophore"
API_URL = f"https://api.figshare.com/v2/articles/{ARTICLE_ID}"
MAX_BYTES = 1_000_000


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "StarbSense-Research-Data-Acquisition/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def download_reference_dataset(output_dir: Path) -> dict:
    metadata = fetch_json(API_URL)
    title = metadata.get("title", "")
    license_name = (metadata.get("license") or {}).get("name", "")
    if EXPECTED_TITLE_FRAGMENT.lower() not in title.lower():
        raise ValueError(f"Unexpected Figshare record title: {title!r}")
    if "CC BY 4.0" not in license_name and "CC-BY-4.0" not in license_name:
        raise ValueError(f"Expected CC BY 4.0; source reports {license_name!r}")

    files = metadata.get("files") or []
    selected = [item for item in files if int(item.get("id", -1)) == EXPECTED_FILE_ID]
    if len(selected) != 1:
        raise ValueError(
            f"Expected exactly one approved file ID {EXPECTED_FILE_ID}; "
            f"found {len(selected)}."
        )
    file_info = selected[0]
    size = int(file_info.get("size", 0))
    if size <= 0 or size > MAX_BYTES:
        raise ValueError(f"Unexpected file size ({size} bytes); refusing download.")

    download_url = file_info.get("download_url")
    filename = Path(file_info.get("name") or "strabismus_angle_reference.xlsx").name
    if not download_url or not filename.lower().endswith(".xlsx"):
        raise ValueError("Missing download URL or unexpected file format.")

    output_dir.mkdir(parents=True, exist_ok=True)
    destination = output_dir / filename
    request = urllib.request.Request(
        download_url,
        headers={"User-Agent": "StarbSense-Research-Data-Acquisition/1.0"},
    )
    digest = hashlib.sha256()
    received = 0
    with urllib.request.urlopen(request, timeout=60) as response, destination.open("wb") as target:
        while True:
            chunk = response.read(64 * 1024)
            if not chunk:
                break
            received += len(chunk)
            if received > MAX_BYTES:
                target.close()
                destination.unlink(missing_ok=True)
                raise ValueError("Download exceeded the 1 MB safety limit.")
            digest.update(chunk)
            target.write(chunk)

    if received != size:
        destination.unlink(missing_ok=True)
        raise ValueError(f"Size mismatch: expected {size}, received {received}.")
    result = {
        "status": "downloaded",
        "source": API_URL,
        "article_id": ARTICLE_ID,
        "file_id": EXPECTED_FILE_ID,
        "title": title,
        "license": license_name,
        "filename": filename,
        "bytes": received,
        "sha256": digest.hexdigest(),
        "local_path": str(destination),
        "use_limit": (
            "Anonymized clinical measurement spreadsheet for descriptive/statistical "
            "reference only. It is not image/video training data and must not be "
            "used to train a webcam strabismus classifier."
        ),
    }
    (output_dir / "download_receipt.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8"
    )
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/raw/figshare_reference"),
        help="Local destination (ignored by Git).",
    )
    args = parser.parse_args()
    try:
        print(json.dumps(download_reference_dataset(args.output), indent=2))
        return 0
    except (OSError, ValueError, urllib.error.URLError, json.JSONDecodeError) as error:
        print(f"DOWNLOAD FAILED: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
