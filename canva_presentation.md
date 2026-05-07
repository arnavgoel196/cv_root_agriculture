# Root Image Phenotyping Web App

## Slide 1: Title
**Root Image Phenotyping Web App**

Simple computer vision tool for root image analysis

Presented by: Arnav Goel

Speaker note:
This project is a web application that analyzes root images and provides useful phenotyping measurements automatically.

---

## Slide 2: Problem Statement
Root analysis is important in agriculture and plant research.

Manual measurement of root traits:
- takes time
- needs effort
- can be inconsistent

There is a need for a simple and faster digital solution.

Speaker note:
The motivation behind this project is to reduce the difficulty of manual root measurement and make the process faster and easier.

---

## Slide 3: Project Objective
The main objective of this project is to build a website where a user can:

- upload a root image
- process the image automatically
- view root measurements instantly

Speaker note:
The idea was to make the system easy to use so that even a non-technical user can upload an image and get results.

---

## Slide 4: How It Works
The uploaded root image is processed in these steps:

1. Grayscale conversion
2. Otsu thresholding
3. Morphological cleanup
4. Skeletonization
5. Convex hull analysis

Speaker note:
These steps help separate the root from the background and calculate important root traits from the processed image.

---

## Slide 5: Technologies Used
Frontend:
- Next.js
- React
- CSS

Backend:
- Next.js API routes

Deployment:
- GitHub
- Vercel

Image Processing:
- Sharp
- Custom analysis logic

Speaker note:
The project uses Next.js for both frontend and backend, which made hosting easier because everything is in one app.

---

## Slide 6: Website Workflow
The workflow of the website is:

1. User uploads an image
2. The image is sent to the backend
3. The backend processes the image
4. Root traits are calculated
5. Results are shown on the website

Speaker note:
This flow is simple and direct. The user only needs to upload the image and the system handles the rest.

---

## Slide 7: Output
The website shows:

- uploaded image preview
- generated binary mask
- total root length
- depth
- tortuosity
- hull area

Speaker note:
The output helps the user understand both the processed image and the numerical measurements extracted from it.

---

## Slide 8: Advantages
- easy to use
- saves time
- reduces manual work
- available online
- combines frontend and backend in one system

Speaker note:
The biggest advantage is accessibility. Once deployed, the system can be used from anywhere through a browser.

---

## Slide 9: Conclusion
This project shows how computer vision can be used in agriculture to analyze root images through a web application.

It makes root phenotyping:
- faster
- simpler
- more accessible

Speaker note:
Overall, the project demonstrates a practical use of web technology and image analysis in agricultural applications.

---

## Slide 10: Future Scope
- improve analysis accuracy
- support multiple image uploads
- add more root metrics
- improve UI design
- use larger datasets for testing

Speaker note:
In the future, the project can be expanded with more features and stronger image analysis for real research use.

---

## Canva Design Suggestions
- Use a clean academic style
- Background: white, beige, or light cream
- Accent colors: brown and green
- Keep text minimal
- Add 1 screenshot of the website
- Add 1 sample root image if possible

## Suggested Slide Images
- Slide 1: Website screenshot
- Slide 4: Simple flow diagram
- Slide 7: Output screenshot showing metrics
