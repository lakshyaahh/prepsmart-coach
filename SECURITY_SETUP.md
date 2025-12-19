# Security & Environment Setup Guide

## ⚠️ Critical: Never Commit Secrets

This project uses **Git Guardian** to detect exposed secrets. All API keys and credentials are `.gitignore`'d and should NEVER be committed.

---

## 🔐 Local Development Setup

### 1. Create `.env.local` (Never Commit This)
```bash
cp .env.local.example .env.local
```

### 2. Add Your Real Secrets to `.env.local`

#### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project **prepsmart-68849**
3. Go to **Project Settings** (⚙️ icon)
4. Copy all values for:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Firebase Admin SDK (Server-Side Only)
1. Still in **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. A JSON file downloads - open it and copy the values:
   ```
   FIREBASE_PROJECT_ID=<project_id>
   FIREBASE_PRIVATE_KEY="<private_key>" (keep the quotes!)
   FIREBASE_CLIENT_EMAIL=<client_email>
   ```

#### Vapi Configuration
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Get your **Public Key** → `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
3. Get your **Assistant ID** → `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
4. ⚠️ DO NOT add private API keys to `.env` - only public keys in `NEXT_PUBLIC_*` vars

#### Gemini API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Generative Language API**
3. Create API key in **Credentials**
4. Add to `.env.local`: `GEMINI_API_KEY=<your_key>`

### 3. Format Your `.env.local`
```dotenv
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prepsmart-68849.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prepsmart-68849
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prepsmart-68849.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=447568244898
NEXT_PUBLIC_FIREBASE_APP_ID=1:447568244898:web:...

FIREBASE_PROJECT_ID=prepsmart-68849
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prepsmart-68849.iam.gserviceaccount.com

# Vapi Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=e722...
NEXT_PUBLIC_VAPI_ASSISTANT_ID=c9ba...

# Gemini API
GEMINI_API_KEY=AIza...
```

### 4. Test Locally
```bash
npm run dev
```

---

## 🚀 Vercel Deployment Setup

### ✅ Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/lakshyaahh/prepsmart-coach)
2. Go to **Settings** → **Environment Variables**
3. Add ALL variables from `.env.local` (both `NEXT_PUBLIC_*` and private ones)

### For Firebase Admin SDK on Vercel:
Create a **single JSON blob** variable:

```
FIREBASE_PRIVATE_KEY_JSON={"type":"service_account","project_id":"prepsmart-68849","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@prepsmart-68849.iam.gserviceaccount.com",...}
```

The API code automatically handles this in `/app/api/vapi/generate/route.ts`:
```typescript
const privateKeyJson = process.env.FIREBASE_PRIVATE_KEY_JSON
  ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON)
  : {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
```

### 4. Redeploy
Push a new commit to trigger Vercel rebuild:
```bash
git add .
git commit -m "chore: deploy with env vars configured"
git push origin master
```

---

## 🛡️ Git Guardian Integration

### What It Detects:
✅ API Keys  
✅ Private Keys  
✅ Passwords  
✅ Database Credentials  
✅ OAuth Tokens  

### If Secrets Are Exposed:
1. **Immediately revoke** the exposed key in its service (Firebase, Vapi, Google Cloud, etc.)
2. **Generate new key** from the service dashboard
3. **Update Vercel env vars** with the new key
4. **Push new commit** to GitHub (Git Guardian will clear the alert once new secret is used)

### How We're Protected:
- ✅ `.gitignore` blocks `.env.local` and `.env*` from Git
- ✅ `.env.local.example` shows structure without secrets
- ✅ Git Guardian webhook alerts on any slip-ups
- ✅ Build succeeds without local `.env.local` (uses Vercel env vars)

---

## 🔄 Workflow Checklist

- [ ] `.env.local` created locally (in `.gitignore`)
- [ ] All secrets added to local `.env.local`
- [ ] `npm run dev` works on localhost
- [ ] All env vars added to Vercel dashboard
- [ ] Git push triggers Vercel build
- [ ] Vercel deployment succeeds (green checkmark)
- [ ] Live site works: https://prepsmart-coach.vercel.app

---

## ⚠️ DO NOT:
❌ Never commit `.env.local` or `.env` files  
❌ Never paste secrets in code comments  
❌ Never share API keys in Slack/Discord  
❌ Never use production keys for local testing  
❌ Never push without Git Guardian checking  

---

## 📞 Troubleshooting

**Build fails with "Cannot find module 'firebase'"**
→ Run `npm install` to ensure dependencies installed

**Vercel shows undefined variables**
→ Check Vercel dashboard env vars are set (Settings > Environment Variables)

**Git Guardian alert about old keys**
→ Old keys must be revoked in their respective services (Firebase, Vapi, Google)

**Local dev works but Vercel fails**
→ Check `NEXT_PUBLIC_*` vs private var distinction in Vercel settings

---

## ✅ Status
- Next.js: `15.2.8` (CVE-2025-66478 patched)
- Git Guardian: Active monitoring
- Secrets: Removed from history
- `.gitignore`: Configured for all env files
