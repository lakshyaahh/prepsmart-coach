'use client';

import { useState } from 'react';
import { useInterviewStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const interviewTypes = [
  { id: 'technical', label: 'Technical Interview' },
  { id: 'behavioral', label: 'Behavioral Interview' },
  { id: 'system-design', label: 'System Design Interview' },
];

const difficultyLevels = [
  { id: 'easy', label: 'Easy', description: 'Entry-level questions' },
  { id: 'medium', label: 'Medium', description: 'Mid-level questions' },
  { id: 'hard', label: 'Hard', description: 'Advanced questions' },
];

export default function InterviewStart() {
  const { interviewType, difficulty, setInterviewType, setDifficulty } = useInterviewStore();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(interviewType);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);

  const handleStartInterview = () => {
    if (selectedType && selectedDifficulty) {
      setInterviewType(selectedType);
      setDifficulty(selectedDifficulty);
      router.push('/interview/room');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Start Interview
          </h1>
          <div className="text-blue-100 text-sm">
            No account needed - Practice for free
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
          {/* Interview Type Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Select Interview Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-6 rounded-lg border-2 transition ${
                    selectedType === type.id
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xl font-semibold text-white">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Select Difficulty Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedDifficulty(level.id)}
                  className={`p-6 rounded-lg border-2 transition ${
                    selectedDifficulty === level.id
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xl font-semibold text-white">
                    {level.label}
                  </div>
                  <div className="text-sm text-blue-200 mt-2">
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Guidelines */}
          <div className="mb-12 bg-blue-500/20 border border-blue-400/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Interview Guidelines
            </h3>
            <ul className="space-y-2 text-blue-100">
              <li>✓ Ensure your microphone is working properly</li>
              <li>✓ Find a quiet environment for the interview</li>
              <li>✓ Have a pen and paper ready for notes</li>
              <li>✓ Take your time to think before answering</li>
              <li>✓ Speak clearly and confidently</li>
            </ul>
          </div>

          {/* Start Button */}
          <div className="flex gap-4">
            <button
              onClick={handleStartInterview}
              disabled={!selectedType || !selectedDifficulty}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Start Interview
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition border border-white/20"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
