import csv
import tempfile
import unittest
from pathlib import Path

from analyze_starb_sense import analyze


class AnalysisTests(unittest.TestCase):
    def test_summary_and_charts_are_created(self):
        rows = [
            {
                "elapsed_ms": 0, "task_index": 1, "task_label": "Center",
                "face_landmarks_detected": 1,
                "left_iris_landmark_x": 0.45, "left_iris_landmark_y": 0.5,
                "right_iris_landmark_x": 0.55, "right_iris_landmark_y": 0.5,
                "left_iris_horizontal_relative": 0.5,
                "left_iris_vertical_relative": 0.0,
                "right_iris_horizontal_relative": 0.5,
                "right_iris_vertical_relative": 0.0,
                "lighting_mean_gray": 120, "lighting_std_gray": 20,
            },
            {
                "elapsed_ms": 120, "task_index": 1, "task_label": "Center",
                "face_landmarks_detected": 0,
                "left_iris_landmark_x": "", "left_iris_landmark_y": "",
                "right_iris_landmark_x": "", "right_iris_landmark_y": "",
                "lighting_mean_gray": 25, "lighting_std_gray": 5,
            },
            {
                "elapsed_ms": 240, "task_index": 2, "task_label": "Left",
                "face_landmarks_detected": 1,
                "left_iris_landmark_x": 1.2, "left_iris_landmark_y": 0.5,
                "right_iris_landmark_x": 0.5, "right_iris_landmark_y": 0.5,
                "lighting_mean_gray": 230, "lighting_std_gray": 30,
            },
        ]
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "session.csv"
            with source.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
                writer.writeheader()
                writer.writerows(rows)
            summary, output_dir = analyze(source)

            self.assertEqual(summary["sample_count"], 3)
            self.assertEqual(summary["face_detected_samples"], 2)
            self.assertEqual(summary["left_iris_valid_samples"], 2)
            self.assertEqual(summary["right_iris_valid_samples"], 2)
            self.assertEqual(summary["valid_iris_samples"], 1)
            self.assertEqual(summary["iris_coordinate_out_of_bounds_count"], 1)
            self.assertEqual(summary["median_sample_interval_ms"], 120.0)
            self.assertEqual(summary["low_light_frame_count"], 1)
            self.assertTrue((output_dir / "task_summary.csv").is_file())
            self.assertTrue((output_dir / "lighting_quality_over_time.png").is_file())


if __name__ == "__main__":
    unittest.main()
