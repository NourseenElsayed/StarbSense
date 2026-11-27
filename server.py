from flask import Flask, jsonify, request
from pathlib import Path
import base64
import csv
import tempfile

import cv2
import joblib
import numpy as np

from analyze_starb_sense import analyze

app = Flask(__name__)

ROOT_DIR = Path(__file__).resolve().parent
MODEL_DIR = ROOT_DIR / "models"
MAX_ROWS = 5000
MAX_IMAGE_PIXELS = 20_000_000
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
ALLOWED_ORIGIN = "http://127.0.0.1:5173"
_IMAGE_MODELS_CACHE = None

CHART_FILES = {
    "face_detection_chart": "face_detection_by_task.png",
    "iris_coordinates_chart": "iris_coordinates_over_time.png",
    "relative_iris_chart": "relative_iris_over_time.png",
    "head_rotation_chart": "head_rotation_over_time.png",
    "relative_iris_task_chart": "relative_iris_by_task.png",
    "lighting_quality_chart": "lighting_quality_over_time.png",
    "task_group_chart": "technical_data_availability_by_task_group.png",
}

MODEL_FILES = {
    "binary": "binary_grouped_hog_svm.joblib",
    "five_class": "five_class_hog_svm.joblib",
}

MODEL_LABELS = {
    "binary": ["strabismus", "strabismus_free"],
    "five_class": ["esotropia", "exotropia", "hypertropia", "hypotropia", "normal"],
}


@app.after_request
def add_headers(response):
    origin = request.headers.get("Origin")
    if origin == ALLOWED_ORIGIN:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Vary"] = "Origin"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Request is too large. Reduce the session sample count or image size."}), 413


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "StarbSense research analysis server",
    })


def load_image_models():
    """Load local, user-installed model artifacts once per server process."""
    global _IMAGE_MODELS_CACHE
    if _IMAGE_MODELS_CACHE is not None:
        return _IMAGE_MODELS_CACHE

    missing = [
        filename for filename in MODEL_FILES.values()
        if not (MODEL_DIR / filename).is_file()
    ]
    if missing:
        raise FileNotFoundError(
            "Model files are not installed. Extract the supplied trained-models ZIP "
            "into the project root so the files appear under models/."
        )

    loaded = {}
    for task, filename in MODEL_FILES.items():
        artifact = joblib.load(MODEL_DIR / filename)
        if not isinstance(artifact, dict) or "model" not in artifact:
            raise ValueError(f"Invalid model artifact: {filename}")
        if list(map(str, artifact.get("labels", []))) != MODEL_LABELS[task]:
            raise ValueError(f"Unexpected class labels in {filename}")
        loaded[task] = artifact
    _IMAGE_MODELS_CACHE = loaded
    return loaded


def extract_eye_pair_features(image_bytes):
    """Apply the 96x96 grayscale HOG representation used by the baselines."""
    encoded = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("The uploaded file is not a readable image.")

    height, width = image.shape[:2]
    if height < 32 or width < 32:
        raise ValueError("Image is too small. Upload a clear, tightly cropped eye-pair image.")
    if height * width > MAX_IMAGE_PIXELS:
        raise ValueError("Image dimensions are too large. Resize the image before uploading.")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (96, 96), interpolation=cv2.INTER_AREA)
    hog = cv2.HOGDescriptor((96, 96), (16, 16), (8, 8), (8, 8), 9)
    features = hog.compute(resized)
    if features is None or features.size != 4356:
        raise ValueError("Could not calculate the expected image features.")
    return features.reshape(1, -1)


@app.get("/api/model-health")
def model_health():
    missing = [
        filename for filename in MODEL_FILES.values()
        if not (MODEL_DIR / filename).is_file()
    ]
    return jsonify({
        "available": not missing,
        "tasks": list(MODEL_FILES.keys()) if not missing else [],
        "missing_files": missing,
        "message": "Models ready." if not missing else "Install the trained model files in the local models/ folder.",
    })


@app.post("/api/model-predict")
def predict_eye_pair_image():
    if "image" not in request.files:
        return jsonify({"error": "Choose an eye-pair image to upload."}), 400

    image_file = request.files["image"]
    if not image_file.filename:
        return jsonify({"error": "Choose an image file first."}), 400
    if not (image_file.mimetype or "").startswith("image/"):
        return jsonify({"error": "The selected file must be an image."}), 400

    task = request.form.get("task", "binary")
    if task not in MODEL_FILES:
        return jsonify({"error": "Choose a supported research model."}), 400

    image_bytes = image_file.read()
    if not image_bytes:
        return jsonify({"error": "The selected image is empty."}), 400

    try:
        models = load_image_models()
        features = extract_eye_pair_features(image_bytes)
        model = models[task]["model"]
        predicted_label = str(model.predict(features)[0])
        raw_scores = np.asarray(model.decision_function(features)).reshape(-1).tolist()
        labels = list(map(str, model.classes_))
        if len(labels) == 2 and len(raw_scores) == 1:
            margin = float(raw_scores[0])
            score_by_label = {
                labels[0]: round(-margin, 5),
                labels[1]: round(margin, 5),
            }
        elif len(labels) == len(raw_scores):
            score_by_label = {
                label: round(float(score), 5)
                for label, score in zip(labels, raw_scores)
            }
        else:
            raise ValueError("The model returned an unexpected decision-score shape.")

        return jsonify({
            "task": task,
            "predicted_label": predicted_label,
            "decision_scores": score_by_label,
            "score_type": "SVM decision score (not a probability or confidence)",
            "model_input": "one pre-cropped eye-pair image, resized to 96x96 grayscale HOG features",
            "image_stored": False,
            "interpretation": (
                "Exploratory model output for this uploaded image only. "
                "It is not a diagnosis, a screening result, or a substitute for an eye-care examination."
            ),
        })
    except FileNotFoundError as error:
        return jsonify({"error": str(error)}), 503
    except (ValueError, KeyError) as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        app.logger.exception("StarbSense image-model inference failed")
        return jsonify({"error": "Image-model inference failed. Check the Python server terminal."}), 500


@app.post("/api/analyze")
def analyze_session():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({"error": "Expected a JSON object."}), 400

    rows = payload.get("samples")

    if not isinstance(rows, list) or not rows:
        return jsonify({"error": "No session samples were provided."}), 400

    if len(rows) > MAX_ROWS:
        return jsonify({
            "error": f"Too many samples. Maximum allowed: {MAX_ROWS}."
        }), 413

    if not all(isinstance(row, dict) for row in rows):
        return jsonify({"error": "Every sample must be an object."}), 400

    if any(len(row) > 100 for row in rows):
        return jsonify({"error": "A sample contains too many fields."}), 400

    columns = list(dict.fromkeys(
        key
        for row in rows
        for key in row.keys()
        if isinstance(key, str)
    ))

    if not columns:
        return jsonify({"error": "No sample columns were provided."}), 400

    try:
        with tempfile.TemporaryDirectory(prefix="starbsense_") as temp_dir:
            csv_path = Path(temp_dir) / "session.csv"

            with csv_path.open(
                "w", newline="", encoding="utf-8-sig"
            ) as file:
                writer = csv.DictWriter(
                    file,
                    fieldnames=columns,
                    extrasaction="ignore",
                )
                writer.writeheader()
                writer.writerows(rows)

            summary, output_dir = analyze(csv_path)
            result = dict(summary)
            result["python_analysis"] = True

            for key, filename in CHART_FILES.items():
                image_path = output_dir / filename
                if image_path.is_file():
                    encoded = base64.b64encode(
                        image_path.read_bytes()
                    ).decode("ascii")
                    result[key] = f"data:image/png;base64,{encoded}"

            return jsonify(result)

    except (ValueError, KeyError, csv.Error) as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        app.logger.exception("StarbSense analysis failed")
        return jsonify({
            "error": "Analysis failed. Check the Python server terminal."
        }), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
