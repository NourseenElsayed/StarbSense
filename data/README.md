# External research data

This directory is reserved for **locally downloaded research datasets** and derived experiment outputs. Raw third-party data are intentionally excluded from Git history.

Suggested local structure:

```
data/
  external/
    gazebase/       # GazeBase archive and extracted files (local only)
    invisibleeye/   # only if used under its non-commercial license
    roboflow/       # manually reviewed export, with version/license notes
  derived/
    <experiment-id>/
  manifests/
    dataset_manifest.json
```

Before adding any data, read [the dataset compatibility and access plan](../docs/RESEARCH_DATASETS.md). Preserve original archives, licenses, citations, version identifiers and checksums. Do not upload raw participant images/videos or large archives to the public GitHub repository.

A future manifest should record at least: dataset name/version, official source URL, access date, license/terms, citation, archive checksum, class/label definitions, participant IDs or grouping key (where permitted), and train/validation/test split method.


## Manifest and audit tools

Copy `manifests/dataset_manifest.template.csv` to `manifests/dataset_manifest.csv` locally and fill it only with verified, non-identifying metadata. The working manifest is ignored by Git.

Run from the repository root:

```bash
python tools/dataset_tools.py audit
python tools/dataset_tools.py split --seed 42
python -m unittest discover -s tests -v
```

The audit checks file presence, manifest schema, path containment, exact SHA-256 duplicates, unregistered media files, missing labels/licenses, and participant split leakage. It does not assess clinical truth, consent, license validity, or model performance. The split generator requires at least three pseudonymous participants and writes assignments to the ignored local `data/splits/` directory.


## Small open clinical-measurement reference file

To download the separate anonymized Figshare spreadsheet (not image/video training data), run `python tools/download_reference_data.py`. The script checks the official CC BY 4.0 metadata and saves locally under `data/raw/figshare_reference/`; the destination is ignored by Git. Keep participant-level health measurements local and do not commit the workbook or receipt. This spreadsheet is suitable only for a separate descriptive/statistical reference, not webcam classifier training.
