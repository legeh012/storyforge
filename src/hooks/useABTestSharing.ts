import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';

interface ABTestResult {
  id: string;
  test_name: string;
  variations: any;
  winner_variation_id: string | null;
  shared: boolean;
  share_token: string | null;
  metadata: any;
  created_at: string;
}

export const useABTestSharing = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Save A/B test results
  const saveABTestResults = async (params: {
    episodeId: string;
    testName: string;
    variations: any[];
    winnerVariationId?: string;
  }) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ab_test_results')
        .insert({
          user_id: user.id,
          episode_id: params.episodeId,
          test_name: params.testName,
          variations: params.variations,
          winner_variation_id: params.winnerVariationId || null,
          metadata: {
            saved_at: new Date().toISOString(),
            variation_count: params.variations.length
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ A/B Test Saved",
        description: "Your test results have been saved successfully",
      });

      return data;
    } catch (error) {
      logger.error('Failed to save A/B test results', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Generate shareable link
  const generateShareLink = async (testId: string) => {
    setIsSharing(true);
    try {
      // Generate unique share token
      const shareToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      const { error } = await supabase
        .from('ab_test_results')
        .update({
          shared: true,
          share_token: shareToken
        })
        .eq('id', testId);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared-ab-test/${shareToken}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "🔗 Share Link Generated",
        description: "Link copied to clipboard!",
      });

      return shareUrl;
    } catch (error) {
      logger.error('Failed to generate share link', error);
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  // Export as JSON
  const exportAsJSON = (variations: any[], testName: string) => {
    try {
      const exportData = {
        test_name: testName,
        exported_at: new Date().toISOString(),
        variations: variations.map(v => ({
          id: v.id,
          name: v.name,
          style: v.style,
          metadata: v.metadata,
          scenes: v.scenes.length
        })),
        summary: {
          total_variations: variations.length,
          best_predicted_performer: variations.reduce((best, v) => 
            v.metadata.performancePrediction.estimatedViews > best.metadata.performancePrediction.estimatedViews ? v : best
          ).name
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ab-test-${testName.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📥 Export Complete",
        description: "A/B test results exported as JSON",
      });
    } catch (error) {
      logger.error('Failed to export as JSON', error);
      toast({
        title: "Export Failed",
        description: "Could not export test results",
        variant: "destructive",
      });
    }
  };

  // Export as CSV
  const exportAsCSV = (variations: any[], testName: string) => {
    try {
      const headers = ['Variation', 'Style', 'Quality Score', 'Est. Views', 'Engagement Rate', 'Retention Score', 'Duration'];
      const rows = variations.map(v => [
        v.name,
        v.style,
        v.metadata.qualityScore,
        v.metadata.performancePrediction.estimatedViews,
        v.metadata.performancePrediction.engagementRate.toFixed(2),
        v.metadata.performancePrediction.retentionScore.toFixed(2),
        v.metadata.totalDuration
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ab-test-${testName.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📊 Export Complete",
        description: "A/B test results exported as CSV",
      });
    } catch (error) {
      logger.error('Failed to export as CSV', error);
      toast({
        title: "Export Failed",
        description: "Could not export test results",
        variant: "destructive",
      });
    }
  };

  // Load shared test
  const loadSharedTest = async (shareToken: string): Promise<ABTestResult | null> => {
    try {
      const { data, error } = await supabase
        .from('ab_test_results')
        .select('*')
        .eq('share_token', shareToken)
        .eq('shared', true)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Failed to load shared test', error);
      return null;
    }
  };

  return {
    saveABTestResults,
    generateShareLink,
    exportAsJSON,
    exportAsCSV,
    loadSharedTest,
    isSaving,
    isSharing
  };
};
