'use client';

import { useEffect } from 'react';
import { useInterviewStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InterviewResults() {
  const { score, feedback, interviewType, difficulty, reset } = useInterviewStore();
  const router = useRouter();

  useEffect(() => {
    // If no score, redirect back to start
    if (score === 0 && !feedback) {
      router.push('/interview/start');
    }
  }, [score, feedback, router]);

  const handleNewInterview = () => {
    reset();
    router.push('/interview/start');
  };

  const handleDashboard = () => {
    reset();
    router.push('/interview/start');
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreFeedback = () => {
    if (score >= 80) return 'Excellent performance!';
    if (score >= 60) return 'Good job! Keep practicing.';
    return 'Need more practice. Try again!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Interview Results</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Results */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 mb-6">
              {/* Score Display */}
              <div className="text-center mb-8">
                <p className="text-blue-100 mb-2">Your Score</p>
                <div className={`text-6xl font-bold ${getScoreColor()} mb-4`}>
                  {score}%
                </div>
                <p className="text-2xl font-semibold text-white mb-4">
                  {getScoreFeedback()}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-8 bg-black/20 rounded-lg p-6">
                <div>
                  <p className="text-sm text-blue-200">Communication</p>
                  <p className="text-2xl font-bold text-white">8.5/10</p>
                </div>
                <div>
                  <p className="text-sm text-blue-200">Content Quality</p>
                  <p className="text-2xl font-bold text-white">7.5/10</p>
                </div>
                <div>
                  <p className="text-sm text-blue-200">Structure</p>
                  <p className="text-2xl font-bold text-white">8.0/10</p>
                </div>
                <div>
                  <p className="text-sm text-blue-200">Confidence</p>
                  <p className="text-2xl font-bold text-white">8.0/10</p>
                </div>
              </div>

              {/* Interview Details */}
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Interview Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-blue-100">
                  <div>
                    <p className="text-sm">Type</p>
                    <p className="font-semibold text-white capitalize">
                      {interviewType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Difficulty</p>
                    <p className="font-semibold text-white capitalize">
                      {difficulty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Duration</p>
                    <p className="font-semibold text-white">5 minutes</p>
                  </div>
                  <div>
                    <p className="text-sm">Date</p>
                    <p className="font-semibold text-white">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Sidebar */}
          <div className="space-y-6">
            {/* AI Feedback */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                AI Feedback
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                {feedback || 'Great job overall! Work on maintaining consistent eye contact and speaking with more confidence.'}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recommendations
              </h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>• Practice speaking clearly</li>
                <li>• Work on time management</li>
                <li>• Prepare better examples</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <button
            onClick={handleNewInterview}
            className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Start New Interview
          </button>
          <Link
            href="/dashboard"
            className="flex-1 min-w-[200px] bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition border border-white/20 text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
