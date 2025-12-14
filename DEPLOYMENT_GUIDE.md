# Deployment Guide

This guide explains how to deploy your **SmartHDR** application.
We will deploy the **Backend** (Python/FastAPI) to **Render** (free tier compatible) and the **Frontend** (React/Vite) to **Vercel**.

---

## Part 1: Deploying the Backend (Render)

Since your backend uses heavy AI libraries (Torch, OpenCV), the best way to deploy it is using **Docker**.

### 1. Push Code to GitHub
Ensure your latest changes, including the new `backend/Dockerfile`, are pushed to your GitHub repository.
*You have already pushed your code to GitHub, so this step is done.*

### 2. Create Deploy Service on Render
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Select **"Build and deploy from a Git repository"**.
4.  Connect your GitHub account and select your **SmartHDR** repository.

### 3. Configure the Service
*   **Name**: `smarthdr-backend` (or similar).
*   **Region**: Select one close to you (e.g., Singapore or Frankfurt).
*   **Branch**: `main`.
*   **Root Directory**: `backend` (Important! This tells Render the app is in the subfolder).
*   **Runtime**: Select **Docker**. (Render will automatically detect the Dockerfile in `backend/`).
*   **Instance Type**: **Free** (Note: Free tier has 512MB RAM. If the AI models crash due to memory, you may need the Starter plan ~$7/mo).

### 4. Environment Variables
Scroll down to the **"Environment Variables"** section and add:
*   `GEMINI_API_KEY`: Paste your API key here (starting with `AIza...`).
    *   *Do not paste .env contents into Git, always set them in the dashboard.*

### 5. Deploy
Click **"Create Web Service"**.
Render will start building your Docker image. This might take 5-10 minutes due to the large PyTorch libraries.
*   Once done, copy your **Service URL** (e.g., `https://smarthdr-backend.onrender.com`).

---

## Part 2: Deploying the Frontend (Vercel)

### 1. Create Project on Vercel
1.  Go to [vercel.com/new](https://vercel.com/new).
2.  Import your **SmartHDR** repository.

### 2. Configure Project
*   **Framework Preset**: Vite (Should be auto-detected).
*   **Root Directory**: Click "Edit" and select `intelliscan-studio` (the frontend folder).

### 3. Environment Variables
You need to tell the frontend where the backend lives.
1.  Open the **"Environment Variables"** section.
2.  Add:
    *   `VITE_API_URL`: Paste your **Render Backend URL** (e.g., `https://smarthdr-backend.onrender.com`).
    *   *Note: You may need to update your frontend code to use this variable instead of hardcoded `localhost:8000`.*

### 4. Deploy
Click **"Deploy"**.

---

## Part 3: Connecting Frontend to Backend

Ensure your frontend code uses the environment variable for API requests.
Check your `src/lib/utils.ts` or wherever you define the API base URL.

It should look like this:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```
*If you haven't set this up yet, let me know and I can help update the frontend code.*
