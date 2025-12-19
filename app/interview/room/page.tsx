'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVapi } from '@/lib/vapi.sdk';

interface VapiCollectedData {
  role?: string;
  level?: string;
  techStack?: string | string[];
  experienceYears?: number;
  preferences?: { [key: string]: any };
  interviewType?: string;
}

export default function InterviewRoom() {
  const router = useRouter();
  const [useVapiMode, setUseVapiMode] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectedVapiData, setCollectedVapiData] = useState<VapiCollectedData | null>(null);
  const [vapiStatus, setVapiStatus] = useState('idle');
  const [vapiTranscript, setVapiTranscript] = useState('');
  const [vapiAiResponse, setVapiAiResponse] = useState('');
  
  // Get interview parameters from session/state
  const [interviewType] = useState('general');
  const [difficulty] = useState('medium');

  const generateQuestionsFromVapiData = async (data: VapiCollectedData) => {
    setLoading(true);
    try {
      const payload = {
        role: data.role || interviewType,
        level: data.level || difficulty,
        techStack: Array.isArray(data.techStack)
          ? data.techStack
          : (data.techStack || '')
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean),
        experienceYears: data.experienceYears || 0,
        interviewType: data.interviewType || interviewType,
        preferences: data.preferences || { focus: 'general' },
      };

      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);

      const result = await response.json();
      if (result.success && result.generated?.questions) {
        setQuestions(
          result.generated.questions.map((q: any, idx: number) => ({
            id: q.id || `q${idx}`,
            text: q.text || 'No question text',
            difficulty: q.difficulty || 'medium',
            type: q.type || 'technical',
          }))
        );
        setQuestionIndex(0);
        setUseVapiMode(false);
        stopVapiCall();
      }
    } catch (error: any) {
      alert(`Failed to generate questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const { startVapiCall, stopVapiCall } = useVapi({
    onCallStart: () => {
      console.log('Vapi call started');
      setVapiStatus('active');
    },
    onCallEnd: () => {
      console.log('Vapi call ended');
      setVapiStatus('ended');
      if (collectedVapiData) {
        generateQuestionsFromVapiData(collectedVapiData);
      }
    },
    onMessage: (message: any) => {
      if (message.type === 'user-message') {
        setVapiTranscript(message.message?.content || '');
      } else if (message.type === 'bot-message') {
        setVapiAiResponse(message.message?.content || '');
      }
    },
    onError: (error: any) => {
      console.error('Vapi error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      alert(`Vapi Error: ${error?.message || JSON.stringify(error)}`);
      setVapiStatus('error');
    },
    onConversationUpdate: (update: any) => {
      console.log('Vapi conversation update:', update);
      if (update.collectedData) {
        console.log('✅ Vapi collected data:', update.collectedData);
        setCollectedVapiData(update.collectedData);
      }
    },
    onSpeechStart: () => {
      console.log('Speech detected - Vapi listening');
    },
    onSpeechEnd: () => {
      console.log('Speech ended - Vapi processing');
    },
  });

  const handleStartVapi = () => {
    setVapiStatus('connecting');
    startVapiCall();
  };

  const handleRecordAnswer = () => {
    setRecording(!recording);
    if (recording) {
      // Simulate recording stop
      setScore(Math.floor(Math.random() * 40 + 60));
      setFeedback('Great answer! Clear explanation with good structure.');
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setScore(null);
      setFeedback('');
      setAnswer('');
    }
  };

  const handleSubmit = () => {
    router.push('/interview/results');
  };

  const currentQuestion = questions[questionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Mode Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Interview Room</h1>
          <button
            onClick={() => setUseVapiMode(!useVapiMode)}
            className="px-4 py-2 rounded-lg font-semibold transition"
            style={{
              backgroundColor: useVapiMode ? '#10b981' : '#6366f1',
              color: 'white',
            }}
          >
            {useVapiMode ? '🎤 Vapi AI' : '📝 Manual'}
          </button>
        </div>

        {useVapiMode ? (
          // Vapi AI Mode
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview with AI Assistant</h2>

            {vapiStatus === 'idle' && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">Click below to start speaking with the AI interviewer. They will ask you questions and collect your information.</p>
                <button
                  onClick={handleStartVapi}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition"
                >
                  Start AI Interview
                </button>
              </div>
            )}

            {vapiStatus === 'connecting' && (
              <div className="text-center">
                <p className="text-blue-600 font-semibold mb-4">🔄 Connecting to AI...</p>
              </div>
            )}

            {vapiStatus === 'active' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-2">AI Response:</p>
                  <p className="text-gray-800">{vapiAiResponse || 'Listening...'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Your Response:</p>
                  <p className="text-gray-800">{vapiTranscript || 'Waiting for your input...'}</p>
                </div>
                <div className="text-center">
                  <button
                    onClick={stopVapiCall}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition"
                  >
                    End Interview
                  </button>
                </div>
              </div>
            )}

            {vapiStatus === 'ended' && collectedVapiData && (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-2">✅ Data Collected:</p>
                  <pre className="text-xs text-gray-800 overflow-auto">{JSON.stringify(collectedVapiData, null, 2)}</pre>
                </div>
                <button
                  onClick={() => collectedVapiData && generateQuestionsFromVapiData(collectedVapiData)}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {loading ? '⏳ Generating Questions...' : '✨ Generate Questions'}
                </button>
              </div>
            )}

            {vapiStatus === 'error' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600 font-semibold">❌ Error occurred during interview</p>
                <button
                  onClick={() => setVapiStatus('idle')}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          // Manual Mode
          <div className="bg-white rounded-lg shadow-xl p-8">
            {questions.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    Question {questionIndex + 1} of {questions.length}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion?.text || 'No question'}</h2>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Type or record your answer here..."
                  />
                </div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleRecordAnswer}
                    className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
                      recording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {recording ? '⏹ Stop Recording' : '🎤 Record Answer'}
                  </button>
                  <button
                    onClick={() => setAnswer('')}
                    className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-bold transition"
                  >
                    Clear
                  </button>
                </div>

                {score && (
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-600 font-semibold mb-2">✅ Score: {score}%</p>
                    <p className="text-gray-800">{feedback}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  {questionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                    >
                      Submit Interview
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">No questions available yet.</p>
                <button
                  onClick={() => setUseVapiMode(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                >
                  Start with AI to Generate Questions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
