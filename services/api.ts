import { supabase } from '../lib/supabase';

export interface ScanResult {
  success: boolean;
  scanId?: string;
  diagnosis?: string;
  confidence?: number;
  severity?: string;
  error?: string;
}

/**
 * Uploads an image to Supabase Storage and returns the public URL
 */
const uploadImageToSupabase = async (imageUri: string) => {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const fileName = `scan-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("scans")
    .upload(fileName, blob);

  if (error) {
    throw new Error("Image upload failed: " + error.message);
  }

  const { data } = supabase.storage
    .from("scans")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Processes an image scan by uploading to storage first, then calling the Edge Function
 */
export const processImageScan = async (imageUri: string, selectedCrop: string = 'Maize'): Promise<ScanResult> => {
  try {
    const imageUrl = await uploadImageToSupabase(imageUri);

    const { data, error } = await supabase.functions.invoke("process-scan", {
      body: {
        imageUrl,
        crop: selectedCrop
      }
    });

    if (error) throw error;

    console.log("Scan result:", data);
    return data;
  } catch (err: any) {
    console.error("Scan failed:", err);
    return {
      success: false,
      error: err.message || 'Failed to process scan'
    };
  }
};
