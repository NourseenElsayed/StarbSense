# StarbSense research validation checklist

This checklist is a protocol-planning aid, not permission to conduct human-subject research. Obtain school/competition approval and required parent/guardian permission and participant assent before collecting data, especially from minors.

## A. Technical verification
- [ ] Frontend production build succeeds.
- [ ] Python dependencies install in a clean virtual environment.
- [ ] Flask health endpoint returns HTTP 200.
- [ ] Camera permission denial is handled without leaving the UI stuck.
- [ ] MediaPipe initializes and reports GPU/CPU fallback clearly.
- [ ] A complete session records samples for all nine tasks.
- [ ] Manual Stop still runs Python analysis on the partial session.
- [ ] CSV export includes a header and consistent columns.
- [ ] Python API rejects empty, malformed, and oversized requests.
- [ ] Browser refresh/page close releases camera tracks.

## B. Measurement and repeatability
- [ ] Compare recorded task timing with actual display timing.
- [ ] Verify landmark index mapping and left/right naming against annotated frames.
- [ ] Quantify missing-face and missing-iris rates by task.
- [ ] Examine coordinate distributions and out-of-range values.
- [ ] Test the impact of lighting, glasses, camera distance, head pose, and camera resolution.
- [ ] Repeat the same protocol under controlled conditions and quantify within-session and between-session variation.
- [ ] Compare webcam-derived features with an appropriate reference instrument/protocol under qualified supervision.

## C. Statistical design
- [ ] Define the research question and primary outcome before collecting data.
- [ ] Define inclusion/exclusion and data-quality rules before examining group outcomes.
- [ ] Keep all recordings from one participant in only one split if any model is trained.
- [ ] Report participant counts separately from frame/sample counts.
- [ ] Report confidence intervals and class balance when applicable.
- [ ] Use a held-out participant-level test set; do not tune thresholds on the test set.
- [ ] Avoid accuracy-only reporting; sensitivity, specificity, PPV, NPV, and confusion matrix require a valid reference label and adequate sample size.

## D. Clinical and ethical boundaries
- [ ] The project is described as a research prototype, not a diagnostic tool.
- [ ] Any reference labels come from a qualified clinician using an appropriate clinical examination.
- [ ] No participant is told that the prototype diagnosed or ruled out an eye condition.
- [ ] No raw face/eye images are retained unless explicitly approved and necessary.
- [ ] Coded identifiers and secure storage are used.
- [ ] Parent/guardian permission and participant assent are documented where required.
