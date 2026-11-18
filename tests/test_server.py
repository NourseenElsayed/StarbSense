import base64
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import app


class ServerApiTests(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    def test_rejects_non_json_payload(self):
        response = self.client.post("/api/analyze", data="not-json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Expected a JSON object", response.get_json()["error"])

    def test_rejects_empty_samples(self):
        response = self.client.post("/api/analyze", json={"samples": []})
        self.assertEqual(response.status_code, 400)
        self.assertIn("No session samples", response.get_json()["error"])

    def test_rejects_non_object_sample(self):
        response = self.client.post("/api/analyze", json={"samples": ["bad"]})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Every sample must be an object", response.get_json()["error"])

    def test_analysis_endpoint_returns_summary_and_chart(self):
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            chart_bytes = b"fake-png-content"
            (output_dir / "face_detection_by_task.png").write_bytes(chart_bytes)
            fake_summary = {"sample_count": 2, "face_detected_samples": 1}

            with patch("server.analyze", return_value=(fake_summary, output_dir)) as mocked:
                response = self.client.post(
                    "/api/analyze",
                    json={"samples": [{"elapsed_ms": 0}, {"elapsed_ms": 120}]},
                    headers={"Origin": "http://127.0.0.1:5173"},
                )

            self.assertEqual(response.status_code, 200)
            payload = response.get_json()
            self.assertTrue(payload["python_analysis"])
            self.assertEqual(payload["sample_count"], 2)
            self.assertEqual(
                payload["face_detection_chart"],
                "data:image/png;base64," + base64.b64encode(chart_bytes).decode("ascii"),
            )
            self.assertEqual(
                response.headers["Access-Control-Allow-Origin"],
                "http://127.0.0.1:5173",
            )
            mocked.assert_called_once()

    def test_unapproved_origin_does_not_receive_cors_permission(self):
        response = self.client.get(
            "/api/health",
            headers={"Origin": "https://example.com"},
        )
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)


if __name__ == "__main__":
    unittest.main()
