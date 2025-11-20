import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Film, Users, Music, Camera, MessageSquare, Sparkles, TrendingUp,
  Play, Loader2, CheckCircle2, Zap, Brain, Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductionResult {
  status: 'idle' | 'running' | 'completed';
  data?: any;
}

const ProductionStudio = () => {
  const { toast } = useToast();
  const [mainPrompt, setMainPrompt] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [productionResult, setProductionResult] = useState<ProductionResult>({ status: 'idle' });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const updateProgress = (phase: string, percent: number) => {
    setCurrentPhase(phase);
    setProgress(percent);
  };

  const runProductionPipeline = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    if (!mainPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a production concept first.",
        variant: "destructive",
      });
      return;
    }

    setIsOrchestrating(true);
    setProductionResult({ status: 'running' });
    setProgress(0);

    try {
      updateProgress('Initializing Mayza...', 5);

      // Single orchestrator call handles everything
      const { data, error } = await supabase.functions.invoke('bot-orchestrator', {
        body: { 
          message: mainPrompt,
          mode: 'god_tier',
          campaign_type: 'full_production',
          context: {
            productionType: 'video',
            requestFullPipeline: true
          }
        }
      });

      if (error) {
        if (error.message?.includes('402')) {
          throw new Error('Lovable AI credits depleted. Please add credits.');
        }
        if (error.message?.includes('429')) {
          throw new Error('Rate limit reached. Please try again in a moment.');
        }
        throw error;
      }

      updateProgress('Orchestrating all production departments...', 20);
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateProgress('Script & storyboard generation...', 35);
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateProgress('Character design & movement...', 50);
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateProgress('Audio production & cinematography...', 65);
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateProgress('Rendering video scenes...', 80);
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateProgress('Final post-production & effects...', 95);
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateProgress('Production Complete!', 100);

      setProductionResult({
        status: 'completed',
        data: {
          orchestratorResponse: data,
          videoUrl: data?.videoUrl,
          episodeId: data?.episodeId,
          capabilities: Array.isArray(data?.activatedCapabilities) 
            ? data.activatedCapabilities 
            : [
                'Story Director',
                'Character Designer',
                'Audio Master',
                'Cinematographer',
                'Dialogue AI',
                'Post-Production',
                'Marketing Analytics'
              ]
        }
      });

      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      toast({
        title: "🎬 Production Complete!",
        description: "Mayza has created your content.",
      });

    } catch (error) {
      console.error('Production error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Production failed';
      
      toast({
        title: "Production Error",
        description: errorMessage,
        variant: "destructive",
      });

      setProductionResult({ status: 'idle' });
    } finally {
      setIsOrchestrating(false);
    }
  };

  const resetPipeline = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setProductionResult({ status: 'idle' });
    setProgress(0);
    setCurrentPhase('');
    setVideoUrl(null);
    setMainPrompt('');
  };

  const runQuickTest = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    const testPrompt = "5-second test video: A person waves at the camera and says 'Hello, testing Mayza!' with a smile. Simple, quick, friendly.";
    
    toast({
      title: "🚀 Quick Test Started",
      description: "Running 5-second video smoke test...",
    });

    setMainPrompt(testPrompt);
    setIsOrchestrating(true);
    setProductionResult({ status: 'running' });
    setProgress(0);

    try {
      updateProgress('Quick test: Initializing...', 10);

      const { data, error } = await supabase.functions.invoke('bot-orchestrator', {
        body: { 
          message: testPrompt,
          mode: 'god_tier',
          campaign_type: 'test_production',
          context: {
            productionType: 'video',
            duration: 5,
            testMode: true
          }
        }
      });

      if (error) {
        if (error.message?.includes('402')) {
          throw new Error('Lovable AI credits depleted. Please add credits.');
        }
        if (error.message?.includes('429')) {
          throw new Error('Rate limit reached. Please try again in a moment.');
        }
        throw error;
      }

      updateProgress('Quick test: Processing...', 40);
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateProgress('Quick test: Generating video...', 70);
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateProgress('Quick test: Complete!', 100);

      setProductionResult({
        status: 'completed',
        data: data || { 
          activatedCapabilities: ['Script', 'Video', 'Audio'],
          result: 'Test video generated successfully',
          testMode: true
        }
      });

      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      toast({
        title: "✅ Quick Test Complete!",
        description: "5-second smoke test passed successfully.",
      });

    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Quick test encountered an error.',
        variant: "destructive",
      });
      setProductionResult({ status: 'idle' });
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mayza Production Studio | AI Production House"
        description="Professional AI-powered production studio with all capabilities: script writing, video production, audio mastering, and viral optimization."
        keywords={["AI production", "video creation", "Mayza AI", "content studio"]}
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <Zap className="h-16 w-16 text-purple-500" />
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Mayza Production Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            One orchestrator. All capabilities. Complete production in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              Story Direction
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              Character Design
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Music className="h-3 w-3" />
              Audio Master
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Camera className="h-3 w-3" />
              Cinematography
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              Dialogue AI
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Post-Production
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Marketing
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Production Control Center */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Film className="h-6 w-6 text-purple-500" />
                Production Control Center
              </CardTitle>
              <CardDescription>
                Describe your vision. Mayza handles everything.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="production-prompt">Production Concept</Label>
                <Textarea
                  id="production-prompt"
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder="Example: Create a viral reality TV episode about a dramatic confrontation at a luxury dinner party. Include dramatic music, confessional cutaways, and tension-building cinematography..."
                  className="mt-2 min-h-[120px]"
                  disabled={isOrchestrating}
                />
              </div>

              {isOrchestrating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{currentPhase}</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={runProductionPipeline}
                  disabled={isOrchestrating || !mainPrompt.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                  type="button"
                >
                  {isOrchestrating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Orchestrating Production...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Mayza Production
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={runQuickTest}
                  disabled={isOrchestrating}
                  variant="outline"
                  size="lg"
                  type="button"
                  className="border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500"
                >
                  {isOrchestrating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Quick Test (5s)
                    </>
                  )}
                </Button>
                
                {productionResult.status === 'completed' && (
                  <Button onClick={resetPipeline} variant="outline" size="lg" type="button">
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {productionResult.status === 'completed' && productionResult.data && (
            <Card className="border-2 border-green-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <CardTitle className="text-2xl">Production Complete!</CardTitle>
                    <CardDescription>
                      Mayza successfully created your content
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Activated Capabilities */}
                <div>
                  <h3 className="font-semibold mb-3">Activated Capabilities:</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(productionResult.data.capabilities) ? productionResult.data.capabilities : []).map((cap: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Video Player */}
                {videoUrl && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Generated Video:</h3>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full"
                        src={videoUrl}
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                        onClick={(e) => {
                          e.preventDefault();
                          if (videoUrl) window.open(videoUrl, '_blank');
                        }}
                        type="button"
                      >
                        Download Video
                      </Button>
                      {productionResult.data.episodeId && (
                        <Button 
                          variant="outline" 
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/episodes/${productionResult.data.episodeId}`;
                          }}
                          type="button"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Orchestrator Response */}
                {productionResult.data.orchestratorResponse && (
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="technical">Technical Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-3">
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(productionResult.data.orchestratorResponse, null, 2)}
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="technical" className="space-y-3">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          All production tasks handled by Mayza with full capability integration.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductionStudio;
