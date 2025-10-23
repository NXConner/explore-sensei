## Recommended Models and Repositories for Pavement Analysis

This curated list targets asphalt paving maintenance workflows: cracks, potholes, gatoring, striping/markings, parking layout inference, and water pooling/runoff. Favor instance segmentation (polygons) for accurate areas/lengths.

### Evaluation Criteria
- **Task fit**: Crack length, pothole area/depth, stripe detection, polygon quality
- **Performance**: mAP/IoU on your data; real-world generalization
- **Latency**: Edge/mobile vs server; supports tiling (SAHI)
- **Licensing**: Permissive for commercial use (MIT/Apache/BSD)
- **Maintenance**: Active community, clear docs, dataset availability

### Core Frameworks
- **Ultralytics YOLOv8/YOLOv10 (segment/detect)**: Strong baseline; easy training; export to ONNX/TensorRT. Use `-seg` for polygons.
- **SAHI (Sliced Aided Hyper Inference)**: For large ortho/satellite images; works well with YOLO.
- **Detectron2/Mask R-CNN**: High-quality instance segmentation; more complex stack.

### Cracks (longitudinal/transverse/crocodile)
- Search terms: `asphalt crack segmentation`, `road crack dataset`, `gator crack detection`, `DeepCrack`
- Candidates:
  - DeepCrack / CrackForest variants (GitHub): pixel-level crack maps (thin structures). Fine-tune with your images.
  - YOLOv8-seg (custom class: `crack`): simpler pipeline; post-process skeletonization to measure length.
  - Datasets: CFD, CRACK500, AigleRN; adapt with transfer learning.

### Potholes & Surface Distress
- Search terms: `pothole detection yolo`, `asphalt defect dataset`, `road distress detection`
- Candidates:
  - YOLOv8/10 (detect or segment) for classes: `pothole`, `patch`, `raveling`, `bleeding`.
  - Hugging Face datasets/models: community “pothole” tags; evaluate segmentation-first models for area.

### Markings & Parking Lot Striping
- Search terms: `road marking segmentation`, `parking lot line detection`, `lane marking dataset`
- Candidates:
  - Road Marking datasets (e.g., Baidu ApolloScape Marking, TuSimple lanes) as pretraining; fine-tune to `stripe`.
  - YOLOv8-seg multi-class: `stripe`, `arrow`, `number`, `handicap`, `stopbar`.
  - Detectron2 for fine polygons when label quality is high.

### Parking Layout Inference (stalls, aisles, counts)
- Approach: segment stripes + run geometric reasoning to recover stall rectangles, angles, and counts.
- Components:
  - Stripe segmentation (YOLOv8-seg) → Hough/line grouping → stall rectangle fitting.
  - Heuristics for ADA spacing, drive aisle width, angle (60/45/90). Store as vector layout.

### Water Pooling/Runoff
- Search terms: `puddle segmentation`, `water on pavement`, `surface runoff detection`
- Options:
  - Direct segmentation of water/puddles (limited datasets; useful after rain or in shadows-aware images).
  - Indirect: compute slope from elevation (DEM/contours), fit plane to parking lot; predict pooling zones (low curvature/low slope basins). Use OpenTopography/USGS elevation + hydrology tools.

### Tiling & Large Image Inference
- Use **SAHI** or sliding-window inference at 1024–1536 px with 0.2–0.4 overlap; merge polygons.

### Export & Serving
- Prefer YOLOv8-seg with ONNX/TensorRT for fast inference; keep a CPU ONNX path.

### Concrete GitHub/Hugging Face Starting Points
- Ultralytics YOLOv8: `ultralytics/ultralytics`
- SAHI: `obss/sahi`
- Detectron2: `facebookresearch/detectron2`
- Crack detection repos (search): `DeepCrack`, `CrackForest`, `CFD dataset`, `CRACK500`
- Pothole: search `pothole yolo segmentation`, `pothole dataset`
- Markings: `Apolloscape road marking`, `lane marking segmentation`
- Hugging Face: browse `models` and `datasets` with tags: `pothole`, `road-crack`, `road-marking`, `asphalt`

### Recommended Label Schema (multi-class, instance seg)
- `asphalt` (optional background polygon for area baseline)
- `crack` (thin polygons; measure length via skeleton)
- `pothole`
- `gator_crack`
- `stripe` (parking lines)
- `arrow`/`symbol`/`text`
- `patch` (previous repairs)
- `puddle` (water)

### Metrics to Track
- mAP50-95 (seg), mean IoU (seg), precision/recall per class
- Crack: length MAE/RMSE vs ground truth; continuity score
- Pothole: area absolute error; detection rate at small sizes
- Markings: stall count accuracy; stall dimension error

### Integration Notes
- Use existing ML API (`/infer`) and add multi-class outputs: polygons per class; compute class-specific areas/lengths.
- Post-processing: polygon simplification, hole removal, minimum area/length filters, morphology for cracks.
- Persist detections with `ai_asphalt_detections.analysis.geo_areas` (already supported) as GeoJSON.
