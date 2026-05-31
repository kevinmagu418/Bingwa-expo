import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import { normalizeCropForApi } from '../utils/crops';

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
 * Optimized for production APK builds.
 */
const uploadImageToSupabase = async (imageUri: string) => {
  try {
    const fileExt = imageUri.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `scan-${Date.now()}.${fileExt}`;
    const mimeType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;

    console.log(`[Upload] Preparing image: ${fileName} (${mimeType})`);

    let uploadBody: any;

    // Use FormData for production reliability on Android/iOS
    // This avoids reading large files into memory as base64 strings
    if (Platform.OS !== 'web') {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);
      uploadBody = formData;
    } else {
      // Fallback for Web or if FormData approach is not desired
      const response = await fetch(imageUri);
      uploadBody = await response.blob();
    }

    const { error } = await supabase.storage
      .from("scans")
      .upload(fileName, uploadBody, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("[Upload] Supabase Storage Error:", error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage
      .from("scans")
      .getPublicUrl(fileName);

    return { publicUrl: data.publicUrl, fileName };
  } catch (err: any) {
    console.error("[Upload] Critical failure:", err);
    throw err;
  }
};

/**
 * Processes an image scan by uploading to storage first, then calling the Edge Function
 */
export const processImageScan = async (imageUri: string, selectedCrop: string = 'Maize'): Promise<ScanResult> => {
  try {
    const { publicUrl, fileName } = await uploadImageToSupabase(imageUri);
    const normalizedCrop = normalizeCropForApi(selectedCrop);

    const { data, error } = await supabase.functions.invoke("process-scan", {
      body: {
        imageUrl: publicUrl,
        storagePath: fileName,
        crop: normalizedCrop
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
