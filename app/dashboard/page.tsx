'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

interface InterviewHistory {
  id: string;
  date: string;
  type: string;
  difficulty: string;
  score: number;
  feedback: string;
}

export default function Dashboard() {
  const { user, setUser } = useAuthStore();
  const [interviews, setInterviews] = useState<InterviewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setLoading(false);
      // TODO: Fetch interview history from Firestore
    }
  }, [user, router]);

  const handleLogout = async () => {
    // START FIX: Check if auth is defined before using it
    if (!auth) {
      console.error('Firebase Auth is not initialized. Cannot log out.');
      // Optionally redirect the user to prevent them from getting stuck
      setUser(null);
      router.push('/');
      return; 
    }
    // END FIX

    try {
      await signOut(auth); // This was the line causing the error when 'auth' was undefined
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            AI Mock Interview
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-blue-100">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Start Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Welcome back!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Interview Card */}
            <Link
              href="/interview/start"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/20 transition cursor-pointer"
            >
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Start Interview
              </h3>
              <p className="text-blue-100">
                Begin a new mock interview session
              </p>
            </Link>

            {/* My Stats Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                My Stats
              </h3>
              <div className="text-blue-100">
                <p>Total Interviews: {interviews.length}</p>
                <p>Average Score: 0/100</p>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Interview Tips
              </h3>
              <p className="text-blue-100 text-sm">
                Learn best practices for acing your interviews
              </p>
            </div>
          </div>
        </div>

        {/* Interview History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Interview History
          </h2>
          {interviews.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 text-center">
              <p className="text-blue-100 text-lg">
                No interviews yet. Start your first interview!
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr
                      key={interview.id}
                      className="border-b border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-4 text-blue-100">
                        {interview.date}
                      </td>
                      <td className="px-6 py-4 text-blue-100">
                        {interview.type}
                      </td>
                      <td className="px-6 py-4 text-blue-100">
                        {interview.difficulty}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {interview.score}/100
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-300 hover:text-blue-100 transition">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}