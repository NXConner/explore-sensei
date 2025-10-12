import { renderHook, act } from '@testing-library/react';
import { useAIAnalysis } from '../useAIAnalysis';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    }
  }
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('useAIAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAIAnalysis());

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should analyze image successfully', async () => {
    const mockAnalysisResult = {
      condition_score: 85,
      detected_issues: ['cracks', 'potholes'],
      recommendations: ['repair cracks', 'fill potholes'],
      confidence_score: 92
    };

    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: mockAnalysisResult,
      error: null
    });

    const { result } = renderHook(() => useAIAnalysis());

    await act(async () => {
      await result.current.analyzeImage('data:image/jpeg;base64,test');
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.results).toEqual(mockAnalysisResult);
    expect(result.current.error).toBe('');
  });

  it('should handle analysis error', async () => {
    const mockError = new Error('Analysis failed');

    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError
    });

    const { result } = renderHook(() => useAIAnalysis());

    await act(async () => {
      await result.current.analyzeImage('data:image/jpeg;base64,test');
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBe('Analysis failed');
  });

  it('should update progress during analysis', async () => {
    const mockAnalysisResult = {
      condition_score: 85,
      detected_issues: ['cracks'],
      recommendations: ['repair cracks'],
      confidence_score: 92
    };

    (supabase.functions.invoke as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockAnalysisResult, error: null });
        }, 100);
      });
    });

    const { result } = renderHook(() => useAIAnalysis());

    act(() => {
      result.current.analyzeImage('data:image/jpeg;base64,test');
    });

    expect(result.current.isAnalyzing).toBe(true);
    expect(result.current.progress).toBeGreaterThan(0);
  });

  it('should reset state when starting new analysis', async () => {
    const { result } = renderHook(() => useAIAnalysis());

    // Set some initial state
    act(() => {
      result.current.setResults({
        condition_score: 50,
        detected_issues: ['old issue'],
        recommendations: ['old recommendation'],
        confidence_score: 60
      });
      result.current.setError('old error');
    });

    // Start new analysis
    act(() => {
      result.current.analyzeImage('data:image/jpeg;base64,test');
    });

    expect(result.current.results).toBeNull();
    expect(result.current.error).toBe('');
    expect(result.current.isAnalyzing).toBe(true);
  });

  it('should handle batch analysis', async () => {
    const mockBatchResult = [
      {
        id: '1',
        condition_score: 85,
        detected_issues: ['cracks'],
        recommendations: ['repair cracks'],
        confidence_score: 92
      },
      {
        id: '2',
        condition_score: 70,
        detected_issues: ['potholes'],
        recommendations: ['fill potholes'],
        confidence_score: 88
      }
    ];

    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: mockBatchResult,
      error: null
    });

    const { result } = renderHook(() => useAIAnalysis());

    await act(async () => {
      await result.current.analyzeBatch(['image1', 'image2']);
    });

    expect(result.current.batchResults).toEqual(mockBatchResult);
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should calculate severity correctly', () => {
    const { result } = renderHook(() => useAIAnalysis());

    expect(result.current.calculateSeverity(95)).toBe('low');
    expect(result.current.calculateSeverity(80)).toBe('medium');
    expect(result.current.calculateSeverity(60)).toBe('high');
    expect(result.current.calculateSeverity(30)).toBe('critical');
  });

  it('should estimate cost based on condition score', () => {
    const { result } = renderHook(() => useAIAnalysis());

    const highScoreCost = result.current.estimateCost(90);
    const lowScoreCost = result.current.estimateCost(40);

    expect(highScoreCost).toBeLessThan(lowScoreCost);
    expect(highScoreCost).toBeGreaterThan(0);
    expect(lowScoreCost).toBeGreaterThan(0);
  });

  it('should generate recommendations based on issues', () => {
    const { result } = renderHook(() => useAIAnalysis());

    const issues = ['cracks', 'potholes', 'fading'];
    const recommendations = result.current.generateRecommendations(issues);

    expect(recommendations).toContain('Repair cracks');
    expect(recommendations).toContain('Fill potholes');
    expect(recommendations).toContain('Apply new sealant');
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
