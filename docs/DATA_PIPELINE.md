# StarbSense data pipeline and model-readiness plan

## Purpose

This document defines a safe, reproducible path from an approved research dataset to offline experiments. It is a research plan, not a clinical protocol or a claim that StarbSense diagnoses strabismus.

## Current state

- The browser application uses MediaPipe Face Landmarker for general facial landmarks.
- Existing eye/iris geometry is a measurement heuristic, not a clinically calibrated gaze estimate.
- Existing quality checks assess whether a face/eye sample is usable; they do not establish a diagnosis.
- The current star-following task is not an Alternate Cover Test.
- No strabismus-labelled dataset is currently integrated.
- Two exploratory HOG + SVM image classifiers (binary and five-class) have been trained from the supplied static-image archives. The app can apply them to selected eye-pair crops from a live session, but this camera-to-dataset transfer has not been validated.
- Flask receives derived numeric session measurements and selected eye-pair crops for in-memory inference. Raw video/audio are not sent, and the image-prediction endpoint does not save submitted crops.

## Data modalities must stay separate

| Modality | Example labels/targets | Can it directly train the same model as the others? |
|---|---|---|
| Frontal face / gaze photographs | Clinician-confirmed alignment category, only if explicitly supplied | No; image classification task |
| Eye-region crops | Eye/iris/pupil landmarks or detection boxes | No; localization task, not clinical diagnosis |
| Cover-test video | Movement response during cover/uncover, with clinical reference | No; temporal video task |
| Eye-tracker coordinates | Time-series gaze coordinates and ACT event labels | No; sensor-specific temporal task |
| Generic gaze datasets | Screen target / gaze point | No; gaze-estimation task, not strabismus labels |

A dataset can support feature-extraction research without being suitable for strabismus classification. Never convert a generic gaze label into a normal/strabismus label.

## Suggested repository layout

Keep this public repository free of patient data. The following is a local-only layout; add the data directory to .gitignore before placing any approved files there.

```text
data/
  README.md                 # local instructions only; commit no patient data
  raw/                      # approved source files; local/private only
  interim/                  # reviewed crops or extracted frames; local/private only
  processed/                # derived features; pseudonymous IDs only
  manifests/
    dataset_manifest.csv    # sample-level provenance and label metadata
  splits/
    participants.csv       # participant-level train/validation/test assignment
experiments/
  baselines/
  evaluation/
  reports/
```

## Minimum manifest fields

Use one row per source sample or video. Do not place names, contact details, dates of birth, medical-record numbers, or other direct identifiers in this manifest.

| Field | Meaning |
|---|---|
| sample_id | Random, non-identifying sample key |
| participant_id | Pseudonymous participant key; keep any re-identification key separately under authorized supervision |
| source_id | Dataset/paper/provider name |
| source_version | Exact version/date or release identifier |
| modality | image, video, eye_crop, or eye_tracking_coordinates |
| label | Exact label supplied by the source; never infer a clinical label |
| label_source | Ophthalmologist, clinical test, dataset uploader, or unknown |
| reference_test | APCT, cover test, Modified Krimsky, or not reported |
| capture_device | Only if documented |
| consent_and_use_status | Approved, permission_pending, restricted, or unknown |
| license | Exact license text/name or unknown |
| split | train, validation, test; assigned by participant |
| notes | Non-identifying quality/provenance notes |

## Quality and leakage checks before training

1. Verify the dataset source, version, license, and permitted use.
2. Inspect class counts and missing/ambiguous labels.
3. Detect exact duplicates and near-duplicates; keep augmented copies with their source participant and original sample.
4. Check whether one participant appears across multiple splits. If so, rebuild splits by participant.
5. For video, keep all frames from one participant and one recording in the same split. Do not randomly distribute adjacent frames.
6. Record image resolution, blur, lighting, face angle, occlusion, camera type, and missing-eye cases.
7. Do not combine labels from different clinical reference tests without documenting their definitions and limitations.
8. Do not use a tiny or severely imbalanced dataset to claim generalization. In particular, the 27-image Mendeley set is not a credible validation cohort.

## Baseline and evaluation

Start with a transparent baseline only after an approved dataset passes the checks above. Keep experiments offline and reproducible.

Report at minimum:
- participant counts and sample counts per split;
- class distribution per split;
- sensitivity and specificity;
- precision, recall, F1, and balanced accuracy;
- confusion matrix;
- confidence intervals where sample size permits;
- performance by relevant capture-quality groups;
- limitations, dataset provenance, and possible bias.

Do not report frame-level accuracy as if each frame were an independent person. Do not use the test set to tune thresholds or model choices. Keep a final held-out participant-level test set untouched until the experiment is fixed.

## Integration gate

A model may be considered for a research-only application integration only after all gates pass:

- [ ] Written permission / license explicitly permits the intended processing and model use.
- [ ] Dataset provenance and clinical label definitions are documented.
- [ ] Adult supervisor and qualified eye-care professional review the plan.
- [ ] Participant-level splits and leakage checks are complete.
- [ ] Independent held-out evaluation is complete and limitations are reported.
- [ ] Model card documents intended use, excluded use, population, devices, limitations, and failure cases.
- [ ] The UI clearly states that results are not a diagnosis and do not replace an eye-care professional.
- [ ] No identifiable patient data or secret access credentials are included in the repository.

## What this means for the current StarbSense build

The current app includes experimental image-model labels from live-session eye crops, but these outputs are not a diagnosis, validated screening result, or referral decision. The app may report technical capture quality and explain that a clinician is the appropriate person to assess concerns. Any stronger model claim or clinical use remains blocked until the integration and validation gates above are satisfied.


## Implemented local tooling (2026-11-24)

The repository now includes executable utilities; these are not merely proposed steps:

- `tools/dataset_tools.py audit`: checks required manifest columns, missing files, unsafe paths outside the approved data root, exact SHA-256 duplicates, unregistered media files, missing labels/licenses, and participant split leakage.
- `tools/dataset_tools.py split --seed 42`: creates a reproducible participant-level 70/15/15 assignment CSV. It requires at least three distinct pseudonymous participants. The assignment is written to the ignored local `data/splits/` folder.
- `data/manifests/dataset_manifest.template.csv`: blank manifest header; copy it locally to `dataset_manifest.csv`.
- `tests/test_dataset_tools.py`: synthetic-only unit tests for duplicate detection, split leakage, deterministic participant assignment, and path traversal protection.
- `.gitignore`: excludes raw/interim/processed data, local splits, and audit reports.
- CI compiles the new tools and runs the Python test suite.

Commands from the repository root:

```bash
python tools/dataset_tools.py audit
python tools/dataset_tools.py split --seed 42
python -m unittest discover -s tests -v
npm run build
```

The audit report is a data-integrity report, not a clinical validation report. The split generator is intentionally not class-stratified: with small clinical cohorts, participant count and class distribution must be reviewed before selecting a final split strategy. Never interpret a successful audit as permission to train or proof that the labels are clinically correct.

### Completion boundary

**Implemented:** local data inventory, manifest schema, deterministic participant-level split generation, integrity/leakage checks, synthetic tests, Git ignore protections, package commands, and CI compilation coverage.

**Not performed:** independent participant-level clinical validation of the image baselines, validating their performance on ordinary webcam crops, selecting clinical thresholds, or integrating a medical decision into the app. Those steps require a verified lawful dataset, appropriate research oversight, and qualified clinical review.


## Approved small reference-data acquisition path

A downloader is available for the Figshare anonymized clinical measurement spreadsheet (article 28001906, file 51086813). It is intentionally separate from the image/video training pipeline.

Run:

```bash
python tools/download_reference_data.py
```

The script re-checks the official article title, CC BY 4.0 license, exact file ID, XLSX extension, and a 1 MB maximum before downloading to `data/raw/figshare_reference/`. It writes a local `download_receipt.json` containing the SHA-256 hash. The destination is ignored by Git.

**Interpretation limit:** this spreadsheet contains clinical measurement data, not webcam imagery or temporal eye-movement samples. It can support a separate descriptive analysis of clinical measurements; it cannot train or validate StarbSense's webcam image/video classifier. Do not expose participant-level health data in public commits, even if the source record describes the file as anonymized.

The download endpoint returned HTTP 403 in the hosted execution environment. The script is committed and ready, but the actual spreadsheet bytes have not been retrieved or inspected in this session.
