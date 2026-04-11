import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
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
 * Uploads an image to Supabase Storage and returns the public URL and file name
 */
const uploadImageToSupabase = async (imageUri: string) => {
  let uploadBody: any;

  if (imageUri.startsWith('content://') || imageUri.startsWith('file://')) {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });
    uploadBody = decode(base64);
  } else {
    const response = await fetch(imageUri);
    uploadBody = await response.blob();
  }

  const fileName = `scan-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("scans")
    .upload(fileName, uploadBody, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error("Image upload failed: " + error.message);
  }

  const { data } = supabase.storage
    .from("scans")
    .getPublicUrl(fileName);

  return { publicUrl: data.publicUrl, fileName };
};

/**
 * Processes an image scan by uploading to storage first, then calling the Edge Function
 */
export const processImageScan = async (imageUri: string, selectedCrop: string = 'Maize'): Promise<ScanResult> => {
  try {
    const { publicUrl, fileName } = await uploadImageToSupabase(imageUri);

    const { data, error } = await supabase.functions.invoke("process-scan", {
      body: {
        imageUrl: publicUrl,
        storagePath: fileName,
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
