import csv
import tempfile
import unittest
from pathlib import Path

from tools.dataset_tools import audit_dataset, create_participant_split


COLUMNS = [
    "sample_id", "participant_id", "relative_path", "source_id",
    "source_version", "modality", "label", "label_source",
    "reference_test", "consent_and_use_status", "license", "split", "notes",
]


class DatasetToolsTests(unittest.TestCase):
    def write_manifest(self, path, rows):
        with path.open("w", newline="", encoding="utf-8") as stream:
            writer = csv.DictWriter(stream, fieldnames=COLUMNS)
            writer.writeheader()
            writer.writerows(rows)

    def row(self, sample, participant, relative, split=""):
        return {
            "sample_id": sample,
            "participant_id": participant,
            "relative_path": relative,
            "source_id": "synthetic-test",
            "source_version": "1",
            "modality": "image",
            "label": "example-label",
            "label_source": "synthetic",
            "reference_test": "not_applicable",
            "consent_and_use_status": "approved",
            "license": "synthetic-test-only",
            "split": split,
            "notes": "Synthetic test fixture; not a patient record.",
        }

    def test_audit_detects_duplicate_files_and_participant_leakage(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / "raw"
            root.mkdir()
            (root / "a.jpg").write_bytes(b"same synthetic bytes")
            (root / "b.jpg").write_bytes(b"same synthetic bytes")
            manifest = Path(temp) / "manifest.csv"
            self.write_manifest(manifest, [
                self.row("s1", "p1", "a.jpg", "train"),
                self.row("s2", "p1", "b.jpg", "test"),
            ])
            result = audit_dataset(root, manifest)
            issue_types = {item["type"] for item in result["issues"]}
            warning_types = {item["type"] for item in result["warnings"]}
            self.assertIn("participant_split_leakage", issue_types)
            self.assertIn("exact_duplicate_files", warning_types)
            self.assertEqual(result["checked_files"], 2)

    def test_split_is_deterministic_and_keeps_participants_unique(self):
        with tempfile.TemporaryDirectory() as temp:
            base = Path(temp)
            manifest = base / "manifest.csv"
            rows = [self.row(f"s{i}", f"p{i}", f"f{i}.jpg") for i in range(10)]
            self.write_manifest(manifest, rows)
            first = base / "first.csv"
            second = base / "second.csv"
            result_a = create_participant_split(manifest, first, seed=7)
            result_b = create_participant_split(manifest, second, seed=7)
            self.assertEqual(first.read_text(), second.read_text())
            self.assertEqual(result_a["split_counts"], result_b["split_counts"])
            with first.open(newline="", encoding="utf-8") as stream:
                assignments = list(csv.DictReader(stream))
            self.assertEqual(len(assignments), 10)
            self.assertEqual(len({row["participant_id"] for row in assignments}), 10)
            self.assertEqual({row["split"] for row in assignments}, {"train", "validation", "test"})

    def test_rejects_path_traversal(self):
        with tempfile.TemporaryDirectory() as temp:
            base = Path(temp)
            root = base / "raw"
            root.mkdir()
            manifest = base / "manifest.csv"
            self.write_manifest(manifest, [self.row("s1", "p1", "../outside.jpg")])
            result = audit_dataset(root, manifest)
            self.assertIn("path_outside_data_root", {item["type"] for item in result["issues"]})


if __name__ == "__main__":
    unittest.main()
