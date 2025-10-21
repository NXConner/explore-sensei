import argparse
import json
import os
from pathlib import Path
from typing import Dict, List

from PIL import Image

# Simple converter: Label Studio polygon segmentation to YOLO v8-seg txt format
# Assumes annotation JSON export with polygon labels named 'asphalt' (adjust via arg)


def parse_args():
    p = argparse.ArgumentParser(description="Convert Label Studio polygons to YOLOv8-seg format")
    p.add_argument("input_json", help="Label Studio JSON export")
    p.add_argument("images_dir", help="Directory with source images")
    p.add_argument("out_dir", help="Output dataset root (will create images/ and labels/)")
    p.add_argument("--category", default="asphalt", help="Label name to include")
    return p.parse_args()


def normalize_points(points: List[Dict[str, float]], w: int, h: int) -> List[float]:
    # YOLO expects x,y normalized and flat list per polygon
    flat: List[float] = []
    for p in points:
        x = max(0.0, min(1.0, p["x"] / 100.0))
        y = max(0.0, min(1.0, p["y"] / 100.0))
        flat.extend([x, y])
    return flat


def main():
    args = parse_args()
    out_images = Path(args.out_dir) / "images" / "train"
    out_labels = Path(args.out_dir) / "labels" / "train"
    out_images.mkdir(parents=True, exist_ok=True)
    out_labels.mkdir(parents=True, exist_ok=True)

    with open(args.input_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        img_rel = item.get("image") or item.get("data", {}).get("image")
        if not img_rel:
            continue
        img_path = Path(args.images_dir) / Path(img_rel).name
        if not img_path.exists():
            continue
        with Image.open(img_path) as im:
            w, h = im.size
        anns = item.get("annotations") or item.get("result") or []
        polygons: List[List[float]] = []
        for ann in anns:
            if ann.get("type") == "polygonlabels" or ann.get("type") == "polygon":
                label = None
                if "value" in ann and isinstance(ann["value"], dict):
                    labels = ann["value"].get("polygonlabels") or ann["value"].get("labels")
                    if labels and len(labels) > 0:
                        label = labels[0]
                    points = ann["value"].get("points") or []
                else:
                    # newer exports may be flatter
                    labels = ann.get("polygonlabels") or ann.get("labels")
                    if labels and len(labels) > 0:
                        label = labels[0]
                    points = ann.get("points") or []
                if label and label.lower() == args.category.lower() and points:
                    polygons.append(normalize_points(points, w, h))

        if not polygons:
            continue

        # Write label file: class id 0 = asphalt
        stem = img_path.stem
        (out_images / img_path.name).write_bytes(img_path.read_bytes())
        with open(out_labels / f"{stem}.txt", "w", encoding="utf-8") as lf:
            for poly in polygons:
                lf.write("0 " + " ".join(f"{v:.6f}" for v in poly) + "\n")

    # Write minimal data.yaml
    data_yaml = f"""
# YOLOv8-seg dataset spec
path: {Path(args.out_dir).resolve()}
train: images/train
val: images/train
names: [asphalt]
"""
    (Path(args.out_dir) / "data.yaml").write_text(data_yaml, encoding="utf-8")


if __name__ == "__main__":
    main()
