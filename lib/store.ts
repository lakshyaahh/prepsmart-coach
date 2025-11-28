import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

interface InterviewState {
  interviewType: string;
  difficulty: string;
  isRecording: boolean;
  currentQuestion: string;
  feedback: string;
  score: number;
}

interface InterviewStore extends InterviewState {
  setInterviewType: (type: string) => void;
  setDifficulty: (difficulty: string) => void;
  setIsRecording: (recording: boolean) => void;
  setCurrentQuestion: (question: string) => void;
  setFeedback: (feedback: string) => void;
  setScore: (score: number) => void;
  reset: () => void;
}

const initialState: InterviewState = {
  interviewType: '',
  difficulty: '',
  isRecording: false,
  currentQuestion: '',
  feedback: '',
  score: 0,
};

export const useInterviewStore = create<InterviewStore>((set) => ({
  ...initialState,
  setInterviewType: (type) => set({ interviewType: type }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setFeedback: (feedback) => set({ feedback }),
  setScore: (score) => set({ score }),
  reset: () => set(initialState),
}));
