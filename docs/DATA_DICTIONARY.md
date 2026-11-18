# StarbSense session data dictionary

Each CSV row represents one processed camera frame. Empty values mean that the relevant landmark or measurement was unavailable; they must not be silently converted to zero.

## Session and timing

| Field | Meaning |
|---|---|
| `session_id` | Randomly time-derived local session label; replace with a coded participant/session ID if needed for approved research. |
| `session_started_at_iso` | Session start timestamp. |
| `timestamp_iso` | Browser timestamp when the frame sample was assembled. |
| `elapsed_ms` | Elapsed time from session start, in milliseconds. |
| `timezone_offset_minutes` | Browser timezone offset; not needed for most analysis. |
| `frame_interval_target_ms` | Requested sampling interval (120 ms). |
| `task_duration_target_ms` | Intended duration of each visual task. |
| `task_index`, `task_label` | Current target task. |
| `target_x_percent`, `target_y_percent` | Target location in the game stage. |
| `sequence_length` | Number of target tasks in the sequence. |
| `page_visibility_state` | Whether the browser tab was visible when sampled. |

## Camera and image quality

| Field | Meaning |
|---|---|
| `camera_width`, `camera_height` | Actual camera track dimensions when the browser exposes them. |
| `camera_frame_rate` | Actual camera track frame rate when exposed. |
| `camera_facing_mode` | Facing mode reported by the browser. |
| `video_frame_width`, `video_frame_height` | HTML video frame dimensions. |
| `lighting_mean_gray` | Mean grayscale intensity from a sparse sample of the resized frame (0–255). |
| `lighting_std_gray` | Standard deviation of sampled grayscale intensity. |
| `lighting_sampled_pixels` | Number of sampled pixels used for lighting summaries. |

Lighting values are coarse image-quality descriptors, not calibrated illumination measurements. Current low/high thresholds are heuristic flags only.

## Face and eye landmarks

| Field | Meaning |
|---|---|
| `face_landmarks_detected` | 1 if MediaPipe returned a face landmark set for the frame, otherwise 0. |
| `left_eye_outer_*`, `left_eye_inner_*` | Normalized image coordinates for selected eye-corner landmarks. |
| `right_eye_inner_*`, `right_eye_outer_*` | Normalized image coordinates for selected eye-corner landmarks. |
| `left_iris_landmark_x/y`, `right_iris_landmark_x/y` | Normalized image coordinates for iris landmarks. |
| `left_iris_horizontal_relative`, `left_iris_vertical_relative` | Iris position projected relative to the selected eye-corner axis. |
| `right_iris_horizontal_relative`, `right_iris_vertical_relative` | Same geometric feature for the other eye. |
| `left_eye_width_norm`, `right_eye_width_norm` | Distance between selected eye-corner landmarks in normalized image coordinates. |
| `left_eye_axis_angle_deg`, `right_eye_axis_angle_deg` | Image-plane angle of the eye-corner axis. |
| `face_transformation_matrix` | Serialized MediaPipe facial transformation matrix, if available. |
| `head_rotation_*_proxy_deg` | Exploratory angles derived from that matrix; not validated head-pose measurements. |

## Experimental image features

| Field | Meaning |
|---|---|
| `left/right_bright_candidate_detected` | Whether a cluster of very bright pixels was found near the iris landmark. |
| `left/right_bright_candidate_x/y` | Candidate cluster centroid in normalized image coordinates. |
| `left/right_bright_pixel_count` | Number of thresholded pixels in the local search region. |
| `image_analysis_status` | Status of the OpenCV image-processing step. |
| `bright_pixel_threshold` | Grayscale threshold used for candidate detection. |

Bright-pixel candidates are not verified corneal reflections.

## Analysis outputs

Python summary fields include frame counts, face-detection rate, separate left/right/bilateral iris-coordinate availability, out-of-range coordinate count, timestamp ordering/duplicates, sampling intervals, task coverage, relative-feature availability, head-proxy summaries, and lighting summaries.

The Python analysis sorts valid rows by elapsed time for plots but calculates timestamp-order errors from the original row order. Missing data remain missing (NaN) in statistical calculations.
