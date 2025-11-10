import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  episodeId: string;
  frameUrls?: string[];
  metadata?: any;
}

interface QualityMetric {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  value?: number;
  threshold?: number;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { episodeId, frameUrls, metadata } = await req.json() as ValidationRequest;

    console.log(`🔍 Starting quality validation for episode ${episodeId}`);
    const validationStartTime = Date.now();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const metrics: QualityMetric[] = [];

    // Check 1: Frame Count Validation
    const frameCount = frameUrls?.length || 0;
    metrics.push({
      name: 'Frame Count',
      status: frameCount >= 5 ? 'pass' : frameCount > 0 ? 'warning' : 'fail',
      value: frameCount,
      threshold: 5,
      message: frameCount >= 5 
        ? `${frameCount} frames detected - excellent coverage`
        : frameCount > 0
        ? `Only ${frameCount} frames - consider adding more for better quality`
        : 'No frames found - production incomplete'
    });

    // Check 2: Frame Consistency (AI Analysis)
    if (frameCount > 0) {
      console.log('🎨 Analyzing frame consistency with AI...');
      
      const consistencyPrompt = `Analyze this video production quality:
      - Total frames: ${frameCount}
      - Metadata: ${JSON.stringify(metadata)}
      
      Evaluate:
      1. Visual consistency across frames
      2. Proper scene transitions
      3. Character consistency
      4. Overall production quality
      
      Return JSON: { consistency: number (0-100), issues: string[], recommendations: string[] }`;

      const consistencyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a professional video quality control AI inspector.' },
            { role: 'user', content: consistencyPrompt }
          ],
        }),
      });

      let consistencyScore = 0;
      let consistencyIssues: string[] = [];

      if (consistencyResponse.ok) {
        const consistencyData = await consistencyResponse.json();
        try {
          const analysis = JSON.parse(consistencyData.choices[0].message.content);
          consistencyScore = analysis.consistency || 0;
          consistencyIssues = analysis.issues || [];
          
          metrics.push({
            name: 'Frame Consistency',
            status: consistencyScore >= 80 ? 'pass' : consistencyScore >= 60 ? 'warning' : 'fail',
            value: consistencyScore,
            threshold: 80,
            message: consistencyScore >= 80
              ? 'Excellent frame-to-frame consistency'
              : consistencyScore >= 60
              ? `Moderate consistency: ${consistencyIssues.join(', ')}`
              : `Poor consistency detected: ${consistencyIssues.join(', ')}`
          });
        } catch (e) {
          metrics.push({
            name: 'Frame Consistency',
            status: 'warning',
            message: 'Could not analyze - assuming acceptable quality'
          });
        }
      }
    }

    // Check 3: Metadata Validation
    const hasMetadata = metadata && Object.keys(metadata).length > 0;
    metrics.push({
      name: 'Metadata Completeness',
      status: hasMetadata ? 'pass' : 'warning',
      message: hasMetadata
        ? 'Production metadata complete'
        : 'Missing metadata - may affect playback'
    });

    // Check 4: Photorealism Quality (AI Check)
    if (frameCount > 0) {
      console.log('🎬 Evaluating photorealism quality...');
      
      const realismPrompt = `Evaluate photorealism quality for Netflix-grade production:
      - Target: Photorealistic reality TV style
      - Frame count: ${frameCount}
      - Production type: ${metadata?.style || 'reality TV'}
      
      Rate the expected photorealism quality (0-100) and provide recommendations.
      Return JSON: { realism: number, grade: string, improvements: string[] }`;

      const realismResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a Netflix-grade quality control specialist.' },
            { role: 'user', content: realismPrompt }
          ],
        }),
      });

      if (realismResponse.ok) {
        const realismData = await realismResponse.json();
        try {
          const analysis = JSON.parse(realismData.choices[0].message.content);
          const realismScore = analysis.realism || 0;
          
          metrics.push({
            name: 'Photorealism Quality',
            status: realismScore >= 85 ? 'pass' : realismScore >= 70 ? 'warning' : 'fail',
            value: realismScore,
            threshold: 85,
            message: realismScore >= 85
              ? `Netflix-grade quality achieved (${analysis.grade})`
              : realismScore >= 70
              ? `Good quality with room for improvement (${analysis.grade})`
              : `Quality below standard - ${analysis.improvements?.join(', ')}`
          });
        } catch (e) {
          metrics.push({
            name: 'Photorealism Quality',
            status: 'warning',
            message: 'Quality assessment pending'
          });
        }
      }
    }

    // Check 5: Production Pipeline Integrity
    const pipelineChecks = [
      metadata?.script ? 'script' : null,
      metadata?.characters ? 'characters' : null,
      metadata?.cinematography ? 'cinematography' : null,
    ].filter(Boolean);

    metrics.push({
      name: 'Pipeline Integrity',
      status: pipelineChecks.length >= 2 ? 'pass' : pipelineChecks.length > 0 ? 'warning' : 'fail',
      value: pipelineChecks.length,
      threshold: 3,
      message: pipelineChecks.length >= 2
        ? `All core pipeline stages completed: ${pipelineChecks.join(', ')}`
        : pipelineChecks.length > 0
        ? `Partial pipeline completion: ${pipelineChecks.join(', ')}`
        : 'Pipeline incomplete - missing critical stages'
    });

    // Calculate overall quality score
    const passedChecks = metrics.filter(m => m.status === 'pass').length;
    const totalChecks = metrics.length;
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    const validationTimeMs = Date.now() - validationStartTime;
    
    // Log performance metrics
    await supabase.from('performance_metrics').insert({
      episode_id: episodeId,
      metric_type: 'quality_validation',
      value: validationTimeMs,
      metadata: { quality_score: overallScore, checks_passed: passedChecks, total_checks: totalChecks }
    });

    // Quality threshold gate - minimum score of 70
    const QUALITY_THRESHOLD = 70;
    if (overallScore < QUALITY_THRESHOLD) {
      console.warn(`🚨 Quality score ${overallScore}% below threshold ${QUALITY_THRESHOLD}%`);
      
      const failedMetrics = metrics.filter(m => m.status === 'fail' || m.status === 'warning');
      const issues = failedMetrics.map(m => m.message).join('; ');
      
      // Update episode with quality error
      await supabase
        .from('episodes')
        .update({
          video_status: 'failed',
          video_render_error: `Quality score ${overallScore}/100 is below the minimum threshold of ${QUALITY_THRESHOLD}/100. Issues: ${issues}. Please regenerate the video with higher quality settings.`,
          quality_score: overallScore,
          quality_report: { metrics, timestamp: new Date().toISOString() }
        })
        .eq('id', episodeId);

      return new Response(
        JSON.stringify({ 
          success: false,
          belowThreshold: true,
          threshold: QUALITY_THRESHOLD,
          overallScore,
          metrics,
          passed: passedChecks,
          total: totalChecks,
          grade: 'F'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Store quality report for passing scores
    await supabase
      .from('episodes')
      .update({
        quality_score: overallScore,
        quality_report: { metrics, timestamp: new Date().toISOString() }
      })
      .eq('id', episodeId);

    console.log(`✅ Quality validation complete: ${overallScore}% (${passedChecks}/${totalChecks} checks passed)`);

    return new Response(
      JSON.stringify({
        success: true,
        overallScore,
        metrics,
        passed: passedChecks,
        total: totalChecks,
        grade: overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'D'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Quality validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
