# Google OAuth Setup Guide for FoodBridge

This guide will help you set up Google OAuth authentication for the FoodBridge application.

## Overview

Google OAuth allows users to sign in to FoodBridge using their Google accounts without needing to create a separate password. This provides:
- ✅ Quick and secure authentication
- ✅ No password to remember
- ✅ Pre-verified email addresses
- ✅ Automatic profile picture from Google

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `FoodBridge`
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required information:
   - **App name**: FoodBridge
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click "Save and Continue"
9. Add test users (optional for development)
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: FoodBridge Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
5. Click "Create"
6. **IMPORTANT**: Copy the "Client ID" - you'll need this!

## Step 5: Configure Environment Variables

### Backend Configuration

1. Open or create `.env` file in the root directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
```

2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with the Client ID from Step 4

### Frontend Configuration (Optional)

If you want to use a different Client ID for frontend (not recommended), create a `.env` file in the `client` folder:

```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Note**: The same Client ID can be used for both frontend and backend.

## Step 6: Update the Client ID in App.js (Alternative)

If you don't want to use environment variables, you can directly update the Client ID in `client/src/App.js`:

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
```

## Step 7: Restart the Application

1. Stop the backend server (if running)
2. Restart the backend:
   ```bash
   npm start
   ```
3. Stop the frontend (if running)
4. Restart the frontend:
   ```bash
   cd client
   npm start
   ```

## Testing the Integration

1. Navigate to the login page: `http://localhost:3000/login`
2. You should see a "Sign in with Google" button below the regular login form
3. Click the button
4. Select your Google account
5. Grant permissions
6. You should be logged in and redirected to role selection (if first-time) or dashboard

## Troubleshooting

### Error: "Origin not allowed"

**Problem**: JavaScript origin not authorized in Google Cloud Console

**Solution**:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add `http://localhost:3000` to "Authorized JavaScript origins"

### Error: "Redirect URI mismatch"

**Problem**: Redirect URI not authorized

**Solution**:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add `http://localhost:3000` to "Authorized redirect URIs"

### Error: "Invalid client ID"

**Problem**: Wrong Client ID or not configured

**Solution**:
1. Double-check your Client ID from Google Cloud Console
2. Ensure it's properly set in `.env` file
3. Restart the server after changing `.env`

### Google button not appearing

**Problem**: Package not installed or import error

**Solution**:
```bash
cd client
npm install @react-oauth/google
```

### Error: "google-auth-library not found"

**Problem**: Backend package not installed

**Solution**:
```bash
npm install google-auth-library
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. Use different Client IDs for development and production
3. Keep your Client Secret secure (not used in this implementation)
4. Regularly review authorized domains in Google Cloud Console
5. Monitor OAuth usage in Google Cloud Console

## Production Deployment

When deploying to production:

1. Create a new OAuth Client ID for production domain
2. Update "Authorized JavaScript origins" with production URL
3. Update "Authorized redirect URIs" with production URL
4. Set environment variables on your hosting platform:
   - Backend: `GOOGLE_CLIENT_ID`
   - Frontend: `REACT_APP_GOOGLE_CLIENT_ID`
5. Publish your OAuth consent screen (move from Testing to Production)

## How It Works

### Authentication Flow

1. User clicks "Sign in with Google"
2. Google popup opens for account selection
3. User selects account and grants permissions
4. Google returns a credential (JWT token)
5. Frontend sends credential to backend `/api/auth/google`
6. Backend verifies token with Google
7. Backend checks if user exists:
   - **Exists**: Login user
   - **New**: Create account automatically
8. Backend generates JWT token for session
9. User redirected to dashboard or role selection

### Data Stored

When a user signs in with Google, the following data is stored:

```javascript
{
  name: "John Doe",           // From Google
  email: "john@gmail.com",    // From Google
  googleId: "1234567890",     // Unique Google ID
  profilePic: "https://...",  // Google profile picture
  isVerified: true,           // Auto-verified
  role: null,                 // Selected by user
  location: null,             // Filled later
  phone: null                 // Filled later (optional)
}
```

## Features

- ✅ One-click sign-in
- ✅ No password required
- ✅ Auto-verified email
- ✅ Profile picture from Google
- ✅ Seamless new user registration
- ✅ Works alongside traditional login
- ✅ Same experience after login (role selection, dashboard)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google Cloud Console configuration
3. Check browser console for errors
4. Check backend logs for authentication errors

## References

- [Google Identity Documentation](https://developers.google.com/identity)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Library for Node.js](https://www.npmjs.com/package/google-auth-library)
