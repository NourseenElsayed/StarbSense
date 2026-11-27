# Running the StarbSense image-model experiment

1. Download `starbsense_trained_baselines.zip`.
2. From the repository root, install dependencies and the model files:

```powershell
python -m pip install -r requirements.txt
python tools/install_trained_models.py "$env:USERPROFILE\Downloads\starbsense_trained_baselines.zip"
```

3. Start the backend in one PowerShell window: `python server.py`.
4. Start the frontend in a second window: `npm install` then `npm run dev`.
5. Open the Vite address shown in the terminal. In **Research model baselines**, choose a pre-cropped image containing both eyes, select an experiment, and press **Run image experiment**.

## Image requirements

- Upload one clear, tightly cropped image containing both eyes, not a full portrait.
- PNG, JPEG, or WebP; maximum request size 8 MB.
- The server decodes the image in memory, converts it to grayscale, resizes it to 96×96, computes HOG features, and passes those features to the selected SVM.
- Uploaded image bytes are not written to disk by this endpoint.
- The output contains a predicted dataset label and raw SVM decision scores. The scores are **not probabilities or confidence values**.

## Important boundary

This is an offline image-classification experiment, separate from the browser camera and MediaPipe landmark pipeline. It is not a clinical test and cannot diagnose or exclude strabismus or determine whether someone needs medical care. Full-face webcam frames are not a validated input to these models.
