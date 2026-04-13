import base64
import os

import cv2
import numpy as np
from flask import Flask, render_template, request
from scipy.spatial import ConvexHull, QhullError
from skimage.morphology import skeletonize

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

SCALE_FACTOR = 0.066  # mm per pixel
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def image_bytes_to_data_url(image_bytes: bytes, filename: str) -> str:
    extension = filename.rsplit(".", 1)[1].lower() if "." in filename else "jpeg"
    image_type = "jpeg" if extension == "jpg" else extension
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/{image_type};base64,{encoded}"


def mask_to_data_url(mask: np.ndarray) -> str:
    success, buffer = cv2.imencode(".png", mask)
    if not success:
        return ""
    encoded = base64.b64encode(buffer.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def analyze_root_image(image_bytes: bytes) -> dict:
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_GRAYSCALE)

    if image is None:
        raise ValueError("The uploaded file could not be read as an image.")

    blurred = cv2.GaussianBlur(image, (7, 7), 0)
    _, binary_mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    kernel = np.ones((3, 3), np.uint8)
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel)

    points = np.column_stack(np.where(binary_mask > 0))
    if len(points) <= 3:
        raise ValueError("Not enough root structure was detected in this image to calculate metrics.")

    skeleton = skeletonize(binary_mask > 0)
    trl_px = int(np.sum(skeleton))
    trl_mm = trl_px * SCALE_FACTOR

    try:
        hull = ConvexHull(points)
        area_px2 = float(hull.volume)
    except QhullError:
        area_px2 = 0.0
    area_mm2 = area_px2 * (SCALE_FACTOR ** 2)

    max_y = int(np.max(points[:, 0]))
    min_y = int(np.min(points[:, 0]))
    depth_px = max_y - min_y
    depth_mm = depth_px * SCALE_FACTOR
    tortuosity = trl_px / depth_px if depth_px > 0 else 0

    return {
        "trl_mm": round(trl_mm, 2),
        "depth_mm": round(depth_mm, 2),
        "tortuosity": round(tortuosity, 3),
        "hull_area_mm2": round(area_mm2, 2),
        "mask_data_url": mask_to_data_url(binary_mask),
    }


@app.route("/", methods=["GET", "POST"])
def index():
    error = None
    results = None
    preview_data_url = None
    filename = None

    if request.method == "POST":
        uploaded_file = request.files.get("image")

        if uploaded_file is None or uploaded_file.filename == "":
            error = "Please choose an image to upload."
        elif not allowed_file(uploaded_file.filename):
            error = "Please upload a PNG, JPG, or JPEG image."
        else:
            image_bytes = uploaded_file.read()
            filename = uploaded_file.filename

            try:
                preview_data_url = image_bytes_to_data_url(image_bytes, filename)
                results = analyze_root_image(image_bytes)
            except ValueError as exc:
                error = str(exc)
            except Exception:
                error = "Something went wrong while analyzing the image."

    return render_template(
        "index.html",
        error=error,
        results=results,
        preview_data_url=preview_data_url,
        filename=filename,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
