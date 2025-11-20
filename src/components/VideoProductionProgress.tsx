import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Image as ImageIcon, Film, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressFrame {
  sceneNumber: number;
  url: string;
  status: 'generating' | 'complete';
}

interface ProductionProgress {
  episodeId: string;
  status: 'analyzing' | 'generating' | 'compiling' | 'validating' | 'complete' | 'error';
  currentStep: string;
  progress: number;
  totalScenes: number;
  completedScenes: number;
  frames: ProgressFrame[];
  error?: string;
}

interface VideoProductionProgressProps {
  episodeId: string;
  onComplete?: () => void;
}

export const VideoProductionProgress = ({ episodeId, onComplete }: VideoProductionProgressProps) => {
  const [progress, setProgress] = useState<ProductionProgress>({
    episodeId,
    status: 'analyzing',
    currentStep: 'Initializing...',
    progress: 0,
    totalScenes: 0,
    completedScenes: 0,
    frames: [],
  });

  useEffect(() => {
    const channel = supabase
      .channel(`video-production-${episodeId}`)
      .on(
        'broadcast',
        { event: 'progress' },
        (payload) => {
          const data = payload.payload as ProductionProgress;
          setProgress(data);
          
          if (data.status === 'complete' && onComplete) {
            onComplete();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [episodeId, onComplete]);

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'analyzing':
        return <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />;
      case 'generating':
        return <ImageIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'compiling':
        return <Film className="h-5 w-5 text-orange-500 animate-pulse" />;
      case 'validating':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'analyzing': return 'purple';
      case 'generating': return 'blue';
      case 'compiling': return 'orange';
      case 'validating': return 'yellow';
      case 'complete': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Mayza Video Production</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{progress.currentStep}</p>
            </div>
          </div>
          <Badge variant="outline" className={`bg-${getStatusColor()}-500/10 text-${getStatusColor()}-500 border-${getStatusColor()}-500/20`}>
            {progress.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {/* Scene Progress */}
        {progress.totalScenes > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scenes</span>
              <span className="font-semibold">{progress.completedScenes} / {progress.totalScenes}</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: progress.totalScenes }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full ${
                    idx < progress.completedScenes
                      ? 'bg-primary'
                      : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Frame Preview Grid */}
        {progress.frames.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Film className="h-4 w-4" />
              Frame Preview
            </h4>
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {progress.frames.map((frame, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-border group"
                >
                  <img
                    src={frame.url}
                    alt={`Scene ${frame.sceneNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Scene {frame.sceneNumber}
                      </Badge>
                      {frame.status === 'complete' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  {frame.status === 'generating' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {progress.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{progress.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
