#!/bin/bash
# ============================================================================
# VERCEL ENVIRONMENT SETUP CHECKLIST
# ============================================================================
# Run this checklist in Vercel Project Settings > Environment Variables
#
# These are ALL required for the app to work on Vercel.
# Add each as a separate environment variable.
#
# ============================================================================
# SECTION 1: FIREBASE CLIENT (Public - required)
# ============================================================================

# Get these from Firebase Console > Project Settings > General > Your apps > Web
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCgeaggtjyjvhAnctisqF0PFSkKj6f6ZJg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prepsmart-68849.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prepsmart-68849
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prepsmart-68849.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=447568244898
NEXT_PUBLIC_FIREBASE_APP_ID=1:447568244898:web:71c0d4608bc8abe047e7fb
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional if you have it

# ============================================================================
# SECTION 2: FIREBASE ADMIN (Server-side - CRITICAL!)
# ============================================================================
# 
# BEST PRACTICE FOR VERCEL:
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate New Private Key" (creates a JSON file)
# 3. Copy the ENTIRE JSON content (all lines including braces)
# 4. In Vercel, create a NEW environment variable:
#    Name: FIREBASE_PRIVATE_KEY_JSON
#    Value: [PASTE THE ENTIRE JSON as ONE LINE, no line breaks]
#    Example: {"type":"service_account","project_id":"prepsmart-68849",...}
#
# Do NOT copy individual values - this won't work! The API route expects
# to parse the entire JSON object.

FIREBASE_PRIVATE_KEY_JSON={"type":"service_account","project_id":"prepsmart-68849","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@prepsmart-68849.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}

# ============================================================================
# SECTION 3: GEMINI API (Question Generation)
# ============================================================================
# Get from: https://makersuite.google.com/app/apikey

GEMINI_API_KEY=your_gemini_api_key_here

# ============================================================================
# SECTION 4: VAPI (Voice AI)
# ============================================================================
# Get from: https://dashboard.vapi.ai/settings

NEXT_PUBLIC_VAPI_PUBLIC_KEY=e722785e-503b-407d-8b67-e48aa3dd49a8
NEXT_PUBLIC_VAPI_ASSISTANT_ID=f7c81940-45eb-40bd-89f0-bdb19e7f6d2c
VAPI_API_KEY=e722785e-503b-407d-8b67-e48aa3dd49a8

# ============================================================================
# AFTER SETTING THESE:
# 1. Click "Save" on each env var in Vercel
# 2. Vercel will automatically redeploy with new env vars
# 3. Monitor Deployments tab for build logs
# 4. Check Observability > Functions for runtime errors
# ============================================================================

