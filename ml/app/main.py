import base64
import io
import json
import os
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# Optional: Ultralytics YOLOv8 for instance segmentation
try:
    from ultralytics import YOLO
except Exception:  # pragma: no cover
    YOLO = None  # type: ignore

import cv2

from utils.geometry import mask_to_polygon, simplify_polygon, polygon_area_pixels

app = FastAPI(title="Pavement ML API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ModelWrapper:
    def __init__(self) -> None:
        self.model: Optional[Any] = None
        self.model_loaded: bool = False
        self.model_name: str = ""

    def load(self) -> None:
        model_path = os.getenv("ASPHALT_MODEL_PATH", "").strip()
        if YOLO is None:
            self.model_loaded = False
            self.model_name = "none"
            return
        try:
            if model_path:
                self.model = YOLO(model_path)
                self.model_name = os.path.basename(model_path)
            else:
                # Fallback to a general segmentation model. Note: not asphalt-specific.
                self.model = YOLO("yolov8n-seg.pt")
                self.model_name = "yolov8n-seg.pt"
            _ = self.model.predict(np.zeros((64, 64, 3), dtype=np.uint8))  # warmup
            self.model_loaded = True
        except Exception as e:  # pragma: no cover
            print(f"[MLAPI] Failed to load model: {e}")
            self.model_loaded = False
            self.model = None
            self.model_name = ""

    def infer(self, image_bgr: np.ndarray) -> List[np.ndarray]:
        if not self.model_loaded or self.model is None:
            return []
        res = self.model.predict(source=image_bgr, verbose=False)[0]
        masks = []
        if getattr(res, "masks", None) is not None and res.masks is not None:
            mdata = res.masks  # type: ignore
            # mdata.data: [N, H, W] boolean/float masks
            mask_arr = mdata.data.cpu().numpy() if hasattr(mdata.data, "cpu") else mdata.data
            for i in range(mask_arr.shape[0]):
                m = (mask_arr[i] > 0.5).astype(np.uint8) * 255
                masks.append(m)
        return masks


MODEL = ModelWrapper()
MODEL.load()


# -------------- Utility functions --------------

def decode_image_b64(image_b64: str) -> np.ndarray:
    # Accept data URLs or pure base64
    if image_b64.startswith("data:"):
        image_b64 = image_b64.split(",", 1)[1]
    image_bytes = base64.b64decode(image_b64)
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(pil)[:, :, ::-1]  # to BGR for OpenCV
    return arr


def classical_asphalt_segmentation(image_bgr: np.ndarray) -> List[np.ndarray]:
    # Heuristic segmentation intended for parking lot orthos
    img = image_bgr.copy()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    # Emphasize dark-ish asphalt tones; thresholds may need tuning per imagery source
    thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)[1]
    # Morphology to clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=3)
    # Remove tiny regions
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(closed)
    for cnt in contours:
        if cv2.contourArea(cnt) > 500:  # min area filter
            cv2.drawContours(mask, [cnt], -1, 255, thickness=cv2.FILLED)
    # Split into connected components as separate masks
    num_labels, labels = cv2.connectedComponents(mask)
    masks: List[np.ndarray] = []
    for label in range(1, num_labels):
        comp = (labels == label).astype(np.uint8) * 255
        if comp.sum() > 0:
            masks.append(comp)
    return masks


# -------------- API endpoints --------------

@app.get("/healthz")
def healthz() -> Dict[str, Any]:
    return {
        "ok": True,
        "model_loaded": MODEL.model_loaded,
        "model_name": MODEL.model_name,
        "version": app.version,
    }


@app.post("/infer")
def infer(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        image_b64: str = payload.get("imageBase64") or payload.get("image")
        if not image_b64:
            raise HTTPException(status_code=400, detail="imageBase64 is required")
        pixels_per_foot: Optional[float] = payload.get("pixelsPerFoot")
        if pixels_per_foot is None:
            env_ppf = os.getenv("PIXELS_PER_FOOT")
            pixels_per_foot = float(env_ppf) if env_ppf else None

        image_bgr = decode_image_b64(image_b64)

        masks = MODEL.infer(image_bgr) if MODEL.model_loaded else []
        if not masks:
            masks = classical_asphalt_segmentation(image_bgr)

        areas: List[Dict[str, Any]] = []
        total_sqft = 0.0
        for idx, m in enumerate(masks):
            poly = mask_to_polygon(m)
            if len(poly) < 3:
                continue
            poly = simplify_polygon(poly, epsilon=2.0)
            area_px = polygon_area_pixels(poly)
            if area_px < 1_000:  # filter small artifacts
                continue
            area_sqft = area_px / (pixels_per_foot ** 2) if pixels_per_foot else None
            if area_sqft:
                total_sqft += area_sqft
            # Map to JSON format expected by frontend
            areas.append(
                {
                    "id": f"area_{idx+1}",
                    "coordinates": [{"x": float(x), "y": float(y)} for (x, y) in poly],
                    "area_sqft": float(area_sqft) if area_sqft else 0.0,
                    "condition": "Good",
                }
            )

        result: Dict[str, Any] = {
            "condition": "Good" if areas else "Unknown",
            "confidence_score": 60 if areas else 0,
            "area_sqft": float(total_sqft) if total_sqft else 0.0,
            "area_sqm": float(total_sqft * 0.092903) if total_sqft else 0.0,
            "detected_issues": [],
            "recommendations": [],
            "priority": "Medium",
            "estimated_repair_cost": None,
            "ai_notes": "MLAPI result",
            "asphalt_areas": areas,
        }
        return {"success": True, "analysis": result}
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(e))
