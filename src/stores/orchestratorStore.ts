import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  capabilities?: string[];
  files?: Array<{ name: string; type: string; url: string }>;
}

interface OrchestratorState {
  // Session state
  sessionId: string;
  isActive: boolean;
  isLoading: boolean;
  
  // Messages
  messages: Message[];
  
  // Departments
  activeDepartments: string[];
  handoff: { from: string; to: string; context: string } | null;
  
  // File uploads
  uploadedFiles: Array<{ name: string; type: string; url: string }>;
  
  // Actions
  setIsActive: (active: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addMessage: (message: Message) => void;
  setActiveDepartments: (departments: string[]) => void;
  setHandoff: (handoff: { from: string; to: string; context: string } | null) => void;
  addUploadedFile: (file: { name: string; type: string; url: string }) => void;
  removeUploadedFile: (index: number) => void;
  clearUploadedFiles: () => void;
  resetSession: () => void;
}

export const useOrchestratorStore = create<OrchestratorState>()(
  immer((set) => ({
    // Initial state
    sessionId: crypto.randomUUID(),
    isActive: (() => {
      const saved = localStorage.getItem('mayza-active-state');
      return saved !== null ? saved === 'true' : true;
    })(),
    isLoading: false,
    messages: [
      {
        role: 'assistant',
        content: "Hey! I'm Mayza - your comprehensive AI productivity system. I listen, interpret your intentions, and execute actions across all aspects of your life. I can handle work tasks, school projects, development, writing, planning, automation, file management, app control, video production, and anything else you need. I track our entire conversation deeply and work toward your goals without redundant questions. What's up?",
        capabilities: ['App Builder', 'Video Director', 'Creative Studio', 'Audio Master', 'Viral Optimizer', 'AI Engineer', 'Task Automator', 'Digital Assistant']
      }
    ],
    activeDepartments: [],
    handoff: null,
    uploadedFiles: [],

    // Actions
    setIsActive: (active) => set((state) => {
      state.isActive = active;
      localStorage.setItem('mayza-active-state', String(active));
    }),

    setIsLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),

    addMessage: (message) => set((state) => {
      state.messages.push(message);
    }),

    setActiveDepartments: (departments) => set((state) => {
      state.activeDepartments = departments;
    }),

    setHandoff: (handoff) => set((state) => {
      state.handoff = handoff;
    }),

    addUploadedFile: (file) => set((state) => {
      state.uploadedFiles.push(file);
    }),

    removeUploadedFile: (index) => set((state) => {
      state.uploadedFiles.splice(index, 1);
    }),

    clearUploadedFiles: () => set((state) => {
      state.uploadedFiles = [];
    }),

    resetSession: () => set((state) => {
      const savedActiveState = localStorage.getItem('mayza-active-state');
      const currentActiveState = savedActiveState !== null ? savedActiveState === 'true' : true;
      
      state.sessionId = crypto.randomUUID();
      state.isLoading = false;
      state.messages = [
        {
          role: 'assistant',
          content: "Hey! I'm Mayza - your comprehensive AI productivity system. I listen, interpret your intentions, and execute actions across all aspects of your life. I can handle work tasks, school projects, development, writing, planning, automation, file management, app control, video production, and anything else you need. I track our entire conversation deeply and work toward your goals without redundant questions. What's up?",
          capabilities: ['App Builder', 'Video Director', 'Creative Studio', 'Audio Master', 'Viral Optimizer', 'AI Engineer', 'Task Automator', 'Digital Assistant']
        }
      ];
      state.activeDepartments = [];
      state.handoff = null;
      state.uploadedFiles = [];
      // Preserve the current active state
      state.isActive = currentActiveState;
    }),
  }))
);
