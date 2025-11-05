import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Video, Film, Camera, Clapperboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GodTierProductionPanelProps {
  episodeId?: string;
}

export const GodTierProductionPanel = ({ episodeId }: GodTierProductionPanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const godTierBots = [
    {
      id: 'veo-video-bot',
      name: 'Veo God-Tier Generator',
      icon: Video,
      description: 'AI-powered video generation with Veo 3.1-level quality',
      features: ['Photorealistic frames', 'Cinematic analysis', 'Advanced lighting', 'Color grading'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'ultra-video-bot',
      name: 'Ultra Reality Engine',
      icon: Film,
      description: 'Netflix-grade photorealistic scene generation',
      features: ['Scene analysis', 'Parallel generation', 'Quality validation', 'Auto compilation'],
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const runGodTierBot = async (botId: string) => {
    if (!episodeId) {
      toast({
        title: "No Episode Selected",
        description: "Please select an episode first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      toast({
        title: "🎬 God-Tier Production Started",
        description: `Running ${botId} with advanced AI capabilities...`,
      });

      const { data, error } = await supabase.functions.invoke(botId, {
        body: { 
          episodeId,
          enhancementLevel: 'god-tier'
        }
      });

      if (error) throw error;

      toast({
        title: "✨ Success",
        description: `Generated ${data.totalFrames} frames in ${data.totalDuration}s`,
      });
    } catch (error: any) {
      console.error('God-tier bot error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <CardTitle className="text-2xl">God-Tier Video Production</CardTitle>
          </div>
          <CardDescription>
            AI-powered video generation with Veo 3.1-level cinematic quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your video concept (or select an episode to enhance)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <Camera className="h-3 w-3" />
                Cinematic AI
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clapperboard className="h-3 w-3" />
                Photorealistic
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Film className="h-3 w-3" />
                Netflix-Grade
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {godTierBots.map((bot) => {
          const Icon = bot.icon;
          return (
            <Card key={bot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${bot.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {bot.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {bot.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => runGodTierBot(bot.id)}
                  disabled={!episodeId || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
