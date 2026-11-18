# External datasets and research references

These resources can inform methods and benchmarking. They are **not automatically compatible with StarbSense** and none of them establishes clinical validity for this prototype.

## Strabismus-specific research data

- **Lee (2026), “AI-Assisted Strabismus Diagnosis Using Eye-Tracking and Machine Learning.”** The article reports an anonymized coordinate-based eye-tracking dataset and source code at [hyunwoongko/strabismus-recognition](https://github.com/hyunwoongko/strabismus-recognition). The paper describes a 60 Hz infrared eye tracker and Alternate Cover Test (ACT) protocol, with a final 50-person cohort and participant-level train/test split. This is the closest topical comparator found. Before using any repository data, inspect its exact data files, license, provenance, label definitions, and permitted use. Its hardware/protocol differs from this webcam star-following prototype; do not merge datasets or treat the published results as StarbSense performance.
  - Paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC13025742/
  - Dataset/code: https://github.com/hyunwoongko/strabismus-recognition

## General gaze / eye-tracking datasets

- **GazeCapture (2016):** https://github.com/CSAILVision/GazeCapture. Official release includes images and metadata for 1,474 subjects, including screen target positions and face/eye detection flags. Its repository states research-use licensing and asks users to cite the CVPR paper. It is a mobile-device gaze dataset, not a strabismus dataset and not directly equivalent to webcam landmark streams.
- **InvisibleEye (2024):** https://doi.org/10.18419/DARUS-3288. More than 280,000 close-up eye images with gaze-location annotations from 17 participants. Useful for understanding gaze-label data structure; sensor and image scale differ from this project.
- **GazeBase (2021):** https://doi.org/10.1038/s41597-021-00959-y. Longitudinal eye-movement recordings from 322 college-aged participants using a 1,000 Hz EyeLink system. Useful as a reference for repeated-session/task design, not as a direct webcam comparison.
- **U2Eyes (2019):** https://openaccess.thecvf.com/content_ICCVW_2019/papers/OpenEDS/Porta_U2Eyes_A_Binocular_Dataset_for_Eye_Tracking_and_Gaze_Estimation_ICCVW_2019_paper.pdf. A binocular gaze-estimation dataset; useful for reviewing binocular annotation approaches, not strabismus diagnosis.

## How to use external data responsibly

1. Keep each dataset in its original format and preserve its license and citation.
2. Do not combine labels from different protocols as if they meant the same thing.
3. Do not train or report a clinical classifier from a dataset unless the label definitions, participant-level split, permissions, and evaluation design are appropriate.
4. Treat external datasets as literature/method references unless a specific compatible, permitted benchmark is formally designed.
5. Do not download or commit large participant datasets or images into this source repository. Keep approved data in access-controlled storage.
