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


## Expanded strabismus-specific audit (2026-11-24)

This section adds studies and data records found in the expanded search. A published cohort is not automatically a downloadable dataset. "Public paper", "public code", and "public data" are separate access states.

| Resource | What the source actually reports | Availability / rights check | Decision for StarbSense |
|---|---|---|---|
| **Mendeley Data — Strabismus Detection Module** | 27 webcam facial images: 26 clinically diagnosed strabismus cases and 1 normal control. The page describes a chin-rest-controlled capture workflow and says labels were assigned from clinical diagnosis. | Mendeley page offers "Download All" and displays CC BY 4.0 for the dataset. The severe 26:1 imbalance makes it unsuitable as a training/evaluation cohort. The page describes facial images; treat them as sensitive health-related imagery and do not mirror them in this public repository. | **Downloadable candidate for metadata/pipeline inspection only after adult/supervisor review of privacy and terms. Do not train or report accuracy from it.** |
| **Pusan National University Yangsan Hospital cohort (Joo et al., 2024)** | 2,249 source face images (996 normal, 1,253 strabismus); after cropping and review by 10 medical professionals, the study retained 900 normal and 896 strabismus images with at least 5/10 agreement. | The article describes hospital-collected data used by the researchers; it does not provide a public download. The public GitHub link is the experimental code, not the patient-image dataset. | **Strongly relevant clinically curated cohort, but author/institution permission is required. Do not assume the images are public.** |
| **Huang et al. (2021), image-processing screening study** | The article reports results on 60 images (30 normal, 30 strabismus) and provides a supplementary TIF figure/file. | The article says relevant data are in the manuscript and supplementary information. The supplementary item is a figure/result file, not confirmed as a clean, individually labelled image archive. | **Useful for reproducing/understanding the published method; not yet a confirmed trainable dataset. Inspect supplementary material before any reuse.** |
| **Santos et al. (2025), Cover Test video analysis** | The paper reports CV-I with 13 volunteer videos and CV-II with 57 volunteer videos. Its highlights also say a new dataset was acquired with 123 volunteers; these figures do not reconcile from the accessible abstract. The work uses Alternate Cover Test videos and YOLOv5 for eye/occluder detection. | No public raw-video download or reuse license was confirmed in the accessible article record. Request the authors' data dictionary, participant-level counts, reference labels, consent/ethics details, and reuse terms. | **Top research lead for video-based analysis, but not an accessible dataset yet. Resolve the 123 vs 13+57 count discrepancy before citing a final cohort size.** |
| **Zheng et al. (2019), Intelligent evaluation of strabismus in videos** | Describes an infrared-camera video database containing both strabismic and normal participants and an automated cover-test analysis pipeline. | The institutional repository provides the paper PDF, not a verified raw-video dataset download. | **Important method reference; raw database access must be requested.** |
| **AI-assisted strabismus eye-tracking (2026)** | Anonymized coordinate-based eye-tracking records during Alternate Cover Test; the paper reports 50 participants and 335 valid ACT-cycle samples. | The paper links a public GitHub repository. GitHub repository metadata currently reports no license (license field is null); public visibility alone does not grant reuse rights. | **Do not copy, train on, or redistribute until the authors clarify the license.** |
| **Beijing Tongren wearable eye-tracking study (2025)** | Study of intermittent strabismus using wearable eye tracking; reports screening results and eye-movement features. | The paper's data availability statement says subject eye-image data cannot be shared due to privacy. | **Literature/method reference only; not a dataset source.** |
| **Strabismus-Net (2026)** | Reports a large gaze-photograph cohort and prospective test cohort. | A public downloadable archive and reuse license remain unconfirmed from the source inspected. | **Author-controlled until an explicit data-access route and license are verified.** |

### Kaggle audit — current conclusion

The expanded public-web search used exact and related terms including `strabismus`, `crossed eyes`, `esotropia`, `exotropia`, `ocular deviation`, `cover test`, and `eye movement`, scoped to Kaggle dataset and competition pages. It did not surface a Kaggle dataset whose files and labels could be verified as clinically diagnosed strabismus data.

This is **not proof that Kaggle contains no such dataset**. Kaggle's authenticated dataset search and account-specific/private/shared results are not visible to this research session. The user reports that a teammate can see a candidate in a logged-in Kaggle session. That exact candidate must be added only after receiving its direct URL or slug and checking:
- the Data tab and complete file tree (not just the title or notebook text);
- actual sample images/videos and label files;
- uploader/source references and whether labels came from an ophthalmologist or a documented clinical test;
- participant counts, class counts, duplicates, and participant-level splits;
- dataset license, third-party image rights, and permitted research/training use;
- whether the data are patient-identifiable or include minors.

Until those checks pass, do not add a Kaggle result as a confirmed strabismus dataset. Kaggle's own documentation explains that dataset owners choose visibility and license, and that users should inspect the dataset page and files: https://www.kaggle.com/docs/datasets.

### Important corrections and access boundaries

- The 2024 Pusan study's 2,249 collected images are **not** a public dataset merely because the paper and its code are public. The curated experimental subset described in the article is 900 normal + 896 strabismus images.
- The 2025 Cover Test paper contains an unresolved count discrepancy in the accessible record: the highlights mention 123 volunteers, while the described CV-I and CV-II video databases contain 13 and 57 volunteers respectively. Do not repeat "123 videos" or claim a 123-person public dataset.
- Mendeley's 27-image set is downloadable and lists CC BY 4.0, but its 26:1 class imbalance and face imagery make it inappropriate for meaningful model validation. Dataset availability does not remove privacy or ethics obligations.
- The 2021 supplementary TIF is not confirmed to be a machine-readable archive of 60 separate images.
- The 2026 eye-tracking GitHub repository has no license declared in its repository metadata. Obtain permission before reuse.
- Do not place raw patient photos, eye videos, or identity-bearing metadata in this public GitHub repository.

### New sources

- Mendeley Data, Strabismus Detection Module: https://data.mendeley.com/datasets/4cbdg64773/1
- Joo et al. (2024), Pusan cohort and expert consensus: https://pmc.ncbi.nlm.nih.gov/articles/PMC11125505/
- Huang et al. (2021), image-processing study and supplementary data statement: https://pmc.ncbi.nlm.nih.gov/articles/PMC8330949/
- Santos et al. (2025), cover-test video analysis: https://www.sciencedirect.com/science/article/pii/S0952197625011625
- Zheng et al. (2019), institutional repository record: https://ira.lib.polyu.edu.hk/handle/10397/80651
- 2026 eye-tracking study and data statement: https://pmc.ncbi.nlm.nih.gov/articles/PMC13025742/
- Beijing Tongren wearable eye-tracking study: https://pmc.ncbi.nlm.nih.gov/articles/PMC11852461/
- Kaggle dataset documentation: https://www.kaggle.com/docs/datasets


## Follow-up audit and implementation plan (2026-11-24)

### Additional leads found

| Source | Verified information | Access status | Suitability |
|---|---|---|---|
| **Santos et al. (2025), Automated diagnosis using cover-test video analysis** | The article reports a new cover-test video dataset and experiments on two video datasets. Its highlights mention 123 volunteers, while accessible descriptions of CV-I and CV-II report 13 and 57 volunteers; this discrepancy must be resolved with the authors. | Article is public; no verified public raw-video download or dataset license found. | **High scientific relevance; not yet an accessible dataset.** Request participant counts, labels, reference clinical measurements, ethics/consent and data-use terms. |
| **Joo et al. / Pusan National University Yangsan Hospital (2024)** | 2,249 collected face images (996 normal, 1,253 strabismus); the expert-reviewed experimental subset described in the paper contains 900 normal and 896 strabismus images. | Hospital research cohort; no public image archive confirmed. Public paper/code does not imply public patient-image access. | **High relevance, permission required.** |
| **Mendeley Data — Strabismus Detection Module** | 27 webcam face images, 26 strabismus and 1 normal; page describes clinical-diagnosis labels and controlled capture. | Dataset page provides downloadable files and lists CC BY 4.0. | **Pipeline/format inspection only.** Severe imbalance prevents meaningful model training or evaluation. Treat face images as sensitive; do not mirror to public GitHub. |
| **Zheng et al. (2019), Intelligent evaluation of strabismus in videos** | Paper describes infrared video during automated cover testing and a database containing normal and strabismic participants. | Open-access paper/PDF confirmed; raw video database download not confirmed. | **Method reference and author-contact lead, not an acquired dataset.** |
| **Roboflow — strabismus eye classification (first training)** | Page reports 635 images, two classes (strabismus / strabismus_free); a separate version page shows 1,525 total after preprocessing/augmentation. | CC BY 4.0 shown on page; public dataset page. | **Exploratory only.** No published source/provenance or clinical label protocol; versions and counts differ. Inspect original images and duplicates before any use. |
| **Roboflow — strabismus classification (eyes)** | Model page shows 59 images, two classes (normal / crossed), while model's linked dataset reports 92 images. | CC BY 4.0 shown. | **Too small and provenance unclear; not for validation.** |
| **Roboflow — STRABISMUS (2025)** | Dataset page shows a 110-image v1 and a 210-image v2; page lists CC BY 4.0. | Download option shown; license displayed. | **Exploratory only.** Class counts and clinical source/ground truth not established by the page. |
| **Roboflow — strabismus object detection** | Page exposes versions with 148 and 254 images and downloadable object-detection formats. | CC BY 4.0 shown. | **Potential eye/region annotation resource only.** Object boxes are not equivalent to a clinical strabismus diagnosis. |

### Kaggle: what can and cannot be concluded

Searches were run for Kaggle dataset/competition pages using the terms `strabismus`, `esotropia`, `exotropia`, `crossed eyes`, `ocular deviation`, and `cover test`. No result surfaced whose actual data files and labels could be verified as a clinically diagnosed strabismus dataset.

This is a bounded search result, **not proof that no such Kaggle dataset exists**. Search engines may not index all Kaggle datasets, and logged-in/private/shared results may differ. A teammate-reported Kaggle candidate remains unverified until its direct URL or slug and Data-tab file list are supplied. Do not label any Kaggle result as a strabismus dataset based on its title alone.

For any Kaggle candidate, verify: actual files and sample content; labels and their clinical source; class/participant counts; whether images are duplicated or augmented copies; participant-level splits; license and source rights; and whether identifiable or minor patient data are present. Do not upload raw face/eye imagery to the public project repository.

### Recommended data strategy for StarbSense

1. **Keep modalities separate.** A face-photo classifier, an eye-region detector, eye-tracking coordinates, and cover-test video analysis are different tasks. Do not combine their labels into one training set as if they were interchangeable.
2. **Primary research direction:** cover-test video / eye movement with clinical reference measurements, because this is closer to a movement-based protocol. The existing star-following webcam task is not itself a clinical cover test.
3. **Secondary direction:** frontal face/eye photographs with ophthalmologist-confirmed labels, kept as a separate image-classification experiment.
4. **Create a data manifest before training.** For each sample record only a pseudonymous participant ID, source, modality, label, label provenance, capture conditions, permitted-use status, and split. Keep identifying keys separately under supervisor-controlled storage.
5. **Use participant-level splits.** All images/video frames from one participant must stay in a single split to prevent leakage. Avoid frame-random splits.
6. **Do not infer detailed subtype labels.** Use only the classes and clinical definitions explicitly supplied by the source. Record laterality, direction, intermittency, fixation condition, and prism-diopter measurement only when the dataset actually provides them.
7. **Baseline before deep learning.** First inspect quality and class balance, then establish a simple, transparent baseline. Report sensitivity, specificity, balanced accuracy, confusion matrix, and confidence intervals; do not rely on accuracy alone.
8. **Independent review.** A qualified ophthalmologist must review the protocol, reference labels, and any intended interpretation. Any prototype output remains research-only and must not claim to diagnose or rule out strabismus.
9. **No raw patient data in public GitHub.** Store only scripts, schemas, synthetic examples, and non-identifying aggregate results in the repository.

### Current acquisition status

- Public papers and dataset landing pages have been identified.
- No raw clinical dataset has been downloaded into StarbSense in this audit.
- No new images/videos have been committed to GitHub.
- No strabismus classifier has been trained or integrated.
- Author-controlled sources still require permission and documented terms.
- Kaggle candidate from the teammate remains pending its exact URL.

### New references

- Santos et al. (2025), cover-test video analysis: https://www.sciencedirect.com/science/article/pii/S0952197625011625
- Joo et al. (2024), AI-assisted strabismus platform: https://pmc.ncbi.nlm.nih.gov/articles/PMC11543679/
- Mendeley Data, Strabismus Detection Module: https://data.mendeley.com/datasets/4cbdg64773/1
- Zheng et al. (2019), automated cover-test video evaluation: https://ira.lib.polyu.edu.hk/handle/10397/80651
- Roboflow, first-training strabismus eye classification: https://universe.roboflow.com/first-training-asi3d/strabismus-eye-classification-rulhf
- Roboflow, eyes strabismus classification: https://universe.roboflow.com/eyes-pmves/strabismus
- Roboflow, STRABISMUS 2025: https://universe.roboflow.com/strabismus-enwec/strabismus-kp1mq
- Roboflow, strabismus object detection: https://universe.roboflow.com/strabismus/strabismus-gjnif
