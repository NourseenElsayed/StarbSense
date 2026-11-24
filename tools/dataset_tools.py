#!/usr/bin/env python3
"""Privacy-conscious dataset inventory tools for StarbSense.

This utility does not train a model or infer clinical labels. It inventories
locally approved research files and checks manifest integrity, exact duplicates,
and participant-level split leakage.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import random
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

MEDIA_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp",
    ".mp4", ".mov", ".avi", ".mkv", ".csv", ".tsv", ".json", ".npy", ".npz",
}
REQUIRED_COLUMNS = {
    "sample_id", "participant_id", "relative_path", "source_id",
    "source_version", "modality", "label", "label_source",
    "reference_test", "consent_and_use_status", "license", "split", "notes",
}
ALLOWED_SPLITS = {"", "train", "validation", "test"}
ALLOWED_STATUS = {"approved", "permission_pending", "restricted", "unknown"}


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_manifest(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    if not path.is_file():
        raise FileNotFoundError(f"Manifest not found: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        columns = set(reader.fieldnames or [])
        missing = sorted(REQUIRED_COLUMNS - columns)
        rows = list(reader)
    return rows, missing


def safe_sample_path(root: Path, relative_path: str) -> Path | None:
    candidate = (root / relative_path).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        return None
    return candidate


def audit_dataset(root: Path, manifest_path: Path) -> dict:
    root = root.resolve()
    rows, missing_columns = read_manifest(manifest_path)
    issues: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    if missing_columns:
        issues.append({
            "type": "missing_manifest_columns",
            "details": ", ".join(missing_columns),
        })

    sample_ids: Counter[str] = Counter()
    participant_splits: dict[str, set[str]] = defaultdict(set)
    manifest_paths: set[str] = set()
    hash_to_paths: dict[str, list[str]] = defaultdict(list)
    label_counts: Counter[str] = Counter()
    status_counts: Counter[str] = Counter()
    checked_files = 0

    for row_number, row in enumerate(rows, start=2):
        sample_id = (row.get("sample_id") or "").strip()
        participant_id = (row.get("participant_id") or "").strip()
        relative_path = (row.get("relative_path") or "").strip()
        split = (row.get("split") or "").strip().lower()
        status = (row.get("consent_and_use_status") or "unknown").strip().lower()
        label = (row.get("label") or "").strip()

        if not sample_id:
            issues.append({"type": "empty_sample_id", "row": str(row_number)})
        else:
            sample_ids[sample_id] += 1
        if not participant_id:
            issues.append({"type": "empty_participant_id", "row": str(row_number)})
        if not relative_path:
            issues.append({"type": "empty_relative_path", "row": str(row_number)})
            continue
        if split not in ALLOWED_SPLITS:
            issues.append({"type": "invalid_split", "row": str(row_number), "value": split})
        if participant_id and split:
            participant_splits[participant_id].add(split)
        if status not in ALLOWED_STATUS:
            issues.append({"type": "invalid_use_status", "row": str(row_number), "value": status})
        status_counts[status] += 1
        if status != "approved":
            warnings.append({
                "type": "not_approved_for_research_use",
                "row": str(row_number),
                "status": status,
            })
        if not label:
            warnings.append({"type": "missing_label", "row": str(row_number)})
        else:
            label_counts[label] += 1

        path = safe_sample_path(root, relative_path)
        if path is None:
            issues.append({"type": "path_outside_data_root", "row": str(row_number)})
            continue
        normalized = path.relative_to(root).as_posix()
        manifest_paths.add(normalized)
        if not path.is_file():
            issues.append({"type": "file_missing", "row": str(row_number), "path": normalized})
            continue
        try:
            file_hash = sha256_file(path)
        except OSError as error:
            issues.append({"type": "file_unreadable", "row": str(row_number), "details": str(error)})
            continue
        hash_to_paths[file_hash].append(normalized)
        checked_files += 1

    for sample_id, count in sample_ids.items():
        if count > 1:
            issues.append({"type": "duplicate_sample_id", "sample_id": sample_id, "count": str(count)})

    for participant_id, splits in participant_splits.items():
        if len(splits) > 1:
            issues.append({
                "type": "participant_split_leakage",
                "participant_id": participant_id,
                "splits": ", ".join(sorted(splits)),
            })

    exact_duplicate_groups = [
        sorted(set(paths)) for paths in hash_to_paths.values() if len(set(paths)) > 1
    ]
    for paths in exact_duplicate_groups:
        warnings.append({"type": "exact_duplicate_files", "paths": " | ".join(paths)})

    discovered_paths = set()
    if root.exists():
        discovered_paths = {
            path.relative_to(root).as_posix()
            for path in root.rglob("*")
            if path.is_file() and path.suffix.lower() in MEDIA_EXTENSIONS
        }
    unregistered = sorted(discovered_paths - manifest_paths)
    for relative in unregistered:
        warnings.append({"type": "unregistered_file", "path": relative})

    return {
        "project": "StarbSense",
        "root_exists": root.is_dir(),
        "manifest_rows": len(rows),
        "checked_files": checked_files,
        "unique_participants": len(participant_splits),
        "label_counts": dict(sorted(label_counts.items())),
        "use_status_counts": dict(sorted(status_counts.items())),
        "exact_duplicate_groups": exact_duplicate_groups,
        "unregistered_files": unregistered,
        "issues": issues,
        "warnings": warnings,
        "ready_for_training": False,
        "training_readiness_note": (
            "This audit checks file/manifest integrity only. It cannot verify "
            "clinical label validity, consent, licensing, representativeness, "
            "or clinical suitability. A qualified supervisor must review those."
        ),
    }


def create_participant_split(
    manifest_path: Path,
    output_path: Path,
    seed: int = 42,
    train_ratio: float = 0.70,
    validation_ratio: float = 0.15,
) -> dict:
    rows, missing_columns = read_manifest(manifest_path)
    if missing_columns:
        raise ValueError("Manifest is missing required columns: " + ", ".join(missing_columns))
    participants = sorted({
        (row.get("participant_id") or "").strip()
        for row in rows
        if (row.get("participant_id") or "").strip()
    })
    if len(participants) < 3:
        raise ValueError("At least 3 distinct pseudonymous participants are required.")
    if not (0 < train_ratio < 1 and 0 < validation_ratio < 1 and train_ratio + validation_ratio < 1):
        raise ValueError("Ratios must be positive and leave a positive test fraction.")

    shuffled = participants[:]
    random.Random(seed).shuffle(shuffled)
    train_end = max(1, round(len(shuffled) * train_ratio))
    validation_end = max(train_end + 1, round(len(shuffled) * (train_ratio + validation_ratio)))
    validation_end = min(validation_end, len(shuffled) - 1)

    assignments = {}
    for index, participant_id in enumerate(shuffled):
        if index < train_end:
            split = "train"
        elif index < validation_end:
            split = "validation"
        else:
            split = "test"
        assignments[participant_id] = split

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["participant_id", "split"])
        writer.writeheader()
        for participant_id in sorted(assignments):
            writer.writerow({"participant_id": participant_id, "split": assignments[participant_id]})

    counts = Counter(assignments.values())
    return {
        "participants": len(participants),
        "split_counts": dict(counts),
        "seed": seed,
        "output": str(output_path),
        "note": "Participant-level assignment only; review class balance and source protocol before use.",
    }


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Audit StarbSense research dataset files.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    audit_parser = subparsers.add_parser("audit", help="Check a dataset manifest and local files.")
    audit_parser.add_argument("--root", type=Path, default=Path("data/raw"))
    audit_parser.add_argument("--manifest", type=Path, default=Path("data/manifests/dataset_manifest.csv"))
    audit_parser.add_argument("--report", type=Path, default=Path("data/reports/dataset_audit.json"))

    split_parser = subparsers.add_parser("split", help="Create reproducible participant-level splits.")
    split_parser.add_argument("--manifest", type=Path, default=Path("data/manifests/dataset_manifest.csv"))
    split_parser.add_argument("--output", type=Path, default=Path("data/splits/participants.csv"))
    split_parser.add_argument("--seed", type=int, default=42)
    split_parser.add_argument("--train-ratio", type=float, default=0.70)
    split_parser.add_argument("--validation-ratio", type=float, default=0.15)

    args = parser.parse_args(argv)
    try:
        if args.command == "audit":
            result = audit_dataset(args.root, args.manifest)
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(json.dumps(result, indent=2), encoding="utf-8")
            print(json.dumps(result, indent=2))
            return 1 if result["issues"] else 0
        result = create_participant_split(
            args.manifest, args.output, args.seed,
            args.train_ratio, args.validation_ratio,
        )
        print(json.dumps(result, indent=2))
        return 0
    except (OSError, ValueError, csv.Error) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
