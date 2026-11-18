# StarbSense

**StarbSense** is an experimental, child-friendly visual-tracking research prototype developed for an ISEF project focused on exploring eye-movement and facial-landmark data.

## What it currently does

- Guides a participant through a short visual-target-following activity.
- Uses MediaPipe Face Landmarker to collect facial landmarks and iris landmark coordinates.
- Calculates exploratory iris-position metrics relative to eye-corner axes.
- Records experimental head-rotation proxies from facial transformation matrices.
- Uses OpenCV.js for exploratory bright-pixel candidate analysis around eye regions.
- Exports session measurements as CSV.
- Sends session samples to a local Flask/Python service for data-quality summaries and plots.

## Technology

- Frontend: Vite, JavaScript, MediaPipe Tasks Vision, OpenCV.js, Chart.js
- Analysis service: Python, Flask, pandas, NumPy, Matplotlib

## Run locally

Install JavaScript dependencies:

```bash
npm install
```

Install Python dependencies in a virtual environment:

```bash
python -m pip install -r requirements.txt
```

Start the Python analysis service in one terminal:

```bash
python server.py
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open the local Vite address printed in the terminal. Camera access requires localhost or HTTPS and the participant's permission.

## Research and safety limitations

StarbSense is a research prototype, **not a medical device or diagnostic system**. Its landmark coordinates, relative iris metrics, head-rotation proxies, and bright-pixel candidates are exploratory measurements. They have not been clinically validated to diagnose, screen for, or rule out strabismus or any other eye condition.

Do not interpret the generated charts as a clinical result. Any research involving children should follow the applicable school, competition, ethics, privacy, and informed-consent requirements. Avoid publishing identifiable participant data or raw session CSV files.

## Current development status

The project is under active development. Results depend on camera quality, lighting, participant positioning, model performance, and the quality of the collected samples. Validation against an appropriate reference protocol and expert review are required before making research-performance claims.
