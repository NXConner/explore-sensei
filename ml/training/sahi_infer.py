import argparse
from pathlib import Path

from sahi.model import Yolov8DetectionModel
from sahi.predict import get_sliced_prediction
from sahi.utils.cv import read_image


def parse_args():
    p = argparse.ArgumentParser(description="SAHI sliced inference for YOLOv8-seg model")
    p.add_argument("model_path", help="Path to YOLOv8-seg weights")
    p.add_argument("image", help="Large input image path")
    p.add_argument("--out", default="sahi_out.json")
    p.add_argument("--slice_w", type=int, default=1024)
    p.add_argument("--slice_h", type=int, default=1024)
    p.add_argument("--overlap", type=float, default=0.2)
    return p.parse_args()


def main():
    args = parse_args()
    detection_model = Yolov8DetectionModel(
        model_path=args.model_path,
        confidence_threshold=0.2,
        device="cuda:0" if False else "cpu",
    )
    image = read_image(args.image)
    result = get_sliced_prediction(
        image, detection_model,
        slice_height=args.slice_h,
        slice_width=args.slice_w,
        overlap_height_ratio=args.overlap,
        overlap_width_ratio=args.overlap,
        postprocess_match_metric="IOS",
        postprocess_match_threshold=0.5,
    )
    Path(args.out).write_text(result.json(), encoding="utf-8")


if __name__ == "__main__":
    main()
