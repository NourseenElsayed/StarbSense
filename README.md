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
- Data-quality summaries and six charts, including task-level coverage and heuristic lighting trends.

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
\n\n## Interface languages\n\nThe interface opens in Arabic (RTL) by default and includes an Arabic/English language switch. The selected language is stored locally in the browser.\n