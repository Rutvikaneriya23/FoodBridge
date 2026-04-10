# 🚀 Quick Start: Google OAuth Setup

## ⚡ 5-Minute Setup

### 1. Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create Project → Enable Google+ API
3. OAuth Consent Screen → External → Save
4. Create Credentials → OAuth Client ID → Web Application
5. Add `http://localhost:3000` to Authorized JavaScript origins
6. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 2. Configure Backend
Create/Edit `.env` file in root directory:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here.apps.googleusercontent.com
```

### 3. Configure Frontend (Optional)
Edit `client/src/App.js`, line ~33:
```javascript
const GOOGLE_CLIENT_ID = 'paste_your_client_id_here.apps.googleusercontent.com';
```

### 4. Restart Servers
```bash
# Backend (root directory)
npm start

# Frontend (in new terminal)
cd client
npm start
```

### 5. Test It! 🎉
- Go to `http://localhost:3000/login`
- Click "Sign in with Google"
- Select your Google account
- Done!

## 📦 Already Installed Packages

✅ Frontend: `@react-oauth/google`
✅ Backend: `google-auth-library`

## 🎯 What You Get

- One-click Google sign-in
- No password needed
- Auto-verified accounts
- Profile pictures from Google
- Works with existing login system

## 🐛 Common Issues

**"Origin not allowed"**
→ Add `http://localhost:3000` to Google Console → Authorized JavaScript origins

**"Invalid client ID"**
→ Check `.env` file has correct GOOGLE_CLIENT_ID

**Button not showing**
→ Clear browser cache and restart frontend

**Backend error**
→ Make sure you restarted the server after adding GOOGLE_CLIENT_ID to `.env`

## 📚 Full Documentation

See `GOOGLE_OAUTH_SETUP.md` for complete setup guide with troubleshooting.

---

**Need help?** Check the browser console (F12) and backend terminal for error messages.
