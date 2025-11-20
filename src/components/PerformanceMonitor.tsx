import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      // Update FPS every second
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory info if available
        const memory = (performance as any).memory 
          ? Math.round(((performance as any).memory.usedJSHeapSize / 1048576))
          : 0;

        // Get navigation timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navTiming ? Math.round(navTiming.loadEventEnd - navTiming.fetchStart) : 0;

        setMetrics({
          fps,
          memory,
          loadTime,
          renderTime: Math.round(currentTime)
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) return null;

  const getPerformanceStatus = (fps: number) => {
    if (fps >= 55) return { label: 'Excellent', color: 'text-green-500' };
    if (fps >= 40) return { label: 'Good', color: 'text-yellow-500' };
    return { label: 'Poor', color: 'text-red-500' };
  };

  const status = getPerformanceStatus(metrics.fps);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Performance Monitor
            </div>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* FPS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>FPS</span>
              </div>
              <span className="font-semibold">{metrics.fps}</span>
            </div>
            <Progress value={(metrics.fps / 60) * 100} className="h-1" />
          </div>

          {/* Memory */}
          {metrics.memory > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>Memory</span>
                </div>
                <span className="font-semibold">{metrics.memory} MB</span>
              </div>
              <Progress value={Math.min((metrics.memory / 500) * 100, 100)} className="h-1" />
            </div>
          )}

          {/* Load Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                <span>Load Time</span>
              </div>
              <span className="font-semibold">{metrics.loadTime} ms</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
