# 🎮 GameMatch

> Find your next game in seconds — solo or with friends.

## Run Locally

**Terminal 1 — Backend:**
```bash
cd server
npm install
node index.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm start
```

Open http://localhost:3000

---

## Deploy to Render (Free)

### Step 1 — Push to GitHub

1. Create a free account at [github.com](https://github.com)
2. Create a new repository called `gamematch` (set to Public)
3. Open Command Prompt in your `gamematch` folder and run:

```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gamematch.git
git push -u origin main
```

### Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign up free
2. Click **New** → **Web Service**
3. Connect your GitHub account → select `gamematch` repo
4. Fill in:
   - **Name:** `gamematch-api`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Click **Create Web Service**
6. Wait ~2 minutes → copy the URL (e.g. `https://gamematch-api.onrender.com`)

### Step 3 — Deploy Frontend on Render

1. Click **New** → **Static Site**
2. Connect same `gamematch` repo
3. Fill in:
   - **Name:** `gamematch-app`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build:prod`
   - **Publish Directory:** `build`
4. Add **Environment Variable:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://gamematch-api.onrender.com` (your backend URL from Step 2)
5. Click **Create Static Site**
6. Wait ~3 minutes → your site is live!

### Step 4 — Update CORS (optional)

In Render dashboard → `gamematch-api` service → Environment:
- Add `CLIENT_URL` = your frontend URL (e.g. `https://gamematch-app.onrender.com`)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router 6, Lucide Icons |
| Backend | Node.js, Express |
| Data | JSON (150 games) |
| Fonts | Inter + Manrope (Google Fonts) |
| Deploy | Render (free tier) |

---

## Notes

- **Free tier on Render** spins down after 15 min of inactivity — first request may take ~30s to wake up
- Rooms are stored in memory and reset when the server restarts
- Cover images are loaded from Steam CDN — requires internet connection
