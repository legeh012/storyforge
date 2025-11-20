import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVoiceAutomation = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startVoiceCommand = async () => {
    try {
      setIsListening(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];

          try {
            const { data, error } = await supabase.functions.invoke('voice-automation', {
              body: { audio: base64Audio }
            });

            if (error) throw error;

            // Play voice response
            if (data.voiceResponse) {
              const audioBlob = new Blob(
                [Uint8Array.from(atob(data.voiceResponse), c => c.charCodeAt(0))],
                { type: 'audio/mpeg' }
              );
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audio.play();
            }

            toast({
              title: "✅ Command Executed",
              description: data.transcribedCommand,
            });
          } catch (error) {
            console.error('Voice automation error:', error);
            toast({
              title: "Voice Command Failed",
              description: error instanceof Error ? error.message : 'Unknown error',
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
    } catch (error) {
      console.error('Microphone access error:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone access to use voice commands",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const sendTextCommand = async (command: string) => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('voice-automation', {
        body: { voiceCommand: command }
      });

      if (error) throw error;

      // Play voice response
      if (data.voiceResponse) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.voiceResponse), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }

      toast({
        title: "✅ Command Executed",
        description: command,
      });

      return data;
    } catch (error) {
      console.error('Text command error:', error);
      toast({
        title: "Command Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startVoiceCommand,
    sendTextCommand,
    isListening,
    isProcessing,
  };
};
