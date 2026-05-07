# Root Phenotyping Flask App

Flask web app for analyzing root images and calculating basic phenotyping metrics.

## Features

- Upload PNG, JPG, or JPEG root images
- Generate a binary root mask with OpenCV
- Skeletonize the root structure
- Estimate total root length, depth, tortuosity, and convex hull area
- Display the uploaded image and generated mask in the browser

## Run Locally

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask app:

```bash
python work.py
```

Open:

```text
http://127.0.0.1:5000
```

## Deploy On Railway

Railway uses `railway.json` from this repo.

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
gunicorn work:app --bind 0.0.0.0:$PORT
```

The Flask entrypoint is `work.py`, and the Flask app object is named `app`.
