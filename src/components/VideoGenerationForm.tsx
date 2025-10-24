import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Video, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const VideoGenerationForm = () => {
  const [episode, setEpisode] = useState('');
  const [cast, setCast] = useState('');
  const [music, setMusic] = useState('');
  const [overlay, setOverlay] = useState('');
  const [remixable, setRemixable] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!episode) {
      toast({
        title: 'Episode required',
        description: 'Please enter an episode name or prompt',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    setVideoUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          episode,
          cast,
          music,
          overlay,
          remixable,
        },
      });

      if (error) throw error;

      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
        toast({
          title: '🎬 Video Generated!',
          description: 'Your video is ready to watch',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate video',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="episode">Episode Name / Prompt</Label>
            <Input
              id="episode"
              placeholder="Enter episode name or generation prompt..."
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cast">Cast Selection</Label>
            <Select value={cast} onValueChange={setCast}>
              <SelectTrigger id="cast" className="bg-background/50">
                <SelectValue placeholder="Select cast..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="luckiee">Luckiee</SelectItem>
                <SelectItem value="mama_halima">Mama Halima</SelectItem>
                <SelectItem value="uncle_jama">Uncle Jama</SelectItem>
                <SelectItem value="auntie_ayan">Auntie Ayan</SelectItem>
                <SelectItem value="ensemble">Full Ensemble</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="music">Background Music</Label>
            <Select value={music} onValueChange={setMusic}>
              <SelectTrigger id="music" className="bg-background/50">
                <SelectValue placeholder="Select music track..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="luckiee_intro">Luckiee Intro Theme</SelectItem>
                <SelectItem value="somali_vibes">Somali Vibes</SelectItem>
                <SelectItem value="comedy_beat">Comedy Beat</SelectItem>
                <SelectItem value="dramatic_moment">Dramatic Moment</SelectItem>
                <SelectItem value="party_time">Party Time</SelectItem>
                <SelectItem value="none">No Music</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overlay">Text Overlay Style</Label>
            <Select value={overlay} onValueChange={setOverlay}>
              <SelectTrigger id="overlay" className="bg-background/50">
                <SelectValue placeholder="Select overlay style..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="somali_word_drop">Somali Word Drop</SelectItem>
                <SelectItem value="viral_caption">Viral Caption Style</SelectItem>
                <SelectItem value="subtitle_clean">Clean Subtitles</SelectItem>
                <SelectItem value="emoji_reactions">Emoji Reactions</SelectItem>
                <SelectItem value="none">No Overlay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remixable"
              checked={remixable}
              onCheckedChange={(checked) => setRemixable(checked as boolean)}
            />
            <Label
              htmlFor="remixable"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable Remix Mode (Allow community remixes)
            </Label>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !episode}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {videoUrl && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
