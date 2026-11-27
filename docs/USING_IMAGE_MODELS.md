# StarbSense image-model inference from live sessions

1. Download `starbsense_trained_baselines.zip`.
2. From the repository root, install dependencies and the model files:

```powershell
python -m pip install -r requirements.txt
python tools/install_trained_models.py "$env:USERPROFILE\Downloads\starbsense_trained_baselines.zip"
```

3. Start the backend in one PowerShell window: `python server.py`.
4. Start the frontend in a second window: `npm install` then `npm run dev`.
5. Open the Vite address shown in the terminal, allow camera access, and complete the guided session. StarbSense automatically crops eye-pair images from the live camera at protocol stages. After the session, it analyzes up to five evenly distributed valid crops with both models and displays the per-frame vote summary. No manual image upload is required.

## Image requirements

- The browser captures one eye-pair crop at eligible protocol stages from the live camera stream.
- At least three valid eye-pair crops are required; up to five evenly distributed crops are analyzed.
- Each crop is sent to the local Flask service as JPEG; maximum request size is 8 MB.
- The server decodes the image in memory, converts it to grayscale, resizes it to 96×96, computes HOG features, and passes those features to the selected SVM.
- Submitted crop bytes are processed in memory and are not written to disk by the prediction endpoint.
- The app summarizes per-frame predicted labels by majority vote. Ties are reported as inconclusive; raw SVM decision scores are not probabilities or confidence values.

## Important boundary

The image classifiers were trained as exploratory baselines on external static-image datasets, then are applied experimentally to cropped eye-pair images from a live session. This camera-to-dataset domain transfer has not been validated. The result is not a clinical test and cannot diagnose or exclude strabismus or determine whether someone needs medical care.
