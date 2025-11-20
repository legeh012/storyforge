import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCw, CheckCircle2 } from 'lucide-react';
import { Canvas as FabricCanvas, IText, Image as FabricImage } from 'fabric';

interface ComparisonVariation {
  id: string;
  name: string;
  scenes: any[];
  metadata: any;
}

interface SideBySideComparisonProps {
  variationA: ComparisonVariation;
  variationB: ComparisonVariation;
  onSelect: (variationId: string) => void;
}

export const SideBySideComparison = ({ 
  variationA, 
  variationB, 
  onSelect 
}: SideBySideComparisonProps) => {
  const canvasRefA = useRef<HTMLCanvasElement>(null);
  const canvasRefB = useRef<HTMLCanvasElement>(null);
  const [fabricCanvasA, setFabricCanvasA] = useState<FabricCanvas | null>(null);
  const [fabricCanvasB, setFabricCanvasB] = useState<FabricCanvas | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Initialize canvases
  useEffect(() => {
    if (!canvasRefA.current || !canvasRefB.current) return;

    const canvasA = new FabricCanvas(canvasRefA.current, {
      width: 640,
      height: 360,
      backgroundColor: '#000000',
    });

    const canvasB = new FabricCanvas(canvasRefB.current, {
      width: 640,
      height: 360,
      backgroundColor: '#000000',
    });

    setFabricCanvasA(canvasA);
    setFabricCanvasB(canvasB);

    return () => {
      canvasA.dispose();
      canvasB.dispose();
    };
  }, []);

  // Render scenes on both canvases
  useEffect(() => {
    if (!fabricCanvasA || !fabricCanvasB) return;
    if (!variationA.scenes[currentSceneIndex] || !variationB.scenes[currentSceneIndex]) return;

    renderScene(fabricCanvasA, variationA.scenes[currentSceneIndex]);
    renderScene(fabricCanvasB, variationB.scenes[currentSceneIndex]);
  }, [currentSceneIndex, fabricCanvasA, fabricCanvasB]);

  const renderScene = async (canvas: FabricCanvas, scene: any) => {
    canvas.clear();
    canvas.backgroundColor = scene.background || '#000000';

    for (const element of scene.elements || []) {
      if (element.type === 'text') {
        const text = new IText(element.content, {
          left: element.x || 100,
          top: element.y || 100,
          fontSize: (element.fontSize || 48) * 0.5, // Scale down for preview
          fill: element.color || '#ffffff',
          fontFamily: element.fontFamily || 'Arial',
          fontWeight: element.fontWeight || 'bold',
        });
        canvas.add(text);
      } else if (element.type === 'image' && element.url) {
        try {
          const img = await FabricImage.fromURL(element.url);
          img.set({
            left: element.x || 0,
            top: element.y || 0,
            scaleX: (element.scale || 1) * 0.5,
            scaleY: (element.scale || 1) * 0.5,
          });
          canvas.add(img);
        } catch (error) {
          console.error('Failed to load image', error);
        }
      }
    }

    canvas.renderAll();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentSceneIndex(0);
    setPlaybackTime(0);
    setIsPlaying(false);
  };

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackTime(prev => {
        const maxScenes = Math.max(variationA.scenes.length, variationB.scenes.length);
        const currentScene = variationA.scenes[currentSceneIndex] || variationB.scenes[currentSceneIndex];
        const sceneDuration = currentScene?.duration || 5;
        
        if (prev >= sceneDuration && currentSceneIndex < maxScenes - 1) {
          setCurrentSceneIndex(idx => idx + 1);
          return 0;
        } else if (prev >= sceneDuration && currentSceneIndex >= maxScenes - 1) {
          setIsPlaying(false);
          return 0;
        }
        
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex, variationA.scenes, variationB.scenes]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Variation A */}
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{variationA.name}</span>
              <Badge className="bg-primary">Variation A</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <canvas ref={canvasRefA} className="w-full h-full" />
              
              <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg backdrop-blur-sm text-sm">
                Scene {currentSceneIndex + 1} / {variationA.scenes.length}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Quality Score</p>
                <p className="font-bold">{variationA.metadata.qualityScore}/10</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Est. Views</p>
                <p className="font-bold">
                  {(variationA.metadata.performancePrediction.estimatedViews / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="font-bold">
                  {variationA.metadata.performancePrediction.engagementRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Retention</p>
                <p className="font-bold">
                  {variationA.metadata.performancePrediction.retentionScore.toFixed(0)}%
                </p>
              </div>
            </div>

            <Button
              onClick={() => onSelect(variationA.id)}
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Select This Version
            </Button>
          </CardContent>
        </Card>

        {/* Variation B */}
        <Card className="border-2 border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{variationB.name}</span>
              <Badge className="bg-accent">Variation B</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <canvas ref={canvasRefB} className="w-full h-full" />
              
              <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg backdrop-blur-sm text-sm">
                Scene {currentSceneIndex + 1} / {variationB.scenes.length}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Quality Score</p>
                <p className="font-bold">{variationB.metadata.qualityScore}/10</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Est. Views</p>
                <p className="font-bold">
                  {(variationB.metadata.performancePrediction.estimatedViews / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="font-bold">
                  {variationB.metadata.performancePrediction.engagementRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Retention</p>
                <p className="font-bold">
                  {variationB.metadata.performancePrediction.retentionScore.toFixed(0)}%
                </p>
              </div>
            </div>

            <Button
              onClick={() => onSelect(variationB.id)}
              className="w-full bg-gradient-to-r from-accent to-primary"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Select This Version
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Playback Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isPlaying ? (
                <><Pause className="h-5 w-5 mr-2" /> Pause</>
              ) : (
                <><Play className="h-5 w-5 mr-2" /> Play Both</>
              )}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
            >
              <RotateCw className="h-5 w-5 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
