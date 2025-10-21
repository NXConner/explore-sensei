import argparse
import os
from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train YOLOv8-seg for asphalt detection")
    p.add_argument("data", help="Path to data.yaml (YOLO format)")
    p.add_argument("--model", default="yolov8s-seg.pt", help="Base model")
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--imgsz", type=int, default=1024)
    p.add_argument("--batch", type=int, default=8)
    p.add_argument("--name", default="asphalt-seg")
    p.add_argument("--device", default="auto")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    model = YOLO(args.model)
    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        name=args.name,
        device=args.device,
        pretrained=True,
        patience=30,
        cos_lr=True,
        lr0=0.01,
        lrf=0.01,
        optimizer="SGD",
        mosaic=1.0,
        mixup=0.1,
        fliplr=0.5,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        cache=True,
        workers=8,
    )


if __name__ == "__main__":
    main()
