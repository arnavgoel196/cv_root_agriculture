# 🌱 Automated Phenotyping of Seedling Root Architecture
### A Hybrid Mathematical & Deep Learning Pipeline

> Replacing 10–15 minute manual root tracing with a <100ms automated analysis pipeline — deployed as a live web application.

[![Python](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-lightgrey)](https://flask.palletsprojects.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-red)](https://pytorch.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.x-green)](https://opencv.org/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Railway-purple)](https://cv-root-agriculture-production-183c.up.railway.app/)

---

## Overview

Manual root phenotyping requires researchers to individually trace every root segment — a process taking **10–15 minutes per sample** that doesn't scale to modern high-throughput breeding experiments.

This project develops an end-to-end automated pipeline that:
- Segments root structures from raw images using a **dual-engine approach**
- Extracts three key architectural traits with **sub-pixel accuracy**
- Processes each image in **<100ms** — enabling batch analysis of thousands of samples
- Serves results through a **live web portal** requiring zero setup

---

## Results

Evaluated against expert-annotated ground truth from the **TILLMore-CDC barley dataset** (Maich et al., 2024):

| Metric | MAE | RMSE | MAPE | **R² Score** |
|---|---|---|---|---|
| Total Root Length | 794.45 px | 1122.83 px | 12.89% | **0.835** |
| Convex Hull Area | 17,418 px² | 37,815 px² | 2.31% | **0.988** |
| System Tortuosity | 0.90 | 1.17 | 12.03% | **0.717** |

---

## Pipeline Architecture

### Dual-Engine Segmentation

The pipeline selects between two segmentation strategies based on image type:

**Engine 1 — Otsu's Algorithm** (High-contrast lab images)
- Gaussian blur to suppress mat texture noise
- Adaptive statistical thresholding via `THRESH_OTSU` — no manual tuning required
- Morphological opening (`MORPH_OPEN`) to remove dust artifacts
- Deterministic, zero compute overhead, sub-pixel accurate on clean data

**Engine 2 — U-Net + ResNet34** (Noisy paper-based images)
- Trained on the TILLMore-CDC dataset using RSML expert annotations converted to binary masks
- Understands root shape context — ignores water stains and paper artifacts with similar pixel intensity to roots
- Handles low-contrast, texture-heavy environments where thresholding fails

### Trait Extraction

| Trait | Method |
|---|---|
| **Total Root Length (TRL)** | Recursive skeletonization to 1-pixel centerline → pixel count × 0.066 mm/px |
| **System Tortuosity** | TRL ÷ maximum root depth (ratio of actual path to straight-line depth) |
| **Convex Hull Area** | QuickHull algorithm on skeleton points → smallest convex polygon enclosing root system |

---

## Dataset

**TILLMore-CDC** (Maich et al., 2024) — High-resolution barley seedling imagery paired with RSML (Root System Markup Language) expert annotations.

- 4,500+ images, paper-based background
- RSML files provide precise branch coordinates used as ground-truth binary masks
- Source: [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2772375524003095) | [GitHub](https://github.com/MaicholD95/TILLMore-CDC)

---

## Run Locally

```bash
git clone https://github.com/arnavgoel196/cv-root-agriculture
cd cv-root-agriculture
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000` and upload a root image (PNG, JPG, JPEG).

---

## Deploy on Railway

Railway reads `railway.json` from this repo.

```
Build:  pip install -r requirements.txt
Start:  gunicorn app:app --bind 0.0.0.0:$PORT
```

---

## Tech Stack

| Layer | Tools |
|---|---|
| Segmentation | OpenCV, scikit-image, PyTorch, segmentation-models-pytorch |
| Deep Learning | U-Net + ResNet34 encoder, trained on TILLMore-CDC |
| Trait Extraction | NumPy, SciPy (ConvexHull, skeletonize) |
| Web App | Flask, Gunicorn |
| Deployment | Railway |

---

## References

Maich et al. (2024). *TILLMore-CDC: A barley root phenotyping dataset.* Smart Agricultural Technology. [DOI](https://www.sciencedirect.com/science/article/pii/S2772375524003095)
