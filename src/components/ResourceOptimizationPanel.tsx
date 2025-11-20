import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, HardDrive, Zap, Settings, RefreshCw, TrendingUp } from 'lucide-react';
import { resourceOptimizer } from '@/utils/resourceOptimizer';

export const ResourceOptimizationPanel = () => {
  const [settings, setSettings] = useState(resourceOptimizer.getSettings());
  const [capabilities, setCapabilities] = useState(resourceOptimizer.getCapabilities());
  const [metrics, setMetrics] = useState(resourceOptimizer.getMetrics());

  useEffect(() => {
    const unsubscribe = resourceOptimizer.subscribe((newSettings) => {
      setSettings(newSettings);
      setMetrics(resourceOptimizer.getMetrics());
    });

    const interval = setInterval(() => {
      setMetrics(resourceOptimizer.getMetrics());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ultra': return 'text-purple-500';
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Adaptive Resource Optimizer
            </CardTitle>
            <CardDescription>
              Automatically adjusts settings based on device performance
            </CardDescription>
          </div>
          <Button
            onClick={() => resourceOptimizer.resetToOptimal()}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Current Settings */}
          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Video Quality</div>
                <Badge className={getQualityColor(settings.videoQuality)}>
                  {settings.videoQuality.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Worker Pool</div>
                <div className="text-lg font-semibold">{settings.workerPoolSize} workers</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Concurrent Tasks</div>
                <div className="text-lg font-semibold">{settings.maxConcurrentTasks}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Cache Strategy</div>
                <Badge variant="secondary">{settings.cacheStrategy}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Chunk Size</div>
                <div className="text-lg font-semibold">{settings.chunkSize} bytes</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Compression</div>
                <div className="text-lg font-semibold">{settings.imageCompression}%</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Parallel Processing</span>
                <Badge variant={settings.enableParallelProcessing ? "default" : "secondary"}>
                  {settings.enableParallelProcessing ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* Device Info */}
          <TabsContent value="device" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">CPU Cores</span>
                </div>
                <span className="font-semibold">{capabilities.cores}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Memory Limit</span>
                </div>
                <span className="font-semibold">{capabilities.memory.toFixed(1)} GB</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pixel Ratio</span>
                </div>
                <span className="font-semibold">{capabilities.devicePixelRatio}x</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Connection</span>
                </div>
                <Badge variant="secondary">{capabilities.connectionType}</Badge>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">GPU</div>
                <div className="text-xs break-all">{capabilities.gpu}</div>
              </div>
            </div>
          </TabsContent>

          {/* Performance Metrics */}
          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">FPS</span>
                  <span className="font-semibold">{metrics.fps}</span>
                </div>
                <Progress value={(metrics.fps / 60) * 100} className="h-2" />
              </div>

              {metrics.memory > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="font-semibold">{metrics.memory} MB</span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.memory / (capabilities.memory * 1024)) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              )}

              {metrics.loadTime > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Load Time</span>
                  <span className="font-semibold">{metrics.loadTime} ms</span>
                </div>
              )}

              <div className="pt-3 border-t text-xs text-muted-foreground">
                Settings automatically adjust based on performance metrics
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
