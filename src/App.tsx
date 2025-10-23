import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AICopilot } from "@/components/AICopilot";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/install" element={<Install />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/episodes/:id" element={<EpisodeDetail />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/system-monitor" element={<SystemMonitor />} />
          <Route path="/viral-bots" element={<ViralBots />} />
          <Route path="/video-generation" element={<VideoGeneration />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AICopilot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
