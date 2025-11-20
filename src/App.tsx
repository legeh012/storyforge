import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GodTierOrchestrator } from "@/components/GodTierOrchestrator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { SyncQueueIndicator } from "@/components/SyncQueueIndicator";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Characters from "./pages/Characters";
import Episodes from "./pages/Episodes";
import EpisodeDetail from "./pages/EpisodeDetail";
import Workflow from "./pages/Workflow";
import CreateProject from "./pages/CreateProject";
import MediaLibrary from "./pages/MediaLibrary";
import Analytics from "./pages/Analytics";
import SystemMonitor from "./pages/SystemMonitor";
import ViralBots from "./pages/ViralBots";
import Install from "./pages/Install";
import VideoGeneration from "./pages/VideoGeneration";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProductionStudio from "./pages/ProductionStudio";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  useKeyboardShortcuts();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/install" element={<Install />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/characters" element={<ProtectedRoute><Characters /></ProtectedRoute>} />
        <Route path="/episodes" element={<ProtectedRoute><Episodes /></ProtectedRoute>} />
        <Route path="/episodes/:id" element={<ProtectedRoute><EpisodeDetail /></ProtectedRoute>} />
        <Route path="/workflow" element={<ProtectedRoute><Workflow /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/system-monitor" element={<ProtectedRoute><SystemMonitor /></ProtectedRoute>} />
        <Route path="/viral-bots" element={<ProtectedRoute><ViralBots /></ProtectedRoute>} />
        <Route path="/video-generation" element={<ProtectedRoute><VideoGeneration /></ProtectedRoute>} />
        <Route path="/production-studio" element={<ProtectedRoute><ProductionStudio /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GodTierOrchestrator />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <PerformanceMonitor />
      <SyncQueueIndicator />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
