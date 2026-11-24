# External datasets: compatibility and access plan

This file records what StarbSense can responsibly use today. A dataset being public or carrying an open-looking label does **not** make it clinically valid or automatically compatible with the project. No external dataset is currently integrated into the StarbSense runtime or used to train its own model.

## Decision summary

| Dataset | Access / terms checked | Fit for StarbSense | Decision |
|---|---|---|---|
| **GazeBase v2.0** | Public Figshare download; CC BY 4.0; archive is about 6.25 GB | High-value reference for temporal eye-movement signal processing and repeated tasks, but it uses an EyeLink 1000 at 1,000 Hz and records the left eye. It is not a webcam dataset or a strabismus-labelled cohort. | **Use as a separate research benchmark** after downloading locally. Do not mix raw values with webcam measurements or claim clinical performance. |
| **InvisibleEye** | Public DaRUS record; CC BY-NC-SA 4.0; published test archive about 2.1 GB; non-commercial scientific use only | Close-up eye images with gaze-location annotations (over 280,000 images; 17 participants). Useful for studying image/annotation formats, but not a strabismus dataset and not the same camera setup. | **Optional research-only image benchmark**. Keep separate; respect non-commercial/share-alike terms. |
| **GazeCapture** | Research-use license; download requires registration and manual account activation | Mobile-device images/metadata with screen gaze targets from 1,474 subjects. Useful background for gaze-estimation methods, but not a strabismus dataset and not directly comparable to this webcam protocol. | **Do not automate download now**: account approval and license obligations apply. |
| **EYEDIAP** | Files restricted; access request requires an End-User License Agreement and an authorized institutional signatory with a professional email | RGB/RGB-D videos, head pose and eye tracking; useful for gaze/head-pose research, but not strabismus-labelled. | **Reference only for now**. Do not attempt access without an eligible institution/supervisor. |
| **Kaggle MPIIGaze / Eye Gaze Estimation competition** | The competition page says data are subject to competition rules. | Eye images plus head-pose and gaze-angle labels; potentially useful for gaze estimation, not strabismus screening. | **Hold** until the current competition/data rules explicitly permit the intended research reuse. |
| **Strabismus Recognition (hyunwoongko)** | Public GitHub repository, but no repository license was identified in the inspected metadata. | The associated paper reports anonymized coordinate-based eye-tracking data and is the closest topic match; its protocol uses an infrared eye tracker and Alternate Cover Test, unlike StarbSense's webcam star-following task. | **Do not copy, download for training, or redistribute yet**. Obtain explicit permission/license clarification and inspect data provenance first. |
| **Roboflow Universe: Strabismus (Strabimus)** | CC BY 4.0 shown on the dataset page; 509 images; five labels: NORMAL, ESOTROPIA, EXOTROPIA, HYPERTROPIA, HYPOTROPIA. The page has no substantive dataset description. | Closest small image-level strabismus candidate found on Roboflow, but source provenance, subject-level splits, label quality and clinical ground truth are not established. | **Candidate for manual review only**. Do not train or present as validated. If approved, download a version locally through Roboflow and record its exact version and citation. |
| **Roboflow Universe: Strabismus Eye Classification (first training)** | CC BY 4.0 shown; 635 images listed; two labels; no substantive dataset description. | Less informative label set and unclear provenance. | **Do not prioritize** over the 509-image candidate. |
| **Roboflow Universe: eyes-pmves/strabismus** | CC BY 4.0 shown; small dataset listing (59 images; page reports 92 images for the model dataset). | Very small and internally inconsistent counts; page reports an 83.3% model accuracy without enough evaluation context. | **Do not use for training or performance claims**. |

## What is actually added to this repository

- This catalog and the local data-folder instructions are documentation only.
- No participant images, videos, or multi-gigabyte archives are committed to GitHub.
- No third-party model or dataset is connected to the StarbSense application.
- The app's existing MediaPipe Face Landmarker remains a general facial-landmark model, not a trained strabismus classifier.

## Recommended next order

1. Start with **GazeBase v2.0** for offline signal-processing exploration because its download is public and its CC BY 4.0 terms are stated by the publisher. Treat its EyeLink signals as a separate modality.
2. If an image benchmark is needed, manually inspect **Roboflow Strabismus (Strabimus)** first. Before any training, inspect the downloaded export for duplicates, near-duplicates, class balance, subject overlap, image origin, label meaning and split leakage. A dataset-level CC BY 4.0 label does not prove medical-label quality.
3. Consider **InvisibleEye** only for non-commercial scientific image/gaze experiments, not for strabismus classification.
4. Leave GazeCapture, EYEDIAP, Kaggle MPIIGaze and the strabismus-recognition repository on hold until their access/license conditions are satisfied.

## Important validation boundaries

- Never describe these datasets as proving that StarbSense detects or diagnoses strabismus.
- Do not combine gaze direction, eye-movement events, facial landmarks and clinical strabismus labels as interchangeable targets.
- Split by participant, not by frame/image, to reduce identity leakage.
- Keep source datasets unchanged; save derived features and experiments in separate folders with a reproducible manifest.
- Any future clinical evaluation needs appropriate ethics/consent, a qualified eye-care professional's reference assessment, and independent participant-level validation.

## Source links and citations

- GazeBase Figshare record: https://doi.org/10.6084/m9.figshare.12912257
- GazeBase data descriptor: https://doi.org/10.1038/s41597-021-00959-y
- InvisibleEye DaRUS record: https://doi.org/10.18419/DARUS-3288
- GazeCapture download page: https://gazecapture.csail.mit.edu/download.php
- GazeCapture repository and research license: https://github.com/CSAILVision/GazeCapture
- EYEDIAP access and description: https://www.idiap.ch/en/dataset/eyediap
- Kaggle MPIIGaze competition data: https://www.kaggle.com/c/mp18-eye-gaze-estimation/data
- Strabismus-recognition paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC13025742/
- Strabismus-recognition repository: https://github.com/hyunwoongko/strabismus-recognition
- Roboflow Strabismus (Strabimus): https://universe.roboflow.com/strabimus/strabismus-d1pgd
- Roboflow Strabismus Eye Classification: https://universe.roboflow.com/first-training-asi3d/strabismus-eye-classification-rulhf
- Roboflow eyes-pmves: https://universe.roboflow.com/eyes-pmves/strabismus
