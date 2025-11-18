import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Zap, Code, Film, Palette, Music, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm your God-Tier Orchestrator - a fusion of all AI bot capabilities. I can build apps, direct videos, optimize for virality, engineer solutions, and orchestrate complete production workflows. What do you want to create?",
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

  const sendMessage = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Analyze intent and route to appropriate bot capabilities
      const context = {
        currentPage: window.location.pathname,
        conversationHistory: messages,
        godTierMode: true
      };

      const { data, error } = await supabase.functions.invoke('bot-orchestrator', {
        body: { 
          message: userMessage,
          context,
          campaign_type: 'full_viral_campaign',
          mode: 'god_tier'
        }
      });

      if (error) {
        if (error.message?.includes('402')) {
          throw new Error('Lovable AI credits depleted. Please add credits in Settings → Workspace → Usage.');
        }
        if (error.message?.includes('429')) {
          throw new Error('Rate limit reached. Please wait a moment and try again.');
        }
        throw error;
      }

      const assistantMessage = data?.response || data?.message || 'Task initiated. All god-tier capabilities are engaged.';
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        capabilities: data?.activatedCapabilities
      }]);

    } catch (error) {
      console.error('God-Tier Orchestrator error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      toast({
        title: "Orchestrator Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMessage}`
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 z-50"
        size="icon"
      >
        <div className="relative">
          <Zap className="h-6 w-6 text-white" />
          <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[450px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg">God-Tier Orchestrator</h3>
            <p className="text-xs text-white/80">All Capabilities • App Builder Mode</p>
          </div>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
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
            placeholder="Tell me what you want to build or create..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={(e) => sendMessage(e)}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-[60px] w-[60px]"
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
