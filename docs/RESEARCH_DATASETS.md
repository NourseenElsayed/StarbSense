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


## Additional strabismus-specific candidates reviewed (2026-11-24)

These are research leads, not datasets already downloaded or integrated. Access status and fit are kept separate.

| Dataset / study | Reported contents | Access status | StarbSense relevance / decision |
|---|---|---|---|
| **VD-ACTSE — Video Dataset Based on Automated Cover Tests for Strabismus Evaluation** | 24 videos, about 50 seconds each, 1280×720, 60 fps, recorded during automated cover tests. | Not a direct download. The host asks researchers to email hongfu@chuhai.edu.hk with subject “VD-ACTSE dataset request”. | **High conceptual fit** for cover-test motion analysis. Small sample; request access and documentation before use. |
| **West China Hospital AI strabismus platform cohort (Wu et al., 2024)** | 6,194 primary-gaze photographs with corneal light reflections: 2,938 exotropia, 1,415 esotropia, 739 vertical deviation, 1,562 orthotropia. | The paper describes the cohort, but the images are not offered as a public download in the paper record inspected. Contact authors for permission and data-sharing conditions. | **High image-label relevance**; not directly available for training at present. |
| **Strabismus-Net (npj Digital Medicine, 2026)** | 84,897 gaze photographs from 9,433 individuals for cross-validation and 10,458 photographs from 1,162 individuals for prospective testing. | The article reports dataset scale; public downloadable files and reuse license were not confirmed in the inspected source. Treat as author-controlled until verified. | **High research relevance**, but do not assume access or copy images. Contact authors / inspect full data-availability statement. |
| **AI-assisted Strabismus Recognition eye-tracking dataset** | Anonymized coordinate-based eye-tracking records during Alternate Cover Test; paper reports 50 participants (25 normal / 25 strabismus) and 335 ACT-cycle samples. No original patient videos. | Public GitHub repository is linked by the paper, but a clear repository reuse license was not identified in the inspected metadata. Obtain permission / license clarification before reuse. | **High motion-analysis relevance**, but a different sensor modality from StarbSense's webcam. Useful for method comparison only if terms permit. |

### Additional Kaggle audit

A targeted public-web search of Kaggle pages for the exact term **strabismus** and related eye-movement terms did not surface a Kaggle dataset with verified clinical strabismus labels. This is a bounded search result, not proof that no such dataset exists; Kaggle's logged-in search interface may surface user-specific or less-indexed results.

Kaggle results that are relevant to eye movement but **are not strabismus datasets**:

- **Eye Movements Verification and Identification Competition (EMVIC):** eye-movement biometric/identity task; its data are governed by competition rules, not a clinical strabismus label set. https://www.kaggle.com/c/emvic/data
- **Event-based Eye Tracking Challenge — CVPR 2025:** 13 subjects performing random viewing, saccades, reading, smooth pursuit and blinks; event-camera recordings, not clinical strabismus labels. https://www.kaggle.com/competitions/event-based-eye-tracking-cvpr-2025/data
- **MPIIGaze / Eye Gaze Estimation:** eye images with head-pose and gaze-angle information; gaze estimation, not strabismus diagnosis. https://www.kaggle.com/c/mp18-eye-gaze-estimation/data

If a Kaggle result is visible in a logged-in browser but not in public search, record its exact title and URL and inspect its files, labels, uploader, license, and provenance before adding it as a candidate. A Kaggle title or notebook mentioning “eye disease” is not evidence that it contains strabismus cases.

## Updated next steps

1. Request VD-ACTSE access from the listed contact and ask for its label schema, subject count, clinical reference standard, consent/ethics statement, and reuse terms.
2. Contact the West China and Strabismus-Net authors for data availability and written reuse conditions.
3. Inspect the eye-tracking repository's license and data dictionary before any copying or training.
4. Keep the Kaggle eye-movement competitions as **non-strabismus auxiliary references only**. Do not use them as positive/negative strabismus training labels.
5. Do not add raw patient photos/videos to this GitHub repository. If access is granted, store approved data outside the public repo and document a participant-level split and provenance manifest.

### Sources for this update

- VD-ACTSE dataset page: https://ssitrc.chuhai.edu.hk/index.php/2019/01/31/video-dataset-based-on-automated-cover-tests-for-strabismus-evaluation/
- Wu et al., *An artificial intelligence platform for the screening and managing of strabismus* (2024): https://pmc.ncbi.nlm.nih.gov/articles/PMC11543679/
- *Strabismus-Net* (2026): https://www.nature.com/articles/s41746-026-03334-6
- Eye-tracking paper and repository: https://pmc.ncbi.nlm.nih.gov/articles/PMC13025742/ ; https://github.com/hyunwoongko/strabismus-recognition
- Kaggle EMVIC: https://www.kaggle.com/c/emvic/data
- Kaggle Event-based Eye Tracking Challenge: https://www.kaggle.com/competitions/event-based-eye-tracking-cvpr-2025/data
- Kaggle MPIIGaze: https://www.kaggle.com/c/mp18-eye-gaze-estimation/data
- Kaggle dataset search guidance: https://www.kaggle.com/docs/datasets


### Kaggle follow-up search (additional terms, 2026-11-24)

A second pass searched Kaggle-indexed pages for **crossed eyes**, **eye alignment**, **ocular deviation**, **strabismus notebooks**, and Kaggle's public **Eyes and Vision** notebook category. The visible indexed results were predominantly retinal disease, cataract, drowsiness, open/closed-eye, and generic gaze-direction projects. No result inspected in this pass provided a verified clinical strabismus-labelled dataset.

- Kaggle's public **Eyes and Vision** notebook tag results include retinal-disease and drowsiness notebooks, among other eye-related projects; these are not evidence of strabismus labels: https://www.kaggle.com/code?tagIds=16403-Eyes+and+Vision
- The Kaggle **APTOS 2019 Blindness Detection** competition is a retinal fundus dataset for diabetic-retinopathy severity (0–4), not eye alignment or strabismus: https://www.kaggle.com/competitions/aptos2019-blindness-detection/data
- Kaggle's **Eye Movements Verification and Identification Competition** is about identifying people from eye-movement characteristics, not clinical strabismus: https://www.kaggle.com/c/emvic/data
- Kaggle's **Event-based Eye Tracking Challenge** has 13 subjects performing general eye-movement activities (including saccades and smooth pursuit), not strabismus assessment: https://www.kaggle.com/competitions/event-based-eye-tracking-cvpr-2025/data

**Search limitation:** Kaggle's logged-in dataset search may expose results not indexed by public search engines. The project team should add any candidate found in its live Kaggle session by pasting the exact dataset URL; then inspect its Data tab, file tree, labels, uploader, license, and source references. Do not infer clinical relevance from the title alone.
