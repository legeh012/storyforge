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

interface ProductionBot {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  outputs: string[];
  status: 'idle' | 'running' | 'completed';
  result?: any;
}

const ProductionStudio = () => {
  const { toast } = useToast();
  const [mainPrompt, setMainPrompt] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  const [bots, setBots] = useState<ProductionBot[]>([
    {
      id: 'story_director',
      name: 'StoryDirector AI',
      role: 'Plot Development',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Develops reality-show plots, episode arcs, and emotional beats',
      outputs: ['Scripts', 'Storyboards', 'Character arcs'],
      status: 'idle',
    },
    {
      id: 'character_movement',
      name: 'Character & Movement AI',
      role: 'Character Design',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Designs characters with realistic body language and voice tone',
      outputs: ['Motion data', 'Dialogue sync', 'Character profiles'],
      status: 'idle',
    },
    {
      id: 'soundtrack',
      name: 'SoundTrack AI',
      role: 'Audio Production',
      icon: Music,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'Creates custom music, ambient noise, and emotional cues',
      outputs: ['Music tracks', 'Sound effects', 'Audio layers'],
      status: 'idle',
    },
    {
      id: 'cinematography',
      name: 'Cinematography AI',
      role: 'Visual Direction',
      icon: Camera,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      description: 'Handles camera angles, lighting, and scene transitions',
      outputs: ['Rendered scenes', 'Camera scripts', 'Lighting setups'],
      status: 'idle',
    },
    {
      id: 'dialogue',
      name: 'Dialogue AI',
      role: 'Voice & Speech',
      icon: MessageSquare,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      description: 'Generates natural, culturally nuanced speech',
      outputs: ['Voice acting', 'TTS files', 'Dialogue scripts'],
      status: 'idle',
    },
    {
      id: 'post_production',
      name: 'Post-Production AI',
      role: 'Final Assembly',
      icon: Sparkles,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      description: 'Handles editing, cuts, filters, special effects, and credits',
      outputs: ['Final video', 'VFX', 'Color grading'],
      status: 'idle',
    },
    {
      id: 'marketing_analytics',
      name: 'Marketing & Analytics AI',
      role: 'Viral Strategy',
      icon: TrendingUp,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      description: 'Analyzes trends, predicts virality, auto-optimizes strategy',
      outputs: ['Viral titles', 'Thumbnails', 'Release timing'],
      status: 'idle',
    },
  ]);

  const updateBotStatus = (botId: string, status: 'idle' | 'running' | 'completed', result?: any) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId ? { ...bot, status, result } : bot
    ));
  };

  const runProductionPipeline = async () => {
    if (!mainPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Enter a production concept to begin',
        variant: 'destructive',
      });
      return;
    }

    setIsOrchestrating(true);
    setProgress(0);

    try {
      // Phase 1: Story & Character Development
      setCurrentPhase('Phase 1: Story & Character Development');
      setProgress(10);
      
      updateBotStatus('story_director', 'running');
      const { data: storyData, error: storyError } = await supabase.functions.invoke('story-director-bot', {
        body: { prompt: mainPrompt },
      });
      if (storyError) throw storyError;
      updateBotStatus('story_director', 'completed', storyData);
      setProgress(20);

      updateBotStatus('character_movement', 'running');
      const { data: charData, error: charError } = await supabase.functions.invoke('character-movement-bot', {
        body: { script: storyData?.script, prompt: mainPrompt },
      });
      if (charError) throw charError;
      updateBotStatus('character_movement', 'completed', charData);
      setProgress(30);

      // Phase 2: Audio & Visual Production
      setCurrentPhase('Phase 2: Audio & Visual Production');
      
      updateBotStatus('soundtrack', 'running');
      const { data: audioData, error: audioError } = await supabase.functions.invoke('soundtrack-bot', {
        body: { script: storyData?.script, mood: 'dramatic' },
      });
      if (audioError) throw audioError;
      updateBotStatus('soundtrack', 'completed', audioData);
      setProgress(45);

      updateBotStatus('cinematography', 'running');
      const { data: cinematicData, error: cinematicError } = await supabase.functions.invoke('cinematography-bot', {
        body: { 
          script: storyData?.script,
          characters: charData?.characters 
        },
      });
      if (cinematicError) throw cinematicError;
      updateBotStatus('cinematography', 'completed', cinematicData);
      setProgress(60);

      // Phase 3: Dialogue & Voice
      setCurrentPhase('Phase 3: Dialogue & Voice Generation');
      
      updateBotStatus('dialogue', 'running');
      const { data: dialogueData, error: dialogueError } = await supabase.functions.invoke('dialogue-bot', {
        body: { 
          script: storyData?.script,
          characters: charData?.characters 
        },
      });
      if (dialogueError) throw dialogueError;
      updateBotStatus('dialogue', 'completed', dialogueData);
      setProgress(75);

      // Phase 4: Video Generation (Actual MP4 Production)
      setCurrentPhase('Phase 4: Generating Actual Video with Frames');
      
      updateBotStatus('post_production', 'running');
      
      // Create episode record for video generation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      // First, get or create a project for this user
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let projectId = projects?.[0]?.id;
      
      if (!projectId) {
        const { data: newProject } = await supabase
          .from('projects')
          .insert({
            title: 'AI Productions',
            user_id: user.id
          })
          .select('id')
          .single();
        projectId = newProject?.id;
      }

      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .insert({
          title: storyData?.title || 'AI Production',
          synopsis: storyData?.synopsis || mainPrompt,
          script: storyData?.script || '',
          user_id: user.id,
          project_id: projectId,
          episode_number: 1,
          status: 'processing'
        })
        .select()
        .single();

      if (episodeError) throw episodeError;

      // Trigger actual video generation with ultra-video-bot
      const { data: videoData, error: videoError } = await supabase.functions.invoke('ultra-video-bot', {
        body: { 
          episodeId: episode.id,
          enhancementLevel: 'ultra',
          script: storyData?.script,
          characters: charData?.characters,
          cinematography: cinematicData?.scenes
        },
      });
      
      if (videoError) throw videoError;
      
      updateBotStatus('post_production', 'completed', { 
        videoUrl: videoData?.videoUrl,
        episodeId: episode.id 
      });
      setProgress(90);

      // Phase 5: Marketing & Analytics
      setCurrentPhase('Phase 5: Viral Optimization & Marketing');
      
      updateBotStatus('marketing_analytics', 'running');
      const { data: marketingData, error: marketingError } = await supabase.functions.invoke('marketing-analytics-bot', {
        body: { 
          content: videoData?.videoUrl || episode.video_url,
          metadata: { title: storyData?.title, description: storyData?.synopsis }
        },
      });
      if (marketingError) throw marketingError;
      updateBotStatus('marketing_analytics', 'completed', marketingData);
      setProgress(100);

      setCurrentPhase('Production Complete! 🎉');
      
      const videoUrl = bots.find(b => b.id === 'post_production')?.result?.videoUrl;
      
      toast({
        title: 'God-Tier Production Complete!',
        description: videoUrl 
          ? 'Video is ready! Check the results below.' 
          : 'All AI departments have finished their work',
      });

    } catch (error) {
      toast({
        title: 'Production Error',
        description: error instanceof Error ? error.message : 'Failed to complete production',
        variant: 'destructive',
      });
      console.error('Production pipeline error:', error);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const resetPipeline = () => {
    setBots(prev => prev.map(bot => ({ ...bot, status: 'idle', result: undefined })));
    setProgress(0);
    setCurrentPhase('');
  };

  return (
    <>
      <SEOHead
        title="AI Production Studio - God-Tier Content Creation"
        description="Complete AI-powered production studio with 7 specialized departments working in harmony"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="h-12 w-12 text-yellow-500" />
                <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  God-Tier Production Studio
                </h1>
              </div>
              <p className="text-muted-foreground text-xl">
                7 AI Departments Working Together at Supreme Level
              </p>
              <div className="flex justify-center gap-6 text-sm">
                {bots.filter(b => b.status === 'completed').length > 0 && (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {bots.filter(b => b.status === 'completed').length} Completed
                  </Badge>
                )}
                {bots.filter(b => b.status === 'running').length > 0 && (
                  <Badge variant="outline" className="text-blue-500 border-blue-500">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {bots.filter(b => b.status === 'running').length} Running
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Production Control */}
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-6 w-6" />
                  Production Control Center
                </CardTitle>
                <CardDescription>
                  Enter your concept and watch 7 AI departments bring it to life
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="main-prompt">Production Concept</Label>
                  <Textarea
                    id="main-prompt"
                    value={mainPrompt}
                    onChange={(e) => setMainPrompt(e.target.value)}
                    placeholder="Example: Create a dramatic reality TV episode where two rivals confront each other at a high-end fashion boutique, building tension through subtle glances before erupting into an emotional confrontation"
                    className="min-h-32"
                    disabled={isOrchestrating}
                  />
                </div>

                {isOrchestrating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{currentPhase}</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={runProductionPipeline}
                    disabled={isOrchestrating || !mainPrompt.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {isOrchestrating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Orchestrating Production...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start God-Tier Production
                      </>
                    )}
                  </Button>
                  {bots.some(b => b.status === 'completed') && (
                    <Button onClick={resetPipeline} variant="outline" size="lg">
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bots.map((bot) => (
                <Card 
                  key={bot.id} 
                  className={`border ${bot.borderColor} transition-all duration-300 ${
                    bot.status === 'running' ? 'ring-2 ring-primary animate-pulse' : ''
                  } ${bot.status === 'completed' ? 'ring-2 ring-green-500' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bot.bgColor}`}>
                          <bot.icon className={`h-5 w-5 ${bot.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{bot.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{bot.role}</p>
                        </div>
                      </div>
                      {bot.status === 'running' && (
                        <Loader2 className={`h-4 w-4 ${bot.color} animate-spin`} />
                      )}
                      {bot.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{bot.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Outputs:</p>
                      {bot.outputs.map((output, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Zap className={`h-3 w-3 ${bot.color}`} />
                          <span className="text-muted-foreground">{output}</span>
                        </div>
                      ))}
                    </div>
                    {bot.status === 'completed' && bot.result && (
                      <Badge variant="outline" className="text-green-500 border-green-500 w-full justify-center">
                        ✓ Complete
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Video Player & Results */}
            {bots.some(b => b.status === 'completed') && (
              <>
                {/* Video Player */}
                {bots.find(b => b.id === 'post_production' && b.result?.videoUrl) && (
                  <Card className="border-2 border-green-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Film className="h-6 w-6 text-green-500" />
                        Final Video Production
                      </CardTitle>
                      <CardDescription>
                        God-tier AI-generated video - ready to publish
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-full"
                          src={bots.find(b => b.id === 'post_production')?.result?.videoUrl}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                          onClick={() => {
                            const videoUrl = bots.find(b => b.id === 'post_production')?.result?.videoUrl;
                            if (videoUrl) window.open(videoUrl, '_blank');
                          }}
                        >
                          Download Video
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            const episodeId = bots.find(b => b.id === 'post_production')?.result?.episodeId;
                            if (episodeId) window.location.href = `/episodes/${episodeId}`;
                          }}
                        >
                          View Episode Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results Tabs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Production Results</CardTitle>
                    <CardDescription>Detailed outputs from each AI department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={bots.find(b => b.status === 'completed')?.id}>
                      <TabsList className="grid w-full grid-cols-7">
                        {bots.map(bot => (
                          bot.status === 'completed' && (
                            <TabsTrigger key={bot.id} value={bot.id} disabled={bot.status !== 'completed'}>
                              <bot.icon className="h-4 w-4" />
                            </TabsTrigger>
                          )
                        ))}
                      </TabsList>
                      {bots.map(bot => (
                        bot.status === 'completed' && (
                          <TabsContent key={bot.id} value={bot.id} className="space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-semibold flex items-center gap-2">
                                <bot.icon className={`h-5 w-5 ${bot.color}`} />
                                {bot.name} Results
                              </h3>
                              <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-96 text-xs">
                                {JSON.stringify(bot.result, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductionStudio;
