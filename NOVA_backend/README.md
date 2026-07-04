# NOVA Backend

Express + MongoDB backend for the NOVA campus lost-and-found system.

## Quick Start

```bash
cd NOVA_backend
cp .env.example .env     # then fill in the values (see below)
npm install
npm run dev              # starts with --watch for auto-reload
```

The server runs on `http://localhost:5000` by default.

---

## Setting Up Google OAuth 2.0 Credentials

Follow these steps to get the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` needed in your `.env` file.

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top → **New Project**
3. Name it something like `NOVA Campus App` → **Create**
4. Make sure the new project is selected in the dropdown

### 2. Configure the OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services → OAuth consent screen**
2. Select **External** user type → **Create**
3. Fill in the required fields:
   - **App name**: `NOVA - Campus Lost & Found`
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes** and select:
   - `email`
   - `profile`
   - `openid`
6. Click **Save and Continue** through the remaining steps

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Select **Web application** as the application type
4. **Name**: `NOVA Web Client`
5. **Authorized JavaScript origins**:
   - `http://localhost:3000` (frontend dev server)
   - `http://localhost:5000` (backend dev server)
6. **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
   - *(Add your production URL here when you deploy)*
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** into your `.env` file

> **Important**: For production, add your deployed backend URL to the authorized redirect URIs (e.g., `https://api.your-domain.com/api/auth/google/callback`).

### 4. Configure Your `.env` File

```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWTs | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | Full callback URL for Google OAuth | Yes |
| `CLIENT_URL` | Frontend URL for CORS and redirects (default: `http://localhost:3000`) | No |

---

## API Routes

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/auth/google` | Redirects to Google OAuth consent screen |
| `GET` | `/api/auth/google/callback` | Handles OAuth callback from Google |
| `GET` | `/api/health` | Health check endpoint |

---

## Project Structure

```
NOVA_backend/
├── middleware/
│   └── auth.js          # JWT verification middleware
├── models/
│   └── User.js          # Mongoose user schema
├── routes/
│   └── auth.js          # Google OAuth routes
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
├── README.md
└── server.js            # Express entry point
```
