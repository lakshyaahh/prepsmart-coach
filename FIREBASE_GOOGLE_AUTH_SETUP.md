# Firebase Google Authentication Setup Guide

## Issue
Google Sign-in is returning: `Firebase: Error (auth/invalid-credential)`

## Solution: Enable Google Sign-in in Firebase Console

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Select your project: **prepsmart-68849**
3. Go to **Authentication** > **Sign-in method**

### Step 2: Enable Google Sign-in
1. Click on **Google** provider
2. Enable the toggle switch
3. Select a **Project Support Email** (dropdown)
   - Choose your email or create a default one
4. Click **Save**

### Step 3: Configure Authorized Domains
1. Go to **Authentication** > **Settings** > **Authorized domains**
2. Ensure these domains are whitelisted:
   - `localhost` (for local development)
   - `192.168.56.1` (for network access)
   - Your ngrok domain: `roseanna-capitular-kneadingly.ngrok-free.dev`
   - Any deployed domain (e.g., Vercel URL)

### Step 4: Verify OAuth Consent Screen (if needed)
1. Go to https://console.cloud.google.com
2. Select project **prepsmart-68849**
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Choose **External** user type
5. Fill in required fields:
   - **App name**: "PrepSmart Interview"
   - **User support email**: your email
   - **Developer contact**: your email
6. Click **Save and Continue**
7. On "Scopes" page, click **Save and Continue**
8. On "Summary" page, click **Back to Dashboard**

### Step 5: Test Locally
After changes propagate (usually 5-10 minutes):
1. Clear browser cookies/cache for `localhost:3000`
2. Reload your app
3. Click "Sign in with Google"
4. You should see the Google Sign-in popup

---

## Common Issues & Fixes

### Issue: Still seeing "invalid-credential" error
- **Cause**: Firebase Console changes take 5-10 minutes to propagate
- **Fix**: Wait and try again, or try in an incognito/private window

### Issue: Popup is blocked
- **Cause**: Browser blocking popups
- **Fix**: Check your browser's popup blocker settings and allow popups for your domain

### Issue: Redirect URI mismatch
- **Cause**: Domain not authorized
- **Fix**: Make sure your current domain (localhost, ngrok, or deployed URL) is in the Authorized domains list

### Issue: CORS error
- **Cause**: Cross-origin issue
- **Fix**: Firebase should handle this automatically, but check that you're using the correct API key

---

## Troubleshooting Checklist

- [ ] Google provider is **enabled** in Authentication > Sign-in method
- [ ] Your current domain is in **Authorized domains**
- [ ] Changes have propagated (wait 5-10 minutes)
- [ ] Browser cookies are cleared
- [ ] You're using the correct Firebase project (prepsmart-68849)
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY is correct in `.env.local`
