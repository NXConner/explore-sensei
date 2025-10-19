import { useState, useCallback } from 'react';
import { logger } from '@/lib/monitoring';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  condition_score: number;
  detected_issues: string[];
  recommendations: string[];
  confidence_score: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost?: number;
  priority?: number;
}

interface BatchAnalysisResult extends AnalysisResult {
  id: string;
  image: string;
  timestamp: string;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchAnalysisResult[]>([]);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const analyzeImage = useCallback(async (imageDataUrl: string) => {
    try {
      setIsAnalyzing(true);
      setProgress(10);
      setError('');
      setResults(null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const { data, error: functionError } = await supabase.functions.invoke('analyze-asphalt', {
        body: { imageData: imageDataUrl }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (functionError) {
        throw functionError;
      }

      if (data) {
        const enhancedResult: AnalysisResult = {
          ...data,
          severity: calculateSeverity(data.condition_score),
          estimated_cost: estimateCost(data.condition_score),
          priority: calculatePriority(data.condition_score, data.confidence_score)
        };
        
        setResults(enhancedResult);
        setProgress(0);
      }
    } catch (error) {
        setError(error instanceof Error ? error.message : 'Analysis failed');
        toast({
          title: 'Analysis Error',
          description: 'Failed to analyze image',
          variant: 'destructive'
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, [toast]);

  const analyzeBatch = useCallback(async (imageDataUrls: string[]) => {
    try {
      setIsAnalyzing(true);
      setProgress(0);
      setError('');
      setBatchResults([]);

      const batchPromises = imageDataUrls.map(async (imageDataUrl, index) => {
        const { data, error: functionError } = await supabase.functions.invoke('analyze-asphalt', {
          body: { imageData: imageDataUrl }
        });

        if (functionError) {
          throw functionError;
        }

        setProgress(((index + 1) / imageDataUrls.length) * 100);

        return {
          id: `analysis-${index}`,
          image: imageDataUrl,
          timestamp: new Date().toISOString(),
          ...data,
          severity: calculateSeverity(data.condition_score),
          estimated_cost: estimateCost(data.condition_score),
          priority: calculatePriority(data.condition_score, data.confidence_score)
        } as BatchAnalysisResult;
      });

      const batchResults = await Promise.all(batchPromises);
      setBatchResults(batchResults);
      
      toast({
        title: 'Batch Analysis Complete',
        description: `Analyzed ${batchResults.length} images successfully`
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Batch analysis failed');
      toast({
        title: 'Batch Analysis Error',
        description: 'Failed to analyze images',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const calculateSeverity = useCallback((conditionScore: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (conditionScore >= 90) return 'low';
    if (conditionScore >= 70) return 'medium';
    if (conditionScore >= 50) return 'high';
    return 'critical';
  }, []);

  const estimateCost = useCallback((conditionScore: number): number => {
    // Base cost calculation based on condition score
    const baseCost = 1000; // Base cost for minor repairs
    const severityMultiplier = (100 - conditionScore) / 100;
    return Math.round(baseCost * (1 + severityMultiplier * 2));
  }, []);

  const calculatePriority = useCallback((conditionScore: number, confidenceScore: number): number => {
    // Priority calculation: lower condition score + higher confidence = higher priority
    const conditionWeight = (100 - conditionScore) / 100;
    const confidenceWeight = confidenceScore / 100;
    return Math.round((conditionWeight * 0.7 + confidenceWeight * 0.3) * 100);
  }, []);

  const generateRecommendations = useCallback((issues: string[]): string[] => {
    const recommendationMap: Record<string, string> = {
      'cracks': 'Repair cracks with appropriate sealant',
      'potholes': 'Fill potholes with hot mix asphalt',
      'fading': 'Apply new sealant to restore color',
      'drainage': 'Improve drainage system',
      'rutting': 'Level and resurface affected areas',
      'raveling': 'Apply surface treatment',
      'bleeding': 'Remove excess asphalt and resurface',
      'shoving': 'Repair base and resurface'
    };

    return issues.map(issue => 
      recommendationMap[issue.toLowerCase()] || `Address ${issue} issue`
    );
  }, []);

  const saveAnalysis = useCallback(async (analysisData: AnalysisResult, jobId?: string) => {
    try {
      const { error } = await supabase
        .from('ai_site_analysis')
        .insert([{
          job_id: jobId,
          analysis_type: 'condition_assessment',
          condition_score: analysisData.condition_score,
          detected_issues: analysisData.detected_issues as any,
          confidence_score: analysisData.confidence_score,
          user_id: 'demo-user'
        }]);

      if (error) throw error;

      toast({
        title: 'Analysis Saved',
        description: 'Analysis results saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Save Error',
        description: 'Failed to save analysis results',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const getAnalysisHistory = useCallback(async (jobId?: string) => {
    try {
      let query = supabase
        .from('ai_site_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching analysis history', { error });
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setProgress(0);
    setResults(null);
    setBatchResults([]);
    setError('');
  }, []);

  return {
    isAnalyzing,
    progress,
    results,
    batchResults,
    error,
    analyzeImage,
    analyzeBatch,
    calculateSeverity,
    estimateCost,
    generateRecommendations,
    saveAnalysis,
    getAnalysisHistory,
    reset,
    setResults,
    setError
  };
};
