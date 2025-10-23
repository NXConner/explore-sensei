# Pavement ML API

FastAPI service that performs asphalt detection/segmentation and surface area estimation.

## Features
- YOLOv8-seg instance segmentation (when a model is available)
- Classical CV fallback (threshold + morphology) for asphalt-like surfaces
- Polygon extraction and simplification, area in px and ft² (needs pixels-per-foot)
- CORS enabled; single `/infer` endpoint

## Endpoints
- `GET /healthz` — model status
- `POST /infer` — body:
```json
{
  "imageBase64": "data:image/png;base64,....",
  "pixelsPerFoot": 3.2
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "condition": "Good",
    "confidence_score": 60,
    "area_sqft": 12345.6,
    "area_sqm": 1147.3,
    "detected_issues": [],
    "recommendations": [],
    "priority": "Medium",
    "estimated_repair_cost": null,
    "ai_notes": "MLAPI result",
    "asphalt_areas": [
      {"id": "area_1", "coordinates": [{"x": 10, "y": 20}], "area_sqft": 234.5, "condition": "Good"}
    ]
  }
}
```

## Configuration
- `ASPHALT_MODEL_PATH`: path to YOLOv8-seg weights (e.g., `/models/asphalt-yolov8s-seg.pt`)
- `PIXELS_PER_FOOT`: default calibration if not provided per request

## Local run
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Training (recommended stack)
- Collect/annotate with Label Studio/CVAT (polygon masks) and export to YOLO segmentation.
- Train with Ultralytics YOLOv8-seg. Use SAHI for large orthophotos.

See `training/` for scripts.

## Recommended Models & Repositories

For cracks, potholes, markings, layouts, and pooling, see the curated guide:

`docs/ML_RECOMMENDED_MODELS.md`
