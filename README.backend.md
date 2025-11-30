# JSM Mock Interview — Backend (Vapi → Gemini → Firestore)

This document contains setup and testing instructions for the backend component that accepts data from a Vapi workflow, calls Google Generative Language (Gemini) to generate interview questions, and stores results in Firestore.

## Key endpoint

- `POST /api/vapi/generate` — accepts collected user input (role, level, tech stack, preferences), calls Gemini to create a JSON set of interview questions, and stores the result in Firestore.

## 1. Environment variables

Create a `.env.local` in the project root (use `.env.local.example` as a template). Do NOT commit this file.

Required variables (one of the Firebase Admin options must be provided):

- `GEMINI_API_KEY` — Server-side API key for Google Generative Language (Gemini).

Firebase Admin SDK options (choose one):

Option A: Single JSON string
- `FIREBASE_PRIVATE_KEY_JSON` — Paste the full service account JSON as a single string (escape double quotes or wrap correctly for your host).

Option B: Individual vars (recommended for some hosts)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` — Replace literal newlines with `\\n` (e.g. `-----BEGIN PRIVATE KEY-----\\nMII...\\n-----END PRIVATE KEY-----\\n`).

Also include any client-side `NEXT_PUBLIC_FIREBASE_*` vars if you've enabled frontend Firebase features.

## 2. Install dependencies

From the project root:

```powershell
cd "C:\Users\Lakshya\Desktop\jsm_mock_interview_\my-app"
npm install
```

## 3. Start Next.js dev server

```powershell
npm run dev
```

Server runs on `http://localhost:3000` by default.

## 4. Smoke test the endpoint

A smoke-test script is included at `scripts/test-vapi-generate.js`.

Run it while the dev server is running:

```powershell
node scripts/test-vapi-generate.js
```

Expected successful response:

```
{ "success": true, "id": "<firestore-doc-id>", "generated": { "questions": [ ... ] } }
```

Check Firestore collection `generated_interviews` for the new document.

## 5. Troubleshooting

- Missing env vars: The server logs will show errors about missing `GEMINI_API_KEY` or Firebase credentials. Restart the dev server after editing `.env.local`.
- Gemini errors: If the Gemini API fails or returns non-JSON output, the endpoint falls back to a small set of template questions and still writes to Firestore.
- Firestore permission errors: Verify that the Admin service account JSON belongs to the same Firebase project and has proper permissions.

## 6. Next steps

- Hook up your Vapi workflow to POST to `/api/vapi/generate` when the voice conversation finishes.
- Improve the Gemini prompt to produce domain-specific question templates for various roles and difficulty levels.
- Add validation and stronger schema checks on the generated JSON before persisting.
- Implement front-end UI to display generated questions and schedule interviews.
