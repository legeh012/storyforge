import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Zap, Code, Film, Palette, Music, TrendingUp, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  capabilities?: string[];
}

const GOD_TIER_CAPABILITIES = [
  { icon: Code, label: 'App Builder', color: 'text-blue-500' },
  { icon: Film, label: 'Video Director', color: 'text-purple-500' },
  { icon: Palette, label: 'Creative Studio', color: 'text-pink-500' },
  { icon: Music, label: 'Audio Master', color: 'text-green-500' },
  { icon: TrendingUp, label: 'Viral Optimizer', color: 'text-orange-500' },
  { icon: Sparkles, label: 'AI Engineer', color: 'text-yellow-500' },
];

export const GodTierOrchestrator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm your God-Tier Orchestrator with GPT-5.1 capabilities. I track our entire conversation deeply, infer your intent even from incomplete instructions, and work toward your goals without asking redundant questions. I can build apps, direct videos, optimize for virality, engineer solutions, and orchestrate complete production workflows. What do you want to create?",
      capabilities: GOD_TIER_CAPABILITIES.map(c => c.label)
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleActive = () => {
    setIsActive(prev => !prev);
    toast({
      title: isActive ? "Orchestrator Deactivated" : "Orchestrator Activated",
      description: isActive 
        ? "Chat is now inactive. Toggle to reactivate." 
        : "All god-tier capabilities are now online.",
    });
  };

  const sendMessage = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!input.trim() || isLoading || !isActive) {
      if (!isActive) {
        toast({
          title: "Orchestrator Inactive",
          description: "Please activate the orchestrator to send messages.",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Prepare deep context for GPT-5.1-like processing
      const context = {
        currentPage: window.location.pathname,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        godTierMode: true
      };

      const { data, error } = await supabase.functions.invoke('bot-orchestrator', {
        body: { 
          message: userMessage,
          context,
          campaign_type: 'full_viral_campaign',
          mode: 'god_tier',
          sessionId
        }
      });

      if (error) {
        console.error('Bot orchestrator error:', error);
        
        // Check for specific error codes in the response
        if (error.message?.includes('402') || error.context?.body?.error?.includes('credits')) {
          throw new Error('💳 Lovable AI credits depleted. Please add credits in Settings → Workspace → Usage to continue.');
        }
        if (error.message?.includes('429')) {
          throw new Error('⏳ Rate limit reached. Please wait a moment and try again.');
        }
        
        // Parse error message from response body if available
        const errorMsg = error.context?.body?.error || error.message || 'An unexpected error occurred';
        throw new Error(errorMsg);
      }

      const assistantMessage = data?.response || data?.message || 'Task initiated. All god-tier capabilities are engaged.';
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        capabilities: data?.activatedCapabilities
      }]);

    } catch (error) {
      console.error('God-Tier Orchestrator error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      
      toast({
        title: "Orchestrator Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${errorMessage}\n\nPlease check your Lovable AI credits in Settings → Workspace → Usage.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage(e);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700' 
            : 'bg-muted hover:bg-muted/80'
        }`}
        size="icon"
      >
        <div className="relative">
          <Zap className={`h-6 w-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
          {isActive && (
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          )}
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[450px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
      {/* Header */}
      <div className={`p-4 rounded-t-lg flex items-center justify-between transition-colors ${
        isActive 
          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="h-6 w-6" />
            {isActive && (
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">God-Tier Orchestrator</h3>
            <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
              {isActive ? 'GPT-5.1 Mode • Deep Context Tracking' : 'Inactive'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Switch
              checked={isActive}
              onCheckedChange={toggleActive}
              className="data-[state=checked]:bg-white"
            />
            <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className={isActive ? 'text-white hover:bg-white/20' : 'hover:bg-muted/80'}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Capabilities Bar */}
      <div className="p-2 bg-muted/30 border-b flex flex-wrap gap-1">
        {GOD_TIER_CAPABILITIES.map((cap, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs gap-1">
            <cap.icon className={`h-3 w-3 ${cap.color}`} />
            {cap.label}
          </Badge>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-muted'
              }`}
            >
              {msg.role === 'assistant' && msg.capabilities && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {msg.capabilities.map((cap, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Orchestrating god-tier capabilities...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isActive ? "Tell me what you want to build or create..." : "Activate orchestrator to send messages..."}
            className="min-h-[60px] resize-none"
            disabled={isLoading || !isActive}
          />
          <Button
            type="button"
            onClick={(e) => sendMessage(e)}
            disabled={isLoading || !input.trim() || !isActive}
            size="icon"
            className={`h-[60px] w-[60px] ${
              isActive 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : 'bg-muted'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
};
