import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useReports } from '../hooks/useReports';
import { useFeedback } from '../context/FeedbackContext';
import { Profile } from '../hooks/useProfile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReceiptScan {
  id: string;
  crop: string;
  result: string;
  severity: string;
  date: string;
  organic_advice?: string;
  chemical_advice?: string;
  prevention?: string;
}

interface ReceiptPreviewProps {
  visible: boolean;
  onClose: () => void;
  selectedScans: ReceiptScan[];
  profile: Profile | null;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ visible, onClose, selectedScans, profile }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedUri, setGeneratedUri] = React.useState<string | null>(null);
  const { saveReport } = useReports();
  const { showError, showWarning, showInfo } = useFeedback();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = async () => {
    if (!generatedUri || generatedUri === 'web-print-done') {
      showInfo('Unavailable', 'Direct sharing is not supported on web. Please use the Print option to save as PDF.');
      return;
    }
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(generatedUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Bingwa Agro-Report',
        });
      } else {
        showWarning('Sharing Unavailable', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Sharing Error:', error);
      showError('Error', 'Failed to share the report.');
    }
  };

  const handlePrint = async () => {
    if (generatedUri === 'web-print-done') {
      generatePDF(); // Re-print on web
      return;
    }
    if (!generatedUri) return;
    try {
      await Print.printAsync({ uri: generatedUri });
    } catch (error) {
      console.error('Print Error:', error);
      showError('Error', 'Failed to open print dialog.');
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; background-color: #fff; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #F4A261; padding-bottom: 30px; margin-bottom: 40px; }
              .company-info { flex: 1; }
              .company-name { font-weight: 900; font-size: 32px; color: #F4A261; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
              .company-tagline { font-size: 12px; color: #666; margin-top: 5px; font-weight: 700; }
              .report-meta { text-align: right; }
              .report-title { font-weight: 900; font-size: 18px; margin: 0; color: #000; }
              .report-date { font-size: 12px; color: #666; margin-top: 5px; }
              
              .farmer-section { background-color: #FDF2E9; padding: 25px; border-radius: 15px; margin-bottom: 40px; border: 1px solid #FAE5D3; }
              .section-label { font-size: 10px; font-weight: 900; color: #F4A261; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: block; }
              .farmer-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .detail-item { font-size: 14px; }
              .detail-label { font-weight: 700; color: #555; }
              
              .scan-item { margin-bottom: 50px; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
              .scan-header { background-color: #1a1a1a; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
              .scan-crop { font-weight: 900; font-size: 18px; margin: 0; }
              .scan-severity { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 50px; }
              .sev-high { background-color: #E74C3C; }
              .sev-medium { background-color: #F39C12; }
              .sev-low { background-color: #27AE60; }
              
              .scan-content { padding: 25px; }
              .diagnosis-box { margin-bottom: 25px; }
              .diagnosis-text { font-weight: 700; font-size: 20px; color: #000; margin-top: 5px; }
              
              .advice-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
              .advice-card { background-color: #f9f9f9; padding: 20px; border-radius: 12px; border-left: 5px solid #F4A261; }
              .advice-title { font-weight: 900; font-size: 12px; text-transform: uppercase; color: #F4A261; margin-bottom: 10px; display: block; }
              .advice-text { font-size: 13px; color: #333; margin: 0; }
              
              .footer { margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 30px; font-size: 11px; color: #888; }
              .footer-bold { font-weight: 700; color: #444; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-info">
                <h1 class="company-name">Bingwa</h1>
                <div class="company-tagline">SMART SOLUTIONS FOR THE MODERN FARMER</div>
              </div>
              <div class="report-meta">
                <h2 class="report-title">DIAGNOSTIC REPORT</h2>
                <div class="report-date">${todayFormatted.toUpperCase()}</div>
                <div class="report-date">${todayTime}</div>
              </div>
            </div>

            <div class="farmer-section">
              <span class="section-label">Farmer Profile</span>
              <div class="farmer-details">
                <div class="detail-item"><span class="detail-label">Farmer:</span> ${profile?.full_name || 'Bingwa User'}</div>
                <div class="detail-item"><span class="detail-label">Location:</span> ${profile?.location || profile?.county || 'Nairobi, Kenya'}</div>
                <div class="detail-item"><span class="detail-label">Email:</span> ${profile?.email || 'N/A'}</div>
                <div class="detail-item"><span class="detail-label">ID:</span> #BNG-${(profile?.id || '000').slice(0, 5).toUpperCase()}</div>
              </div>
            </div>

            ${selectedScans.map((scan, i) => `
              <div class="scan-item">
                <div class="scan-header">
                  <h3 class="scan-crop">${scan.crop || 'Crop'}</h3>
                  <span class="scan-severity sev-${scan.severity}">${scan.severity} risk</span>
                </div>
                <div class="scan-content">
                  <div class="diagnosis-box">
                    <span class="section-label">Diagnosis</span>
                    <div class="diagnosis-text">${scan.result}</div>
                  </div>
                  
                  <div class="advice-grid">
                    <div class="advice-card">
                      <span class="advice-title">Organic Protocol</span>
                      <p class="advice-text">${scan.organic_advice || 'No specific organic remedies identified for this scan.'}</p>
                    </div>
                    
                    <div class="advice-card" style="border-left-color: #3498DB;">
                      <span class="advice-title" style="color: #3498DB;">Chemical Treatment</span>
                      <p class="advice-text">${scan.chemical_advice || 'No specific chemical treatments identified for this scan.'}</p>
                    </div>
                    
                    <div class="advice-card" style="border-left-color: #27AE60;">
                      <span class="advice-title" style="color: #27AE60;">Prevention Plan</span>
                      <p class="advice-text">${scan.prevention || 'Standard hygiene and monitoring procedures recommended.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}

            <div class="footer">
              <p>This report was generated by <span class="footer-bold">Bingwa AI Agricultural Assistant</span>.</p>
              <p>The information provided is for educational purposes. For severe infestations, consult a local agricultural officer.</p>
              <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Bingwa Shambani. All Rights Reserved.</p>
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        setGeneratedUri('web-print-done');
        return;
      }

      if ((Platform.OS as string) !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      
      const { uri } = await Print.printToFileAsync({ html });
      setGeneratedUri(uri);

      // Auto-save the report to Supabase/Vault
      try {
        await saveReport(selectedScans);
      } catch (saveErr) {
        console.warn("Failed to save report to cloud, stored locally:", saveErr);
      }
      
      if ((Platform.OS as string) !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showError('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAndClose = () => {
    setGeneratedUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetAndClose}>
      <View style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 100 }}
          className="bg-white w-full mt-auto max-h-[95%] rounded-t-[40px] overflow-hidden shadow-2xl flex-shrink"
        >
          <View className="items-center py-4 bg-white border-b border-gray-100">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-2" />
            <Text className="font-poppins-bold text-[10px] text-gray-400 uppercase tracking-widest">Report Preview</Text>
          </View>

          <ScrollView className="flex-grow px-6 pb-10" showsVerticalScrollIndicator={false}>
            {generatedUri ? (
              <MotiView 
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="items-center py-10"
              >
                <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
                  <Ionicons name="checkmark-circle" size={64} color="#25D366" />
                </View>
                <Text className="text-2xl font-poppins-black text-center mb-2">Report Ready!</Text>
                <Text className="text-gray-500 font-poppins-regular text-center mb-10 px-4">
                  Your official Bingwa Agro-Report has been generated and is ready to be shared or printed.
                </Text>

                <View className="w-full space-y-4">
                  <TouchableOpacity 
                    onPress={handleShare}
                    className="h-16 bg-[#F4A261] rounded-[24px] flex-row items-center justify-center shadow-lg shadow-orange-500/20 mb-4"
                  >
                    <Ionicons name="share-social-outline" size={24} color="white" className="mr-3" />
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">Share Report</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handlePrint}
                    className="h-16 bg-white border-2 border-[#F4A261] rounded-[24px] flex-row items-center justify-center"
                  >
                    <Ionicons name="print-outline" size={24} color="#F4A261" className="mr-3" />
                    <Text className="text-[#F4A261] font-poppins-black text-sm uppercase tracking-widest">Print Report</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            ) : (
              <>
                  <View className="py-8 bg-white">
                      <View className="items-center mb-10 border-b border-orange-100 pb-6">
                        <Text className="text-3xl font-poppins-black text-[#F4A261] uppercase tracking-[4px]">BINGWA</Text>
                        <Text className="text-gray-400 font-poppins-bold text-[8px] uppercase tracking-[2px] mt-1">Smart Solutions for Modern Farmers</Text>
                        <View className="mt-6 px-4 py-2 bg-orange-50 rounded-full">
                           <Text className="text-[10px] font-poppins-black text-[#F4A261] uppercase tracking-widest">Official Diagnostic Report</Text>
                        </View>
                        <Text className="text-gray-400 font-poppins-regular text-[9px] mt-3 uppercase tracking-widest">{todayFormatted} • {todayTime}</Text>
                      </View>

                      {profile && (
                        <View className="mb-10 p-5 bg-orange-50/50 rounded-3xl border border-orange-100/50">
                           <Text className="text-[9px] font-poppins-black text-[#F4A261] uppercase tracking-widest mb-4">Farmer Profile</Text>
                           <View className="flex-row flex-wrap">
                              <View className="w-1/2 mb-3">
                                 <Text className="text-[8px] font-poppins-bold text-gray-400 uppercase">Name</Text>
                                 <Text className="text-sm font-poppins-bold text-gray-800">{profile.full_name}</Text>
                              </View>
                              <View className="w-1/2 mb-3">
                                 <Text className="text-[8px] font-poppins-bold text-gray-400 uppercase">Location</Text>
                                 <Text className="text-sm font-poppins-bold text-gray-800">{profile.location || profile.county || 'N/A'}</Text>
                              </View>
                              <View className="w-full">
                                 <Text className="text-[8px] font-poppins-bold text-gray-400 uppercase">Email</Text>
                                 <Text className="text-sm font-poppins-bold text-gray-800">{profile.email}</Text>
                              </View>
                           </View>
                        </View>
                      )}

                      <Text className="text-[9px] font-poppins-black text-gray-400 uppercase tracking-widest mb-6">Scan Results ({selectedScans.length})</Text>

                      {selectedScans.map((scan, index) => (
                        <View key={index} className="mb-8 bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                          <View className="bg-gray-900 px-6 py-4 flex-row justify-between items-center">
                            <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                                {scan.crop}
                            </Text>
                            <View className={`px-3 py-1 rounded-full ${scan.severity === 'high' ? 'bg-red-500' : scan.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}>
                                <Text className="text-white font-poppins-black text-[8px] uppercase tracking-widest">{scan.severity}</Text>
                            </View>
                          </View>
                          
                          <View className="p-6">
                            <Text className="text-xs font-poppins-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis</Text>
                            <Text className="text-xl font-poppins-black text-black mb-6">{scan.result}</Text>
                            
                            <View className="space-y-4">
                                <View className="p-4 bg-gray-50 rounded-2xl border-l-4 border-[#F4A261]">
                                    <Text className="text-[8px] font-poppins-black text-[#F4A261] uppercase tracking-widest mb-1">Organic Protocol</Text>
                                    <Text className="text-xs text-gray-700 leading-relaxed">{scan.organic_advice}</Text>
                                </View>
                                
                                <View className="p-4 bg-gray-50 rounded-2xl border-l-4 border-blue-400">
                                    <Text className="text-[8px] font-poppins-black text-blue-400 uppercase tracking-widest mb-1">Chemical Treatment</Text>
                                    <Text className="text-xs text-gray-700 leading-relaxed">{scan.chemical_advice}</Text>
                                </View>
                                
                                <View className="p-4 bg-gray-50 rounded-2xl border-l-4 border-green-500">
                                    <Text className="text-[8px] font-poppins-black text-green-500 uppercase tracking-widest mb-1">Prevention Plan</Text>
                                    <Text className="text-xs text-gray-700 leading-relaxed">{scan.prevention}</Text>
                                </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                <TouchableOpacity 
                  onPress={generatePDF}
                  disabled={isGenerating}
                  className="mt-6 h-20 bg-black rounded-[28px] flex-row items-center justify-center shadow-2xl"
                >
                  {isGenerating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                        <View className="bg-orange-500 w-10 h-10 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="document-text" size={20} color="white" />
                        </View>
                        <Text className="text-white font-poppins-black uppercase tracking-[3px] text-xs">Finalize PDF Report</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={resetAndClose}
              className="mt-8 mb-12 items-center py-4"
            >
              <Text className="text-gray-400 font-poppins-bold text-[10px] uppercase tracking-[4px]">
                {generatedUri ? 'Close Dashboard' : 'Dismiss Preview'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </MotiView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
});
