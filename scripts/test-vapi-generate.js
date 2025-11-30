// Node smoke-test for /api/vapi/generate
// Usage: Start your Next.js dev server (localhost:3000), then run:
//   node scripts/test-vapi-generate.js

(async () => {
  const endpoint = 'http://localhost:3000/api/vapi/generate';

  const payload = {
    role: 'Frontend Developer',
    level: 'junior',
    techStack: ['react', 'typescript'],
    experienceYears: 2,
    interviewType: 'technical',
    preferences: { focus: 'components, hooks, testing' }
  };

  console.log(`POST -> ${endpoint}`);
  console.log('Payload:', payload);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error('Request failed:', res.status, text);
      process.exitCode = 1;
      return;
    }

    // Try parse JSON result
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    console.log('\n--- Response ---');
    console.log(JSON.stringify(data, null, 2));

    if (data && data.id) {
      console.log('\nFirestore doc id:', data.id);
    }

    console.log('\nCheck Firestore collection `generated_interviews` for the new document.');
  } catch (err) {
    console.error('Error calling endpoint:', err);
    process.exitCode = 1;
  }
})();
