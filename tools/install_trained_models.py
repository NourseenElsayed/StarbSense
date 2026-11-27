from pathlib import Path
import argparse
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "models/binary_grouped_hog_svm.joblib",
    "models/five_class_hog_svm.joblib",
}


def main():
    parser = argparse.ArgumentParser(description="Install StarbSense offline image-model artifacts.")
    parser.add_argument("archive", help="Path to starbsense_trained_baselines.zip")
    args = parser.parse_args()
    archive = Path(args.archive).expanduser().resolve()
    if not archive.is_file():
        raise SystemExit(f"Archive not found: {archive}")

    with zipfile.ZipFile(archive) as bundle:
        names = set(bundle.namelist())
        missing = EXPECTED - names
        if missing:
            raise SystemExit("Archive is missing expected files: " + ", ".join(sorted(missing)))
        for name in EXPECTED:
            destination = ROOT / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            with bundle.open(name) as source, destination.open("wb") as target:
                target.write(source.read())
            print(f"Installed {destination.relative_to(ROOT)} ({destination.stat().st_size:,} bytes)")
    print("Installation complete. Restart the Flask server if it is already running.")


if __name__ == "__main__":
    main()
