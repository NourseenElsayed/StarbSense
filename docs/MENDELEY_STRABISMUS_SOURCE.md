# Mendeley Strabismus Detection Module — source review

## Source record

- Dataset: [Strabismus Detection Module, Mendeley Data v1](https://data.mendeley.com/datasets/4cbdg64773/1)
- DOI: https://doi.org/10.17632/4cbdg64773.1
- Published: 2025-05-27
- Contributors: Daniel Soto Rodriguez, Andres Eduardo Rivera Gomez, Ruthber Rodriguez Serrezuela
- Mendeley record license: CC BY 4.0 (verify the license attached to each reused component separately).

## What the Mendeley record describes

The record describes a proprietary set of 27 webcam facial images: 26 from people diagnosed with strabismus and one normal control. Images were acquired under controlled conditions with a chin rest and manually labelled based on clinical diagnosis. This 26:1 imbalance makes the 27-image set unsuitable as a training cohort or as a meaningful independent validation cohort.

The linked 2.52 GB project archive inspected for StarbSense contains application source, Raspberry Pi software, model artifacts, CAD/electronics assets, and documentation. It does not contain an identifiable folder of the 1,000 labelled training images described in the associated paper.

## Important distinction in the associated paper

The associated open-access paper, [Development of an embedded diagnostic tool for visual misalignment screening](https://pmc.ncbi.nlm.nih.gov/articles/PMC12478477/), separately reports:
- a 27-image functional-validation set (26 strabismus, 1 normal);
- a balanced 1,000-image dataset (500 strabismus, 500 normal) used for stratified 10-fold cross-validation;
- a reported mean cross-validation accuracy of 95.61%.

The paper does not establish that the 1,000-image cohort is included in the Mendeley archive inspected here or provide a verified public download for those images. Do not assume the 27-image Mendeley set is the 1,000-image training cohort. Request the authors' data availability details and reuse conditions before attempting to acquire that separate cohort.

## Model files in the project archive

- `NASNETLARGE.h5` and `NASNETLARGE.tflite` are two formats of the NASNetLarge model family; the supplied application code invokes the TFLite version.
- `Densenet201.h5` and `Densenet201.tflite` are present in the archive, but the inspected `main.py` does not invoke DenseNet201.
- The archive's inference code resizes its input to 331×331 and applies NASNet preprocessing. StarbSense's current HOG-SVM pipeline expects tightly cropped eye-pair images represented as 96×96 grayscale HOG features. These are different preprocessing and model-input contracts; the models must not be plugged into the existing endpoint without a separate, verified adapter and output-label map.
- The H5/TFLite artifacts are trained model weights, not the original labelled training images and not a recipe for retraining.

## StarbSense decision

**Registered as a literature/software reference; not added as training data and not wired into live inference.**

Do not train on the 27-image 26:1 set, merge its images into the existing Roboflow datasets, or report the paper's metrics as StarbSense results. Keep the existing StarbSense HOG-SVM artifacts unchanged.

A future separate experiment can be considered only after the authors confirm access to the 1,000-image cohort (or another appropriately documented image cohort), its license and consent conditions, label definitions, participant identifiers/grouping, and a participant-level split. Keep all raw face images local and outside public GitHub. Any result remains research-only and is not a medical diagnosis or validated screening result.

## References

- Mendeley Data v1: https://data.mendeley.com/datasets/4cbdg64773/1
- Associated paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC12478477/
