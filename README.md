# StarbSense

StarbSense is an experimental, child-friendly visual-target-following and facial-landmark data-collection prototype. It is a research tool, **not a medical device** and does not diagnose, screen for, or rule out strabismus.

## Current pipeline

- Browser camera capture with participant permission.
- A fixed 17-step visual-following protocol (center, horizontal, vertical, and diagonal targets) with per-step duration and task metadata; this is an experimental stimulus sequence, not a clinical test.
- MediaPipe Face Landmarker for facial and iris landmarks.
- Relative iris-to-eye-corner geometric features (exploratory, not gaze-calibrated).
- Facial transformation matrix proxies (not validated head-pose angles).
- OpenCV bright-pixel candidates (not verified corneal reflections).
- Per-frame technical metadata: timestamps, camera resolution/frame rate where exposed, task metadata, page visibility, and non-identifying lighting summaries.
- CSV export and local Flask/Python analysis.
- Data-quality summaries and seven charts, including task-level and task-group coverage and heuristic lighting trends.
- A local, rule-based evidence guide for project FAQs and general eye-care next steps; it is not a generative AI model and never diagnoses.

No raw camera frames, camera device identifiers, or audio are saved or sent to the Python service. The local service processes only the numeric/session fields submitted by the browser.

## Run locally

Use two terminals from the project folder.

Terminal 1:
```bash
python -m pip install -r requirements.txt
python server.py
```

Terminal 2:
```bash
npm install
npm run dev
```

Open the Vite localhost URL printed in the terminal. Camera access requires localhost or HTTPS and browser permission.

Health check: `http://127.0.0.1:5000/api/health`.

## Tests

Run Python tests:
```bash
python -m unittest discover -s tests -v
```

Run the frontend production build:
```bash
npm run build
```

GitHub Actions runs the Python checks and Vite build on pushes and pull requests.

## Research limitations

- MediaPipe landmarks are not equivalent to calibrated gaze direction or ocular alignment.
- Relative iris features depend on camera geometry, face pose, lighting, and landmark quality.
- Head-rotation values are exploratory proxies; matrix conventions require independent validation.
- Bright-pixel candidates can arise from reflections, glasses, skin, sclera, and lighting. They are not proof of corneal reflections.
- Lighting flags use heuristic thresholds only; they are not validated participant-exclusion criteria.
- The current star-following sequence is an experimental task, not a clinical cover test or validated examination protocol.
- No diagnostic classifier or clinical threshold is implemented.

Do not claim diagnostic accuracy, sensitivity, specificity, or screening performance without an appropriately designed, independently supervised validation study and a suitable clinical reference standard.

## Participant privacy and research governance

Obtain the required school/competition approvals, parent/guardian permission, and participant assent before collecting data from minors. Minimize collected metadata, use coded participant IDs, store exports securely, and do not publish identifiable data. This prototype does not upload recordings to a remote service; the Flask endpoint is local-only by default.

## Project documentation

- [Data dictionary](docs/DATA_DICTIONARY.md)
- [External datasets and research references](docs/RESEARCH_DATASETS.md)
- [Research validation checklist](docs/VALIDATION_CHECKLIST.md)
- [Structured visual-following protocol v2](docs/PROTOCOL_V2.md)
- [Research libraries and dataset registry](docs/RESEARCH_RESOURCES.md)
- [Data pipeline and model-readiness plan](docs/DATA_PIPELINE.md)
- [Local research data instructions](data/README.md)
\n\n## Interface languages\n\nThe interface opens in Arabic (RTL) by default and includes an Arabic/English language switch. The selected language is stored locally in the browser.\n

## Medical evidence and design boundaries

The visual-following sequence is an experimental stimulus, not a validated medical test. Its star shape, colors, screen positions, and durations are interface/design choices. They must not be described as medically validated or used to infer normal eye movement or alignment.

The local assistant explains supported project topics and gives general next-step guidance based on the user's words. It does not use webcam measurements to make a referral decision, does not diagnose, and is not a generative large language model. Sudden new double vision, sudden eye misalignment, or sudden vision loss requires urgent medical assessment. A persistent concern about eye alignment or vision should be discussed with an eye-care professional.

Clinical references:
- AAO/AAPOS, Vision Screening for Infants and Children (2022): https://www.aao.org/education/clinical-statement/vision-screening-infants-children-2022
- AAO, Strabismus in Children (2026): https://www.aao.org/eye-health/diseases/strabismus-in-children
- AAO, Pediatric Eye Evaluations Preferred Practice Pattern: https://www.aaojournal.org/article/S0161-6420(22)00866-1/fulltext
- Royal College of Ophthalmologists, Emergency Eye Care Commissioning Guidance: https://www.rcophth.ac.uk/wp-content/uploads/2020/05/Emergency-Eye-Care-Commissioning-Guidance.pdf


## Local dataset audit utilities

The repository includes local-only tools to check an approved dataset manifest, file presence, exact duplicate files, missing metadata, unsafe paths, and participant-level split leakage. They do not train a model or infer clinical labels.

```bash
python tools/dataset_tools.py audit
python tools/dataset_tools.py split --seed 42
python -m unittest discover -s tests -v
```

Copy `data/manifests/dataset_manifest.template.csv` to `data/manifests/dataset_manifest.csv` locally and fill it with verified metadata. The `data/raw`, `data/interim`, `data/processed`, `data/splits`, and `data/reports` folders are local-only and ignored by Git. Never commit identifiable participant data or patient images/videos.


### Optional clinical-measurement reference download

`python tools/download_reference_data.py` downloads a small, CC BY 4.0 Figshare spreadsheet after verifying its metadata. It is anonymized tabular clinical measurement data, not image/video training data, and remains local under the ignored `data/raw/` directory.
