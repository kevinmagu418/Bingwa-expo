import { supabase } from '../lib/supabase';

export interface ScanResult {
  success: boolean;
  scanId?: string;
  diagnosis?: string;
  confidence?: number;
  severity?: string;
  error?: string;
}

export const processImageScan = async (imageUrl: string, cropType?: string): Promise<ScanResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('process-scan', {
      body: { imageUrl, cropType }
    });

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error('Scan API error:', err);
    return {
      success: false,
      error: err.message || 'Failed to process scan'
    };
  }
};
