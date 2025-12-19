import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// ------ Firebase admin initialization helper ------
function initFirebaseAdmin() {
  // Return early if already initialized
  if (admin.apps && admin.apps.length) return admin;

  // Strategy 1: FIREBASE_PRIVATE_KEY_JSON (preferred for Vercel)
  const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY_JSON;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log("✓ Firebase Admin initialized with FIREBASE_PRIVATE_KEY_JSON");
      return admin;
    } catch (parseErr) {
      console.error("Failed to parse FIREBASE_PRIVATE_KEY_JSON:", parseErr);
    }
  }

  // Strategy 2: Individual env vars (fallback for local development)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY as string | undefined;
  
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [
      !projectId ? "FIREBASE_PROJECT_ID" : null,
      !clientEmail ? "FIREBASE_CLIENT_EMAIL" : null,
      !privateKey ? "FIREBASE_PRIVATE_KEY" : null,
    ].filter(Boolean);
    
    throw new Error(
      `Firebase credentials incomplete. Missing: ${missing.join(", ")}. Either set FIREBASE_PRIVATE_KEY_JSON or all three: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.`
    );
  }

  const serviceAccount = {
    projectId,
    clientEmail,
    privateKey,
  } as admin.ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log("✓ Firebase Admin initialized with individual env vars");
  return admin;
}

// ------ Gemini (Google Generative Language) helper ------
async function generateQuestionsWithGemini(collectedData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables");

  // Compose a clear instruction that requests strict JSON output.
  const prompt = `You are an interview generator. Given the following user profile and preferences, generate a JSON object with a top-level key \"questions\" that is an array of question objects. Each question object should include: id (string), text (string), type (\"technical\" or \"behavioral\"), difficulty (\"easy\"|\"medium\"|\"hard\"), and estimated_seconds (number).
  \n
  User profile (JSON): ${JSON.stringify(collectedData)}

  Return strictly valid JSON and nothing else.`;

  const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${apiKey}`;

  const body = {
    prompt: { text: prompt },
    temperature: 0.2,
    maxOutputTokens: 512,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${txt}`);
  }

  const json = await resp.json();
  // The Generative Language API returns `candidates` with `output` text
  const candidateText: string | undefined = (json?.candidates && json.candidates[0] && json.candidates[0].output) || json?.candidates?.[0]?.content || json?.output?.[0]?.content;

  const text = candidateText ?? JSON.stringify(json);

  // Try to extract JSON object from the response text
  try {
    // If the model returned a JSON string, parse it
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    // fallback: try to find first { ... } block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        throw new Error("Failed to parse JSON from Gemini response");
      }
    }
    throw new Error("Gemini response did not contain parseable JSON");
  }
}

// ------ API Handlers ------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received data from Vapi Assistant:", body);

    // Validate input - expected to at least include a role and preferences
    const collected = body || {};

    // Initialize Firebase admin
    const adminInstance = initFirebaseAdmin();
    const firestore = adminInstance.firestore();

    // Call Gemini to generate structured questions
    let generated: any;
    try {
      generated = await generateQuestionsWithGemini(collected);
    } catch (genErr) {
      console.error("Gemini generation failed:", genErr);
      // graceful fallback: create a simple set of template questions
      generated = {
        questions: [
          { id: "q1", text: `Tell me about your experience as a ${collected.role || "developer"}.`, type: "behavioral", difficulty: "easy", estimated_seconds: 60 },
          { id: "q2", text: `Describe a challenging technical problem you solved in ${collected.techStack || "your tech stack"}.`, type: "technical", difficulty: "medium", estimated_seconds: 90 },
        ],
        fallback: true,
      };
    }

    // Persist to Firestore
    const docRef = await firestore.collection("generated_interviews").add({
      createdAt: new Date().toISOString(),
      collected,
      generated,
      source: "vapi",
    });

    // Ensure response is fully serializable (no Firestore FieldValue or Date objects)
    const safeResponse = {
      success: true,
      id: docRef.id,
      generated: JSON.parse(JSON.stringify(generated)),
    };
    return NextResponse.json(safeResponse, { status: 200 });
  } catch (error) {
    console.error("Error in Vapi generate endpoint:", error);
    const errorMessage = (error as Error).message || "Failed to process request";
    console.error("Full error stack:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Vapi Generate Endpoint - Hey we are live! 🚀", status: "ready" }, { status: 200 });
}
