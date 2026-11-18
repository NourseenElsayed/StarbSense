
from pathlib import Path
import json
import math

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

FACE_COLUMN = "face_landmarks_detected"


def numeric_column(df, name):
    if name not in df.columns:
        return pd.Series(np.nan, index=df.index, dtype=float)
    return pd.to_numeric(df[name], errors="coerce")


def truthy_column(df, name):
    values = numeric_column(df, name)
    return values.fillna(0).astype(float).gt(0)


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

    df = pd.read_csv(csv_file)

    if df.empty:
        raise ValueError("The session file contains no samples.")

    if "elapsed_ms" not in df.columns:
        raise ValueError("Missing required column: elapsed_ms")

    df["elapsed_ms"] = pd.to_numeric(df["elapsed_ms"], errors="coerce")
    df = df.dropna(subset=["elapsed_ms"]).copy()

    if df.empty:
        raise ValueError("No valid timestamps were found.")

    df = df.sort_values("elapsed_ms", kind="stable").reset_index(drop=True)

    face_detected = truthy_column(df, FACE_COLUMN)
    df["face_detected_numeric"] = face_detected.astype(int)

    # A valid iris sample requires a detected face and both iris coordinates.
    left_x = numeric_column(df, "left_iris_x")
    left_y = numeric_column(df, "left_iris_y")
    right_x = numeric_column(df, "right_iris_x")
    right_y = numeric_column(df, "right_iris_y")

    left_valid = left_x.notna() & left_y.notna()
    right_valid = right_x.notna() & right_y.notna()
    both_iris_valid = face_detected & left_valid & right_valid

    # Quality checks
    original_times = pd.to_numeric(
        pd.read_csv(csv_file)["elapsed_ms"], errors="coerce"
    ).dropna()
    time_diffs = original_times.diff().dropna()

    negative_time_steps = int((time_diffs < 0).sum())
    duplicate_time_steps = int((time_diffs == 0).sum())
    positive_steps = time_diffs[time_diffs > 0]

    median_interval_ms = (
        round(float(positive_steps.median()), 2)
        if len(positive_steps) else None
    )
    max_interval_ms = (
        round(float(positive_steps.max()), 2)
        if len(positive_steps) else None
    )

    task_index = numeric_column(df, "task_index")
    task_label = (
        df["task_label"].fillna("Unknown").astype(str)
        if "task_label" in df.columns
        else pd.Series("Unknown", index=df.index)
    )

    # Relative iris and head metrics can be absent in older session CSVs.
    for col in RELATIVE_COLUMNS + HEAD_COLUMNS:
        df[col] = numeric_column(df, col)

    task_summary = pd.DataFrame({
        "task_index": task_index,
        "task_label": task_label,
        "face_detected": face_detected.astype(int),
        "iris_valid": both_iris_valid.astype(int),
    })

    for col in RELATIVE_COLUMNS + HEAD_COLUMNS:
        task_summary[col] = df[col]

    aggregations = {
        "samples": ("face_detected", "size"),
        "face_detected_samples": ("face_detected", "sum"),
        "valid_iris_samples": ("iris_valid", "sum"),
    }

    for col in RELATIVE_COLUMNS + HEAD_COLUMNS:
        aggregations[f"{col}_mean"] = (col, "mean")
        aggregations[f"{col}_std"] = (col, "std")

    grouped = (
        task_summary.groupby(["task_index", "task_label"], dropna=False)
        .agg(**aggregations)
        .reset_index()
    )

    task_csv = output_dir / "task_summary.csv"
    grouped.to_csv(task_csv, index=False)

    total_samples = int(len(df))
    detected_samples = int(face_detected.sum())
    valid_iris_samples = int(both_iris_valid.sum())

    summary = {
        "sample_count": total_samples,
        "face_detected_samples": detected_samples,
        "face_detection_rate_pct": round(
            detected_samples / total_samples * 100, 2
        ) if total_samples else 0,
        "valid_iris_samples": valid_iris_samples,
        "valid_iris_rate_pct": round(
            valid_iris_samples / total_samples * 100, 2
        ) if total_samples else 0,
        "task_count": int(task_index.nunique(dropna=True)),
        "negative_time_steps": negative_time_steps,
        "duplicate_time_steps": duplicate_time_steps,
        "median_sample_interval_ms": median_interval_ms,
        "max_sample_interval_ms": max_interval_ms,
        "relative_iris_metrics_available": bool(
            df[RELATIVE_COLUMNS].notna().any().any()
        ),
        "head_rotation_metrics_available": bool(
            df[HEAD_COLUMNS].notna().any().any()
        ),
        "relative_iris_means": {
            col: safe_mean(df[col]) for col in RELATIVE_COLUMNS
        },
        "head_rotation_proxy_means_deg": {
            col: safe_mean(df[col]) for col in HEAD_COLUMNS
        },
        "head_rotation_proxy_std_deg": {
            col: safe_std(df[col]) for col in HEAD_COLUMNS
        },
        "interpretation": (
            "Experimental landmark and data-quality analysis only. "
            "These measurements are not validated for diagnosing or "
            "excluding strabismus or any other eye condition."
        ),
    }

    # Face detection by task
    plt.figure(figsize=(10, 5))
    if len(grouped):
        plt.bar(
            grouped["task_label"].astype(str),
            grouped["face_detected_samples"],
        )
        plt.xticks(rotation=35, ha="right")
    save_chart(
        output_dir / "face_detection_by_task.png",
        "Face Detection Samples by Task",
        "Task",
        "Detected samples",
    )

    # Raw iris coordinates over time
    plt.figure(figsize=(10, 5))
    if left_x.notna().any():
        plt.plot(df["elapsed_ms"] / 1000, left_x, label="Left iris X")
    if right_x.notna().any():
        plt.plot(df["elapsed_ms"] / 1000, right_x, label="Right iris X")
    if left_x.notna().any() or right_x.notna().any():
        plt.legend()
    save_chart(
        output_dir / "iris_coordinates_over_time.png",
        "Raw Iris X Coordinates Over Time",
        "Elapsed time (seconds)",
        "Normalized image X coordinate",
    )

    # Relative iris coordinates
    plt.figure(figsize=(10, 5))
    plotted = False
    for col in RELATIVE_COLUMNS:
        values = df[col]
        if values.notna().any():
            plt.plot(df["elapsed_ms"] / 1000, values, label=col)
            plotted = True
    if plotted:
        plt.legend(fontsize=8)
    save_chart(
        output_dir / "relative_iris_over_time.png",
        "Iris Position Relative to Eye Corners",
        "Elapsed time (seconds)",
        "Relative coordinate (unitless)",
    )

    # Head rotation proxies
    plt.figure(figsize=(10, 5))
    plotted = False
    for col in HEAD_COLUMNS:
        values = df[col]
        if values.notna().any():
            plt.plot(df["elapsed_ms"] / 1000, values, label=col)
            plotted = True
    if plotted:
        plt.legend(fontsize=8)
    save_chart(
        output_dir / "head_rotation_over_time.png",
        "Experimental Head-Rotation Proxies",
        "Elapsed time (seconds)",
        "Proxy angle (degrees)",
    )

    # Relative iris position grouped by task
    plt.figure(figsize=(10, 5))
    relative_means = (
        task_summary.groupby(["task_index", "task_label"], dropna=False)
        [RELATIVE_COLUMNS].mean()
    )
    if relative_means.notna().any().any():
        relative_means.plot(kind="bar", ax=plt.gca())
        plt.xticks(rotation=35, ha="right")
        plt.legend(fontsize=8)
    save_chart(
        output_dir / "relative_iris_by_task.png",
        "Relative Iris Metrics by Task",
        "Task",
        "Mean relative coordinate",
    )

    with (output_dir / "summary.json").open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary, output_dir
