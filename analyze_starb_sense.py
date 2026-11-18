from pathlib import Path
import json

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


RELATIVE_COLUMNS = [
    "left_iris_horizontal_relative",
    "left_iris_vertical_relative",
    "right_iris_horizontal_relative",
    "right_iris_vertical_relative",
]
HEAD_COLUMNS = [
    "head_rotation_x_proxy_deg",
    "head_rotation_y_proxy_deg",
    "head_rotation_z_proxy_deg",
]
LIGHTING_COLUMNS = ["lighting_mean_gray", "lighting_std_gray"]
FACE_COLUMN = "face_landmarks_detected"


def numeric_column(df, name):
    if name not in df.columns:
        return pd.Series(np.nan, index=df.index, dtype=float)
    return pd.to_numeric(df[name], errors="coerce")


def truthy_column(df, name):
    return numeric_column(df, name).fillna(0).gt(0)


def safe_mean(series):
    values = pd.to_numeric(series, errors="coerce").dropna()
    return round(float(values.mean()), 5) if len(values) else None


def safe_std(series):
    values = pd.to_numeric(series, errors="coerce").dropna()
    return round(float(values.std()), 5) if len(values) > 1 else None


def save_chart(path, title, xlabel, ylabel):
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.grid(True, alpha=0.25)
    plt.tight_layout()
    plt.savefig(path, dpi=140, bbox_inches="tight")
    plt.close()


def analyze(csv_file):
    csv_file = Path(csv_file)
    output_dir = csv_file.parent / "analysis"
    output_dir.mkdir(parents=True, exist_ok=True)

    raw = pd.read_csv(csv_file)
    if raw.empty:
        raise ValueError("The session file contains no samples.")
    if "elapsed_ms" not in raw.columns:
        raise ValueError("Missing required column: elapsed_ms")

    original_times = pd.to_numeric(raw["elapsed_ms"], errors="coerce").dropna()
    if original_times.empty:
        raise ValueError("No valid timestamps were found.")

    time_diffs = original_times.diff().dropna()
    negative_time_steps = int((time_diffs < 0).sum())
    duplicate_time_steps = int((time_diffs == 0).sum())
    positive_steps = time_diffs[time_diffs > 0]
    median_interval_ms = round(float(positive_steps.median()), 2) if len(positive_steps) else None
    max_interval_ms = round(float(positive_steps.max()), 2) if len(positive_steps) else None
    min_interval_ms = round(float(positive_steps.min()), 2) if len(positive_steps) else None

    df = raw.copy()
    df["elapsed_ms"] = pd.to_numeric(df["elapsed_ms"], errors="coerce")
    invalid_timestamp_count = int(df["elapsed_ms"].isna().sum())
    df = df.dropna(subset=["elapsed_ms"]).sort_values(
        "elapsed_ms", kind="stable"
    ).reset_index(drop=True)
    if df.empty:
        raise ValueError("No valid timestamps were found.")

    face_detected = truthy_column(df, FACE_COLUMN)
    left_x = numeric_column(df, "left_iris_landmark_x")
    left_y = numeric_column(df, "left_iris_landmark_y")
    right_x = numeric_column(df, "right_iris_landmark_x")
    right_y = numeric_column(df, "right_iris_landmark_y")

    left_valid = face_detected & left_x.notna() & left_y.notna()
    right_valid = face_detected & right_x.notna() & right_y.notna()
    both_iris_valid = left_valid & right_valid

    coordinate_out_of_bounds = (
        (left_x.notna() & ~left_x.between(0, 1))
        | (left_y.notna() & ~left_y.between(0, 1))
        | (right_x.notna() & ~right_x.between(0, 1))
        | (right_y.notna() & ~right_y.between(0, 1))
    )

    task_index = numeric_column(df, "task_index")
    task_label = (
        df["task_label"].fillna("Unknown").astype(str)
        if "task_label" in df.columns
        else pd.Series("Unknown", index=df.index)
    )

    for col in RELATIVE_COLUMNS + HEAD_COLUMNS + LIGHTING_COLUMNS:
        df[col] = numeric_column(df, col)

    task_summary = pd.DataFrame({
        "task_index": task_index,
        "task_label": task_label,
        "samples": 1,
        "face_detected": face_detected.astype(int),
        "left_iris_valid": left_valid.astype(int),
        "right_iris_valid": right_valid.astype(int),
        "both_iris_valid": both_iris_valid.astype(int),
    })
    for col in RELATIVE_COLUMNS + HEAD_COLUMNS + LIGHTING_COLUMNS:
        task_summary[col] = df[col]

    aggregations = {
        "samples": ("samples", "sum"),
        "face_detected_samples": ("face_detected", "sum"),
        "left_iris_valid_samples": ("left_iris_valid", "sum"),
        "right_iris_valid_samples": ("right_iris_valid", "sum"),
        "both_iris_valid_samples": ("both_iris_valid", "sum"),
    }
    for col in RELATIVE_COLUMNS + HEAD_COLUMNS + LIGHTING_COLUMNS:
        aggregations[f"{col}_mean"] = (col, "mean")
        aggregations[f"{col}_std"] = (col, "std")

    grouped = (
        task_summary.groupby(["task_index", "task_label"], dropna=False)
        .agg(**aggregations)
        .reset_index()
    )
    grouped.to_csv(output_dir / "task_summary.csv", index=False)

    total = int(len(df))
    detected = int(face_detected.sum())
    left_count = int(left_valid.sum())
    right_count = int(right_valid.sum())
    both_count = int(both_iris_valid.sum())
    lighting = df["lighting_mean_gray"].dropna()
    low_light_count = int((lighting < 35).sum())
    high_brightness_count = int((lighting > 225).sum())

    summary = {
        "sample_count": total,
        "total_recorded_frames": total,
        "invalid_timestamp_count": invalid_timestamp_count,
        "face_detected_samples": detected,
        "face_detection_rate_pct": round(detected / total * 100, 2),
        "face_detection_rate_percent": round(detected / total * 100, 2),
        "face_missing_samples": total - detected,
        "left_iris_valid_samples": left_count,
        "right_iris_valid_samples": right_count,
        "valid_iris_samples": both_count,
        "frames_with_valid_iris_coordinates": both_count,
        "valid_iris_rate_pct": round(both_count / total * 100, 2),
        "left_iris_valid_rate_pct": round(left_count / total * 100, 2),
        "right_iris_valid_rate_pct": round(right_count / total * 100, 2),
        "iris_coordinate_out_of_bounds_count": int(coordinate_out_of_bounds.sum()),
        "task_count": int(task_index.nunique(dropna=True)),
        "tasks_with_recorded_frames": int(task_index.nunique(dropna=True)),
        "negative_time_steps": negative_time_steps,
        "negative_timestamp_count": negative_time_steps,
        "duplicate_time_steps": duplicate_time_steps,
        "duplicate_timestamp_count": duplicate_time_steps,
        "median_sample_interval_ms": median_interval_ms,
        "min_sample_interval_ms": min_interval_ms,
        "max_sample_interval_ms": max_interval_ms,
        "relative_iris_metrics_available": bool(df[RELATIVE_COLUMNS].notna().any().any()),
        "head_rotation_metrics_available": bool(df[HEAD_COLUMNS].notna().any().any()),
        "relative_iris_means": {col: safe_mean(df[col]) for col in RELATIVE_COLUMNS},
        "head_rotation_proxy_means_deg": {col: safe_mean(df[col]) for col in HEAD_COLUMNS},
        "head_rotation_proxy_std_deg": {col: safe_std(df[col]) for col in HEAD_COLUMNS},
        "lighting_sample_count": int(lighting.notna().sum()),
        "lighting_mean_gray": safe_mean(lighting),
        "lighting_std_gray_mean": safe_mean(df["lighting_std_gray"]),
        "low_light_frame_count": low_light_count,
        "high_brightness_frame_count": high_brightness_count,
        "lighting_thresholds_are_heuristics": True,
        "interpretation": (
            "Experimental landmark and data-quality analysis only. "
            "Lighting thresholds are heuristic quality flags, not validated exclusion rules. "
            "These measurements are not validated for diagnosing or excluding strabismus "
            "or any other eye condition."
        ),
    }

    plt.figure(figsize=(10, 5))
    if len(grouped):
        plt.bar(grouped["task_label"].astype(str), grouped["face_detected_samples"])
        plt.xticks(rotation=35, ha="right")
    save_chart(output_dir / "face_detection_by_task.png",
               "Face Detection Samples by Task", "Task", "Detected samples")

    plt.figure(figsize=(10, 5))
    if left_x.notna().any():
        plt.plot(df["elapsed_ms"] / 1000, left_x, label="Left iris X")
    if right_x.notna().any():
        plt.plot(df["elapsed_ms"] / 1000, right_x, label="Right iris X")
    if left_x.notna().any() or right_x.notna().any():
        plt.legend()
    save_chart(output_dir / "iris_coordinates_over_time.png",
               "Raw Iris X Coordinates Over Time", "Elapsed time (seconds)",
               "Normalized image X coordinate")

    plt.figure(figsize=(10, 5))
    for col in RELATIVE_COLUMNS:
        if df[col].notna().any():
            plt.plot(df["elapsed_ms"] / 1000, df[col], label=col)
    if df[RELATIVE_COLUMNS].notna().any().any():
        plt.legend(fontsize=8)
    save_chart(output_dir / "relative_iris_over_time.png",
               "Iris Position Relative to Eye Corners", "Elapsed time (seconds)",
               "Relative coordinate (unitless)")

    plt.figure(figsize=(10, 5))
    for col in HEAD_COLUMNS:
        if df[col].notna().any():
            plt.plot(df["elapsed_ms"] / 1000, df[col], label=col)
    if df[HEAD_COLUMNS].notna().any().any():
        plt.legend(fontsize=8)
    save_chart(output_dir / "head_rotation_over_time.png",
               "Experimental Head-Rotation Proxies", "Elapsed time (seconds)",
               "Proxy angle (degrees)")

    plt.figure(figsize=(10, 5))
    relative_means = task_summary.groupby(
        ["task_index", "task_label"], dropna=False
    )[RELATIVE_COLUMNS].mean()
    if relative_means.notna().any().any():
        relative_means.plot(kind="bar", ax=plt.gca())
        plt.xticks(rotation=35, ha="right")
        plt.legend(fontsize=8)
    save_chart(output_dir / "relative_iris_by_task.png",
               "Relative Iris Metrics by Task", "Task",
               "Mean relative coordinate")

    plt.figure(figsize=(10, 5))
    if df["lighting_mean_gray"].notna().any():
        plt.plot(df["elapsed_ms"] / 1000, df["lighting_mean_gray"],
                 label="Mean grayscale brightness")
        plt.plot(df["elapsed_ms"] / 1000, df["lighting_std_gray"],
                 label="Brightness variation (std)")
        plt.legend()
    save_chart(output_dir / "lighting_quality_over_time.png",
               "Frame Lighting Quality (Heuristic)", "Elapsed time (seconds)",
               "Grayscale intensity (0–255)")

    with (output_dir / "summary.json").open("w", encoding="utf-8") as file:
        json.dump(summary, file, indent=2, ensure_ascii=False)

    return summary, output_dir
