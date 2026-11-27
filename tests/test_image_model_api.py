import io
import unittest
from unittest.mock import patch

import numpy as np

from server import app


class FakeSvm:
    classes_ = np.array(["strabismus", "strabismus_free"])

    def predict(self, _features):
        return np.array(["strabismus"])

    def decision_function(self, _features):
        return np.array([0.73])


class ImageModelApiTests(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_model_health_reports_missing_local_artifacts(self):
        with patch("server.MODEL_DIR") as model_dir:
            model_dir.__truediv__.return_value.is_file.return_value = False
            response = self.client.get("/api/model-health")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()["available"])

    def test_rejects_missing_image(self):
        response = self.client.post("/api/model-predict", data={"task": "binary"})
        self.assertEqual(response.status_code, 400)

    def test_rejects_unknown_task(self):
        response = self.client.post(
            "/api/model-predict",
            data={"task": "not-a-model", "image": (io.BytesIO(b"image"), "eye.jpg", "image/jpeg")},
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 400)

    def test_returns_model_label_and_raw_decision_score(self):
        artifact = {"model": FakeSvm()}
        with patch("server.load_image_models", return_value={"binary": artifact}), \
             patch("server.extract_eye_pair_features", return_value=np.zeros((1, 4356))):
            response = self.client.post(
                "/api/model-predict",
                data={
                    "task": "binary",
                    "image": (io.BytesIO(b"fake-image-bytes"), "eye-pair.jpg", "image/jpeg"),
                },
                content_type="multipart/form-data",
            )
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result["predicted_label"], "strabismus")
        self.assertEqual(result["decision_scores"]["strabismus"], 0.73)
        self.assertEqual(result["image_stored"], False)
        self.assertIn("not a probability", result["score_type"])

    def test_reports_models_not_installed_without_loading(self):
        with patch("server.load_image_models", side_effect=FileNotFoundError("install models")):
            response = self.client.post(
                "/api/model-predict",
                data={
                    "task": "binary",
                    "image": (io.BytesIO(b"fake-image-bytes"), "eye-pair.jpg", "image/jpeg"),
                },
                content_type="multipart/form-data",
            )
        self.assertEqual(response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
