import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface EditPerformance {
  id: string;
  edit_style: string;
  content_type: string;
  performance_score: number;
  quality_score: number;
  actual_views: number;
  actual_engagement_rate: number;
  actual_retention_rate: number;
  created_at: string;
}

interface StyleRecommendation {
  style: string;
  score: number;
  reason: string;
  pastSuccessRate: number;
}

export const useEditLearning = () => {
  const [performanceHistory, setPerformanceHistory] = useState<EditPerformance[]>([]);
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch performance history
  const fetchPerformanceHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('edit_performance_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setPerformanceHistory(data || []);
    } catch (error) {
      logger.error('Failed to fetch performance history', error);
    }
  };

  // Calculate style recommendations based on history
  const calculateRecommendations = (contentType?: string) => {
    if (performanceHistory.length === 0) {
      setRecommendations([]);
      return;
    }

    const styleStats = new Map<string, { scores: number[]; views: number[]; engagement: number[] }>();

    // Filter by content type if provided
    const relevantHistory = contentType 
      ? performanceHistory.filter(h => h.content_type === contentType)
      : performanceHistory;

    // Aggregate stats by style
    relevantHistory.forEach(record => {
      if (!styleStats.has(record.edit_style)) {
        styleStats.set(record.edit_style, { scores: [], views: [], engagement: [] });
      }
      
      const stats = styleStats.get(record.edit_style)!;
      stats.scores.push(record.performance_score || 0);
      stats.views.push(record.actual_views || 0);
      stats.engagement.push(record.actual_engagement_rate || 0);
    });

    // Calculate recommendations
    const recs: StyleRecommendation[] = Array.from(styleStats.entries()).map(([style, stats]) => {
      const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
      const avgViews = stats.views.reduce((a, b) => a + b, 0) / stats.views.length;
      const avgEngagement = stats.engagement.reduce((a, b) => a + b, 0) / stats.engagement.length;
      
      // Calculate overall success rate
      const successRate = (avgScore / 10) * 100;
      
      // Generate reason
      let reason = '';
      if (avgViews > 10000) {
        reason = `High view count (avg ${(avgViews / 1000).toFixed(1)}K)`;
      } else if (avgEngagement > 10) {
        reason = `Strong engagement (${avgEngagement.toFixed(1)}%)`;
      } else {
        reason = `Consistent quality (${avgScore.toFixed(1)}/10)`;
      }

      return {
        style,
        score: avgScore,
        reason,
        pastSuccessRate: successRate
      };
    });

    // Sort by score descending
    recs.sort((a, b) => b.score - a.score);
    
    setRecommendations(recs);
  };

  // Track edit performance
  const trackEditPerformance = async (params: {
    episodeId: string;
    editStyle: string;
    contentType?: string;
    qualityScore: number;
    predictedViews?: number;
    predictedEngagement?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('edit_performance_history')
        .insert({
          user_id: user.id,
          episode_id: params.episodeId,
          edit_style: params.editStyle,
          content_type: params.contentType || 'general',
          quality_score: params.qualityScore,
          performance_score: params.qualityScore, // Initial score based on quality
          actual_views: 0,
          actual_engagement_rate: 0,
          actual_retention_rate: 0,
          metadata: {
            predicted_views: params.predictedViews,
            predicted_engagement: params.predictedEngagement
          }
        });

      if (error) throw error;

      // Refresh history
      await fetchPerformanceHistory();
    } catch (error) {
      logger.error('Failed to track edit performance', error);
      throw error;
    }
  };

  // Update actual performance metrics
  const updateActualPerformance = async (params: {
    performanceId: string;
    actualViews: number;
    actualEngagementRate: number;
    actualRetentionRate: number;
  }) => {
    try {
      const { error } = await supabase
        .from('edit_performance_history')
        .update({
          actual_views: params.actualViews,
          actual_engagement_rate: params.actualEngagementRate,
          actual_retention_rate: params.actualRetentionRate,
          // Recalculate performance score based on actual metrics
          performance_score: (
            (params.actualEngagementRate / 20) * 3 +
            (params.actualRetentionRate / 100) * 4 +
            Math.min(params.actualViews / 10000, 1) * 3
          )
        })
        .eq('id', params.performanceId);

      if (error) throw error;

      await fetchPerformanceHistory();
    } catch (error) {
      logger.error('Failed to update actual performance', error);
      throw error;
    }
  };

  // Get smart recommendations
  const getSmartRecommendations = (contentType?: string): StyleRecommendation[] => {
    calculateRecommendations(contentType);
    return recommendations;
  };

  useEffect(() => {
    fetchPerformanceHistory();
  }, []);

  return {
    performanceHistory,
    recommendations,
    isLoading,
    trackEditPerformance,
    updateActualPerformance,
    getSmartRecommendations,
    refreshHistory: fetchPerformanceHistory
  };
};
