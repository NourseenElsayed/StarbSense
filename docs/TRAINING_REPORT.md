# StarbSense — Dataset Baseline Training Report

Exploratory image-classification baselines only. These results are not clinical validation and do not make the webcam/landmark prototype a diagnostic tool.

## Five-class dataset
- Images: 509; classes: esotropia 100, exotropia 104, hypertropia 102, hypotropia 93, normal 110.
- Split: 356 train / 51 validation / 102 held-out test, stratified by image. The archive has no participant/source IDs, so independence by person cannot be verified.
- Selected model: HOG features (grayscale 96×96) + RBF SVM, C=10.
- Held-out test: accuracy 65.7%, balanced accuracy 65.8%, macro-F1 0.655.
- Confusion matrix (esotropia, exotropia, hypertropia, hypotropia, normal): [[17,1,1,1,0],[5,11,1,1,3],[1,3,11,2,3],[3,1,0,13,2],[3,1,3,0,15]].

## Binary dataset
- Images: 1,525; strabismus 764, strabismus-free 761.
- Group audit: 635 source groups; no class+source group spans the provided train/validation/test folders.
- Fresh grouped split: 976 train / 244 validation / 305 held-out test.
- Selected model: HOG features (grayscale 96×96) + RBF SVM, C=1.
- Held-out test: accuracy 83.3%, balanced accuracy 83.2%, macro-F1 0.832.
- Confusion matrix (strabismus, strabismus-free): [[139,14],[37,115]].

## Interpretation and limitations
- The five-class archive has no participant/source IDs; its image-level split cannot establish generalization to unseen people.
- The binary export's numeric IDs are class-specific. Grouping by class plus source ID found no source group crossing the supplied splits; the fresh evaluation also kept groups together.
- Both datasets contain cropped, resized, contrast-adjusted and/or augmented images. These metrics do not establish performance on ordinary webcam images or real-world participants.
- Models accept pre-cropped eye-pair images and are HOG+SVM baselines. They are not connected to the browser webcam landmark stream and are not gaze/ocular-alignment models.
- Do not use these models to diagnose strabismus, decide whether someone needs a doctor, or replace an eye-care professional or clinical examination.
