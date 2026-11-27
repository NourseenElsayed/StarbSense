# StarbSense offline image-model baseline results

These are exploratory image-classification baselines trained offline from the two supplied static-image archives. The current app can apply the trained models to selected eye-pair crops captured during a live browser session, but the models were not trained on webcam data and this camera-to-dataset transfer has not been validated.

## Binary experiment

- Dataset: 1,525 images; 764 labelled `strabismus`, 761 labelled `strabismus_free`.
- Split: grouped stratified, approximately 64/16/20; 976 train, 244 validation, 305 test.
- Grouping: class plus numeric source-image ID; 635 source groups; no group crossed the supplied train/validation/test folders in the audit.
- Features/model: OpenCV HOG, grayscale 96×96; RBF SVM (C=1).
- Test accuracy: 83.28%.
- Balanced accuracy: 83.25%.
- Macro-F1: 0.8317.
- Confusion matrix, label order [strabismus, strabismus_free]: [[139,14],[37,115]].

## Five-class experiment

- Dataset: 509 images: esotropia 100, exotropia 104, hypertropia 102, hypotropia 93, normal 110.
- Split: stratified random image split, 356 train, 51 validation, 102 test.
- Participant/source IDs were not available, so participant-level independence cannot be verified.
- Features/model: OpenCV HOG, grayscale 96×96; RBF SVM (C=10).
- Test accuracy: 65.69%.
- Balanced accuracy: 65.80%.
- Macro-F1: 0.6546.
- Confusion matrix, label order [esotropia, exotropia, hypertropia, hypotropia, normal]:
  [[17,1,1,1,0],[5,11,1,1,3],[1,3,11,2,3],[3,1,0,13,2],[3,1,3,0,15]].

## Pipeline boundary

Both models consume pre-cropped eye-pair images. The app now automatically sends up to 17 valid protocol-stage crops from the current camera session to the local inference endpoint and summarizes per-frame votes; the models do not consume MediaPipe landmark CSVs. They have not been validated on ordinary webcam recordings or against an independent clinical reference standard. These metrics are dataset-specific experimental results, not clinical performance estimates. Do not use the models to diagnose or rule out an eye condition or decide whether someone needs medical care.
