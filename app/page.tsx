'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading, setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Mock Interview
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Practice your interview skills with AI-powered feedback
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Get Started
          </h2>
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white">
          <h3 className="text-xl font-semibold mb-4">Why AI Mock Interview?</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Real-time feedback from AI interviewer</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Multiple interview types and difficulty levels</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Track your progress and improvement</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Learn from AI-generated insights</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
