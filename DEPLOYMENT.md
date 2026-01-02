# Deployment Guide for BDHMED

This guide explains how to deploy the BDHMED application for free using **Render** (Backend) and **Vercel** (Frontend).

## 1. Backend Deployment (Render)

We will use Render's free tier to host the FastAPI backend.

1.  **Push your code to GitHub.** Ensure this repository is public or you have a Render account connected to your private repos.
2.  **Create a New Web Service on Render:**
    *   Go to [dashboard.render.com](https://dashboard.render.com/).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
3.  **Configure the Service:**
    *   **Name:** `bdh-backend` (or similar)
    *   **Region:** Choose one close to you (e.g., Oregon, Frankfurt).
    *   **Branch:** `main` (or your working branch).
    *   **Root Directory:** `.` (Leave blank or set to root).
    *   **Runtime:** `Python 3`.
    *   **Build Command:** `pip install -r backend/requirements.txt`
    *   **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4.  **Environment Variables:**
    *   Scroll down to "Advanced" -> "Environment Variables".
    *   Add `PYTHONPATH` with value `.` (This ensures `bdh_core` can be imported).
    *   Add `ALLOWED_ORIGINS` with value `https://your-frontend-url.vercel.app` (You will get this URL in Step 2, initially you can set it to `*` for testing).
5.  **Deploy:** Click **Create Web Service**.
    *   Wait for the deployment to finish.
    *   Copy the **onrender.com URL** (e.g., `https://bdh-backend.onrender.com`).

**Note on Persistence:** On Render's free tier, the disk is ephemeral. If the server restarts (which happens on free tier), the `network_state.json` will be reset. For a demo, this is acceptable. For production, you would replace the JSON storage with a database (e.g., Render PostgreSQL).

## 2. Frontend Deployment (Vercel)

We will use Vercel to host the React frontend.

1.  **Install Vercel CLI (Optional) or use the Dashboard:**
    *   Go to [vercel.com](https://vercel.com/).
    *   Log in with GitHub.
2.  **Import Project:**
    *   Click **Add New...** -> **Project**.
    *   Select your GitHub repository.
3.  **Configure Project:**
    *   **Framework Preset:** `Vite` (Should be detected automatically).
    *   **Root Directory:** Click "Edit" and select `frontend`.
4.  **Environment Variables:**
    *   Expand "Environment Variables".
    *   Key: `VITE_API_URL`
    *   Value: Paste your Render Backend URL (e.g., `https://bdh-backend.onrender.com`). **Do not add a trailing slash.**
5.  **Deploy:** Click **Deploy**.
    *   Vercel will build and deploy your site.
    *   Once done, you will get a domain (e.g., `bdh-med.vercel.app`).

## 3. Final Connection

1.  Go back to your **Render Dashboard**.
2.  Update the `ALLOWED_ORIGINS` environment variable to your new Vercel domain (e.g., `https://bdh-med.vercel.app`).
3.  Redeploy the backend (Manual Deploy -> Deploy latest commit) to apply the changes.

## 4. Verification

1.  Open your Vercel URL.
2.  Open the Browser Developer Tools (F12) -> Network Tab.
3.  Refresh the page.
4.  Verify that requests are going to `https://bdh-backend.onrender.com/...` and returning `200 OK`.

## Local Development

To run locally with these changes:

1.  **Backend:**
    ```bash
    source venv/bin/activate
    export ALLOWED_ORIGINS="http://localhost:5173"
    uvicorn backend.main:app --reload --port 8000
    ```

2.  **Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
    (The `.env` file in frontend handles the API URL locally).
