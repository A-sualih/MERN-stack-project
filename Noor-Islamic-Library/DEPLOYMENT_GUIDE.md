# Noor Islamic Library - Deployment Guide

This guide provides step-by-step instructions for deploying the Noor Islamic Library application (MERN stack).

## 🚀 Pre-Deployment Checklist

Before you start, ensure you have:
1.  **Modified `.gitignore`**: I have already added a root `.gitignore` to prevent leaking your `.env` and `node_modules` to GitHub.
2.  **GitHub Repo**: Your code must be pushed to a GitHub repository.
3.  **Accounts**:
    - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - [Render.com](https://render.com/) (for Backend)
    - [Vercel.com](https://vercel.com/) (for Frontend)

---

## 1. Database Setup (MongoDB Atlas)

1.  **Create a Cluster**: Sign up and create a free (M0) cluster.
2.  **Database User**: Go to **Database Access** -> **Add New Database User**.
    - Auth Method: Password.
    - Permissions: "Read and write to any database".
3.  **Network Access**: Go to **Network Access** -> **Add IP Address**.
    - Choose **"Allow Access From Anywhere"** (`0.0.0.0/0`) for the initial setup.
4.  **Connection String**: Go to **Database** -> **Connect** -> **Connect your application**.
    - Copy the URI (it looks like `mongodb+srv://...`).
    - **Crucial**: Replace `<password>` with the password you created for the database user.

---

## 2. Backend Deployment (Render.com)

1.  **New Web Service**: Click **New +** -> **Web Service**.
2.  **Connect Repo**: Select your `Noor-Islamic-Library` repository.
3.  **Basic Settings**:
    - **Name**: `noor-library-api`
    - **Root Directory**: `backend`
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node app.js`
4.  **Environment Variables**: Add:
    - `MONGO_URI`: Your MongoDB Atlas connection string.
    - `JWT_KEY`: A long, random secret string (e.g., `h3llworld_noor_2024`).
    - `FRONTEND_URL`: Leave this for now; we'll update it after step 3.
    - `PORT`: `10000` (Render's default).

---

## 3. Frontend Deployment (Vercel)

1.  **New Project**: Click **Add New** -> **Project**.
2.  **Import Repo**: Select your `Noor-Islamic-Library` repository.
3.  **Configuration**:
    - **Framework Preset**: `Vite` (should be auto-detected).
    - **Root Directory**: `frontend`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  **Environment Variables**: Add:
    - Name: `VITE_BACKEND_URL`
    - Value: Your Render API URL (e.g., `https://noor-library-api.onrender.com`) **without** a trailing slash.
5.  **Deploy**: Click **Deploy**.

---

## 4. Finalizing the Connection

1.  **Copy Frontend URL**: Once Vercel is done, copy your app URL (e.g., `https://noor-library.vercel.app`).
2.  **Update Render**: Go to your Render Backend -> **Environment**.
    - Edit `FRONTEND_URL` and paste your Vercel URL.
3.  **Wait for Redeploy**: Render will automatically restart your server with the new CORS settings.

---

## 5. Seeding the Production Database

Since your new Atlas database is empty, you need to "seed" it. The easiest way is to run the scripts from your local computer pointed at the production DB:

1.  **Open `backend/.env`** (locally).
2.  **Temporarily** change `MONGO_URI` to your MongoDB Atlas connection string.
3.  Run these commands in your terminal (inside the `backend` folder):
    ```bash
    node seed.js                # Seeds Quran, Hadith, Categories
    node seed-duas.js           # Seeds Duas
    node seed-fiqh.js           # Seeds Fiqh
    node seed-seerah.js         # Seeds Seerah
    node populate-tafsir-library.js # Seeds Tafsir
    ```
4.  **Important**: Change the `MONGO_URI` back to your local one after you're done seeding!

---

## 6. Create your Admin Account

1.  Go to your live Vercel website and **Sign Up**.
2.  In your local terminal (with production `MONGO_URI` still in `.env` or set manually):
    ```bash
    node make-admin.js your-email@example.com
    ```
3.  You are now an admin and can manage content on the live site!
