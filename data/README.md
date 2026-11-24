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
