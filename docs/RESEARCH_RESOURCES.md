# StarbSense research resources

This registry records external tools and datasets that may support research planning. Listing a resource does **not** mean its data has been downloaded, approved, integrated, or validated with StarbSense.

## Libraries already used by the project

| Component | Role in StarbSense | Notes |
|---|---|---|
| MediaPipe Tasks Vision / Face Landmarker | Detects face and eye-region landmarks in the browser | Landmark coordinates are not calibrated gaze or ocular-alignment measurements. |
| OpenCV.js | Experimental image-feature processing | Bright-pixel candidates are not verified corneal reflections. |
| Chart.js | Session plots | Visualizes recorded values; it does not validate their meaning. |
| NumPy, pandas, Matplotlib | Local Python analysis | Used for tabular summaries, descriptive statistics, and charts. |
| Flask | Local analysis API | Receives derived numeric session fields for analysis and selected cropped eye-pair images for in-memory model inference. |

Do not add libraries only to make the dependency list longer. A new dependency should solve a documented research or engineering need, have a compatible license, and be covered by tests.

## External datasets worth evaluating

### 1. Strabismus recognition research repository

- Repository: https://github.com/hyunwoongko/strabismus-recognition
- Related paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC13025742/
- The paper describes an anonymized coordinate-based eye-tracking dataset and associated code.
- Potential value: disease-specific research context and a starting point for understanding published eye-tracking features.
- Compatibility warning: the reported protocol uses a dedicated infrared eye tracker and clinical reference information. It is not interchangeable with StarbSense webcam landmarks.
- Before any use: inspect the repository's exact data license, task protocol, participant population, labels, and permitted redistribution. Do not treat its labels as directly applicable to StarbSense.

### 2. GazeCapture

- Official repository: https://github.com/CSAILVision/GazeCapture
- Dataset and access information: https://gazecapture.csail.mit.edu/download.php
- Potential value: webcam/mobile gaze-estimation research and model-development context.
- License note: the official repository states that the released code, models, and data are for research purposes only.
- Compatibility warning: gaze-to-screen prediction is not a strabismus diagnosis or clinical ocular-alignment reference.

### 3. GazeBase

- Paper: https://www.nature.com/articles/s41597-021-00959-y
- Data record: https://doi.org/10.6084/m9.figshare.14761866
- The paper describes 12,334 monocular recordings from 322 college-aged participants, collected using an EyeLink 1000 at 1,000 Hz, with fixation, horizontal saccade, oblique saccade, reading, video-viewing, and gaming tasks.
- Potential value: task design, eye-movement signal quality, temporal analysis, and reproducibility.
- Compatibility warning: it is a dedicated eye-tracker dataset from college-aged participants, not webcam facial-landmark data and not a pediatric strabismus dataset.

### 4. EYEDIAP

- Official dataset page: https://www.idiap.ch/en/dataset/eyediap
- The dataset provides RGB/RGB-D recordings, head pose, eye tracking, and target coordinates across 94 sessions from 16 participants.
- Potential value: gaze-estimation benchmarking, target-following task ideas, head-pose variation, and recording-condition analysis.
- Compatibility warning: the sensor setup and calibration differ from a typical laptop webcam.

### 5. InvisibleEye

- Official data record: https://darus.uni-stuttgart.de/dataset.xhtml?persistentId=doi:10.18419/DARUS-3288
- The dataset contains more than 280,000 close-up eye images with gaze-location annotations from 17 participants.
- Potential value: eye-region image research and gaze-label methodology.
- Compatibility warning: close-up eye images are not equivalent to full-face webcam frames or strabismus labels. The dataset is large and should not be downloaded into this project without a clear need and storage plan.

## Library candidates and decisions

### Keep as the core stack
- MediaPipe Face Landmarker for face/iris landmark extraction.
- OpenCV.js for explicitly experimental image processing.
- Chart.js for browser-side visualizations.
- NumPy/pandas/Matplotlib for transparent descriptive analysis.

### Evaluate only when a research question requires it
- scikit-learn: only after a suitable, permissioned, labelled dataset and participant-independent validation plan exist. Do not train a diagnostic classifier on the current StarbSense session logs.
- SciPy: useful for signal-processing methods if a prespecified analysis requires them; add tests and document assumptions first.
- A dedicated gaze-estimation library: only after checking its license, maintenance status, calibration requirements, browser support, and whether its outputs answer the research question.

### WebGazer.js caution
- Project: https://github.com/brownhci/WebGazer
- It estimates gaze from webcam interaction and calibration, but the project reports that official maintenance ended on February 24, 2026.
- Its repository is GPL-3.0. Review the license implications before considering it for this project.
- It is a gaze-estimation tool, not a strabismus diagnostic system.

## Data integration policy

1. Keep external datasets separate from participant data collected by StarbSense.
2. Never combine datasets merely because they contain columns named x/y or gaze.
3. Record each dataset's sensor, frame rate, calibration, target protocol, population, labels, license, and intended use.
4. Do not redistribute external data or pretrained weights unless their license explicitly permits it.
5. Split training and evaluation by participant, not randomly by frame, to reduce participant leakage.
6. Use a clinical reference standard and qualified supervision before making any clinical-performance claim.
7. Keep identifiable images and videos out of public repositories. For research with minors, obtain required approvals, guardian permission, and participant assent.

## Current integration status

No external dataset listed above has been imported into the StarbSense repository. The resources are documented for careful evaluation only.
