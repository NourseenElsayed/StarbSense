
from flask import Flask, jsonify, request
from pathlib import Path
import base64
import csv
import tempfile

from analyze_starb_sense import analyze

app = Flask(__name__)

MAX_ROWS = 5000
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024
ALLOWED_ORIGIN = "http://127.0.0.1:5173"

CHART_FILES = {
    "face_detection_chart": "face_detection_by_task.png",
    "iris_coordinates_chart": "iris_coordinates_over_time.png",
    "relative_iris_chart": "relative_iris_over_time.png",
    "head_rotation_chart": "head_rotation_over_time.png",
    "relative_iris_task_chart": "relative_iris_by_task.png",
    "lighting_quality_chart": "lighting_quality_over_time.png",
}


@app.after_request
def add_headers(response):
    origin = request.headers.get("Origin")
    if origin == ALLOWED_ORIGIN:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Vary"] = "Origin"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "StarbSense research analysis server",
    })


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
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )
