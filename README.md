# Root Phenotyping Web App

This project turns the notebook workflow into a simple website where you can upload a root image and view the calculated metrics in the browser.

## What it does

- Uploads a `.png`, `.jpg`, or `.jpeg` image
- Converts it to grayscale
- Applies Otsu thresholding and morphological cleanup
- Computes:
  - Total root length
  - Depth
  - Tortuosity
  - Convex hull area
- Displays the uploaded image and generated binary mask

## Run locally

1. Create and activate a virtual environment.
2. Install the dependencies:

```bash
pip install -r requirements.txt
```

3. Start the app:

```bash
python app.py
```

4. Open `http://127.0.0.1:5000` in your browser.

## Deploy on Render

1. Put this project in a GitHub repository.
2. Create a Render account and choose `New > Web Service`.
3. Connect the GitHub repository.
4. Use:

```txt
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

5. Deploy the service and Render will give you a public URL.

You can also use the included `render.yaml` for Blueprint deployment.

## Notes

- The scale factor is currently set to `0.066 mm/pixel`, matching the notebook.
- If your image capture setup changes, update `SCALE_FACTOR` in `app.py`.
