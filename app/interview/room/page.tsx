'use client';

import { useEffect, useRef, useState } from 'react';
import { useInterviewStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVapi, VapiEventType } from '@/lib/vapi.sdk';

// Define the structure of data collected by Vapi AI assistant
interface VapiCollectedData {
  role?: string;
  level?: 'junior' | 'mid' | 'senior';
  techStack?: string[];
  experienceYears?: number;
  interviewType?: string;
  preferences?: { focus?: string };
  [key: string]: any;
}

export default function InterviewRoom() {
  const { interviewType, difficulty, setCurrentQuestion, setFeedback, setScore } = useInterviewStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Vapi hook for voice conversation
  const {
    startVapiCall,
    stopVapiCall,
    isVapiCallActive,
    vapiAssistantId,
    isVapiReady,
  } = useVapi({
    onCallStart: () => {
      console.log('Vapi call started');
      setVapiStatus('active');
    },
    onCallEnd: () => {
      console.log('Vapi call ended');
      setVapiStatus('ended');
      // If data was collected during the call, generate questions
      if (collectedVapiData) {
        console.log('📋 Generating questions from collected Vapi data...');
        generateQuestionsFromVapiData(collectedVapiData);
      }
    },
    onMessage: (message: any) => {
      console.log('Vapi message:', message);
      // Handle incoming messages from Vapi (transcript, AI responses, etc.)
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
      // Handle conversation updates (e.g., collected data ready)
      if (update.collectedData) {
        console.log('✅ Vapi collected data:', update.collectedData);
        setCollectedVapiData(update.collectedData);
        // Optionally auto-generate questions when data is collected
        // generateQuestionsFromVapiData(update.collectedData);
      }
    },
    onSpeechStart: () => {
      console.log('Speech detected - Vapi listening');
      setVapiSpeaking(true);
    },
    onSpeechEnd: () => {
      console.log('Speech ended - Vapi processing');
      setVapiSpeaking(false);
    },
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]); // Store generated questions
  
  // Vapi-related states
  const [vapiStatus, setVapiStatus] = useState<'idle' | 'active' | 'ended' | 'error'>('idle');
  const [vapiTranscript, setVapiTranscript] = useState('');
  const [vapiAiResponse, setVapiAiResponse] = useState('');
  const [vapiSpeaking, setVapiSpeaking] = useState(false);
  const [collectedVapiData, setCollectedVapiData] = useState<VapiCollectedData | null>(null);
  const [useVapiMode, setUseVapiMode] = useState(false); // Toggle between Vapi and manual recording
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!interviewType || !difficulty) {
      router.push('/interview/start');
    }
  }, [interviewType, difficulty, router]);

  // Initialize Vapi conversation or manual recording based on mode
  useEffect(() => {
    if (useVapiMode && isVapiReady && vapiStatus === 'idle') {
      // Start Vapi conversation to collect interview preferences
      console.log('Starting Vapi assistant for preference collection...');
      startVapiCall();
      return;
    }

    if (!useVapiMode) {
      // Initialize manual recording mode
      const initializeInterview = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorder.start();
          setIsConnected(true);
          setIsRecording(true);
          setCurrentQuestion(questions[questionIndex]);
          
          // Start timer
          setRecordingTime(0);
          timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
        } catch (error) {
          console.error('Error accessing microphone:', error);
          setIsConnected(false);
        }
      };
      if (!isConnected && typeof window !== 'undefined') {
        initializeInterview();
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!useVapiMode && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isConnected, questionIndex, setCurrentQuestion, useVapiMode, isVapiReady, vapiStatus, startVapiCall]);

  // Generate questions from Vapi-collected data by calling /api/vapi/generate
  const generateQuestionsFromVapiData = async (data: VapiCollectedData) => {
    setLoading(true);
    try {
      const payload = {
        role: data.role || interviewType,
        level: data.level || difficulty,
        techStack: Array.isArray(data.techStack) 
          ? data.techStack 
          : (data.techStack || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        experienceYears: data.experienceYears || 0,
        interviewType: data.interviewType || interviewType,
        preferences: data.preferences || { focus: 'general' },
      };

      console.log('Calling /api/vapi/generate with payload:', payload);

      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (result.success && result.generated?.questions) {
        // Generated questions received - format them for display
        const formattedQuestions = result.generated.questions.map((q: any, idx: number) => ({
          id: q.id || `q${idx}`,
          text: q.text || 'No question text provided',
          difficulty: q.difficulty || 'medium',
          type: q.type || 'technical',
        }));

        // Store in interview state if using store, otherwise set locally
        // For now, we'll use local state - you can integrate with Zustand later
        setQuestions(formattedQuestions);
        setQuestionIndex(0);
        setUseVapiMode(false); // Switch back to manual recording mode
        stopVapiCall();

        console.log('✅ Questions generated successfully:', formattedQuestions);
      } else {
        throw new Error('API returned success but no questions were generated.');
      }
    } catch (error: any) {
      console.error('❌ Error generating questions from Vapi data:', error);
      alert(`Failed to generate questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (duration: number, hasContent: boolean) => {
    let score = 50;
    
    // Duration scoring (30 to 120 seconds is ideal)
    if (duration >= 30 && duration <= 120) {
      score += 25;
    } else if (duration >= 20 && duration <= 150) {
      score += 15;
    } else if (duration < 10) {
      score += 5;
    }
    
    // Content scoring
    if (hasContent) {
      score += 25;
    }
    
    // Difficulty multiplier
    if (difficulty === 'hard') score = Math.min(100, score + 10);
    if (difficulty === 'easy') score = Math.max(50, score - 10);
    
    return Math.round(score);
  };

  const handleSubmitAnswer = async () => {
    setLoading(true);
    
    try {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }

      // Clear timer
      if (timerRef.current) clearInterval(timerRef.current);

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const hasAudio = audioBlob.size > 1000; // Check if meaningful audio was recorded

      // Simulate API processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Calculate score based on recording
      const questionScore = calculateScore(recordingTime, hasAudio);
      
      // Generate feedback
      let feedback = '';
      if (recordingTime < 10) {
        feedback = '⏱️ Response was too brief. Try to provide more detailed answers.';
      } else if (recordingTime > 150) {
        feedback = '📝 Great detail! Consider being more concise in future interviews.';
      } else if (!hasAudio) {
        feedback = '🎤 No audio detected. Please ensure your microphone is working.';
      } else {
        feedback = `✅ Good response! You spoke for ${recordingTime} seconds. Keep it structured and confident.`;
      }

      // Move to next question or end interview
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        audioChunksRef.current = [];
        setRecordingTime(0);
        setTranscript('');
        setAiResponse('');
        // Let the useEffect handle restarting the recording with the new questionIndex
      } else {
        // Calculate final score (average of all questions)
        const finalScore = questionScore;
        
        setFeedback(`Interview Complete! Overall Score: ${finalScore}/100\n\n${feedback}\n\n💡 Keep practicing to improve your interview skills!`);
        setScore(finalScore);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        setTimeout(() => {
          router.push('/interview/results');
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setFeedback('Interview ended early.');
    setScore(0);
    router.push('/interview/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Interview Room</h1>
          <div className="flex items-center gap-4">
            <span className="text-blue-100">
              {interviewType} - {difficulty}
            </span>
            
            {/* Mode Toggle */}
            {isVapiReady && !vapiStatus.includes('active') && (
              <button
                onClick={() => {
                  setUseVapiMode(!useVapiMode);
                  if (!useVapiMode) {
                    console.log('Switching to Vapi mode...');
                  } else {
                    console.log('Switching to manual recording mode...');
                  }
                }}
                className={`px-3 py-1 text-xs font-semibold rounded transition ${
                  useVapiMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                title="Toggle between AI voice (Vapi) and manual recording modes"
              >
                {useVapiMode ? '🎤 Vapi AI' : '📝 Manual'}
              </button>
            )}
            
            <button
              onClick={handleEndInterview}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              End Interview
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${isConnected || vapiStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-white">
                    {useVapiMode
                      ? vapiStatus === 'active'
                        ? 'Vapi Connected'
                        : vapiStatus === 'error'
                        ? 'Vapi Error'
                        : 'Starting Vapi...'
                      : isConnected
                      ? 'Connected'
                      : 'Connecting...'}
                  </span>
                  {vapiSpeaking && <span className="text-xs text-yellow-300 animate-pulse ml-2">🔊 Speaking</span>}
                </div>
                <div className="text-sm text-blue-200">
                  {useVapiMode ? 'Vapi AI Mode' : `Question ${questionIndex + 1} of ${questions.length}`}
                </div>
              </div>

              {/* Vapi Mode UI */}
              {useVapiMode && vapiStatus === 'active' ? (
                <div className="mb-8 bg-purple-500/20 border border-purple-400/50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    AI Assistant Interview Setup
                  </h2>
                  <p className="text-blue-100 mb-4">
                    Speak naturally. The AI will guide you through preference collection.
                  </p>

                  {/* Vapi Transcript */}
                  {vapiTranscript && (
                    <div className="mb-4 bg-black/20 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">You said:</h3>
                      <p className="text-blue-100">{vapiTranscript}</p>
                    </div>
                  )}

                  {/* Vapi AI Response */}
                  {vapiAiResponse && (
                    <div className="mb-4 bg-purple-900/20 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-purple-200 mb-2">AI Assistant:</h3>
                      <p className="text-blue-100">{vapiAiResponse}</p>
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => {
                        stopVapiCall();
                        setUseVapiMode(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Back to Manual Mode
                    </button>
                    {collectedVapiData && (
                      <button
                        onClick={() => {
                          console.log('🚀 Generating questions from Vapi data:', collectedVapiData);
                          generateQuestionsFromVapiData(collectedVapiData);
                        }}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                      >
                        {loading ? 'Generating...' : '✨ Generate Questions'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Manual Mode UI */}
                  {/* Current Question */}
                  {questions.length > 0 ? (
                    <div className="mb-8 bg-blue-500/20 border border-blue-400/50 rounded-lg p-6">
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {questions[questionIndex]?.text || questions[questionIndex]}
                      </h2>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isRecording ? 'animate-pulse bg-red-400' : 'bg-gray-400'}`}></div>
                          <span className="text-blue-100">
                            {isRecording ? 'Recording...' : 'Ready'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{recordingTime}s</div>
                          <div className="text-xs text-blue-200">Recording Duration</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8 bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-6 text-center">
                      <p className="text-blue-100 mb-4">No questions available. Switch to Vapi AI mode to generate personalized questions.</p>
                      <button
                        onClick={() => setUseVapiMode(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        🎤 Start Vapi AI
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Transcript Display */}
              {!useVapiMode && transcript && (
                <div className="mb-8 bg-black/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Your Response
                  </h3>
                  <p className="text-blue-100">{transcript}</p>
                </div>
              )}

              {/* AI Response */}
              {!useVapiMode && aiResponse && (
                <div className="mb-8 bg-green-500/20 border border-green-400/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    AI Feedback
                  </h3>
                  <p className="text-blue-100">{aiResponse}</p>
                </div>
              )}

              {/* Action Buttons */}
              {!useVapiMode && (
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                  >
                    {loading ? 'Processing...' : 'Submit Answer'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Interview Stats */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Interview Stats
              </h3>
              <div className="space-y-3 text-blue-100">
                <div>
                  <span className="text-sm">Type:</span>
                  <p className="font-semibold text-white capitalize">
                    {interviewType}
                  </p>
                </div>
                <div>
                  <span className="text-sm">Difficulty:</span>
                  <p className="font-semibold text-white capitalize">
                    {difficulty}
                  </p>
                </div>
                <div>
                  <span className="text-sm">User:</span>
                  <p className="font-semibold text-white text-xs break-all">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Interview Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>• Speak clearly and confidently</li>
                <li>• Take a moment to think</li>
                <li>• Give structured answers</li>
                <li>• Ask clarifying questions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
