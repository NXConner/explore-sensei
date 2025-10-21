from typing import List, Sequence, Tuple
import cv2
import numpy as np

Point = Tuple[float, float]


def mask_to_polygon(mask: np.ndarray) -> List[Point]:
    # Expect mask as uint8 {0,255}
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return []
    # Use the largest contour
    cnt = max(contours, key=cv2.contourArea)
    poly = [(float(p[0][0]), float(p[0][1])) for p in cnt]
    return poly


def simplify_polygon(poly: Sequence[Point], epsilon: float = 2.0) -> List[Point]:
    if len(poly) < 3:
        return list(poly)
    arr = np.array(poly, dtype=np.float32).reshape((-1, 1, 2))
    peri = cv2.arcLength(arr, True)
    approx = cv2.approxPolyDP(arr, epsilon * 0.01 * peri, True)
    return [(float(p[0][0]), float(p[0][1])) for p in approx]


def polygon_area_pixels(poly: Sequence[Point]) -> float:
    if len(poly) < 3:
        return 0.0
    arr = np.array(poly, dtype=np.float32)
    # Shoelace formula
    x = arr[:, 0]
    y = arr[:, 1]
    return float(0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1))))
