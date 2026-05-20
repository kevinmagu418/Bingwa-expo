import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useReports } from '../hooks/useReports';
import { useFeedback } from '../context/FeedbackContext';

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
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ visible, onClose, selectedScans }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedUri, setGeneratedUri] = React.useState<string | null>(null);
  const { saveReport } = useReports();
  const { showError, showWarning, showInfo } = useFeedback();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

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
            <style>
              body { font-family: sans-serif; padding: 20px; color: #000; }
              .item { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
              .label { font-weight: bold; font-size: 14px; margin-top: 10px; display: block; }
              .value { font-size: 14px; margin-bottom: 5px; }
              h1 { border-bottom: 2px solid #000; }
            </style>
          </head>
          <body>
            <h1>Farm Diagnostic Report</h1>
            <p>Generated on: ${today}</p>
            ${selectedScans.map((scan, i) => `
              <div class="item">
                <h2>${i + 1}. ${scan.crop || 'Crop'}</h2>
                <p><strong>Diagnosis:</strong> ${scan.result}</p>
                <p><strong>Severity:</strong> ${scan.severity}</p>
                
                <span class="label">Organic Remedies:</span>
                <p class="value">${scan.organic_advice || 'N/A'}</p>
                
                <span class="label">Chemical Remedies:</span>
                <p class="value">${scan.chemical_advice || 'N/A'}</p>
                
                <span class="label">Prevention Tips:</span>
                <p class="value">${scan.prevention || 'N/A'}</p>
              </div>
            `).join('')}
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
          className="bg-white w-full mt-auto max-h-[90%] rounded-t-[40px] overflow-hidden shadow-2xl flex-shrink"
        >
          <View className="items-center py-4 bg-white">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
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
                <Text className="text-gray-500 font-poppins-regular text-center mb-10">
                  Your report has been generated successfully.
                </Text>

                <View className="w-full space-y-4">
                  <TouchableOpacity 
                    onPress={handleShare}
                    className="h-16 bg-accent rounded-[24px] flex-row items-center justify-center shadow-lg shadow-accent/20 mb-4"
                  >
                    <Ionicons name="share-social-outline" size={24} color="white" className="mr-3" />
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">Share Report</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handlePrint}
                    className="h-16 bg-white border-2 border-accent rounded-[24px] flex-row items-center justify-center"
                  >
                    <Ionicons name="print-outline" size={24} color="#25D366" className="mr-3" />
                    <Text className="text-accent font-poppins-black text-sm uppercase tracking-widest">Print Report</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            ) : (
              <>
                  <View className="p-4 bg-white">
                      <View className="items-center mb-10">
                        <Text className="text-2xl font-poppins-black text-black uppercase tracking-widest">Diagnostic Report</Text>
                        <Text className="text-gray-500 font-poppins-regular text-xs mt-2">{today}</Text>
                      </View>

                      {selectedScans.map((scan, index) => (
                        <View key={index} className="mb-10 border-b border-gray-100 pb-8">
                          <Text className="text-lg font-poppins-black text-black mb-1">
                            {index + 1}. {scan.crop?.toUpperCase()}
                          </Text>
                          <Text className="text-sm font-poppins-medium text-gray-600 mb-6">{scan.result?.toUpperCase()}</Text>
                          
                          <Text className="text-[10px] font-poppins-bold text-gray-400 uppercase tracking-widest mb-1">Organic Protocol</Text>
                          <Text className="text-sm text-gray-800 mb-4">{scan.organic_advice || 'N/A'}</Text>
                          
                          <Text className="text-[10px] font-poppins-bold text-gray-400 uppercase tracking-widest mb-1">Chemical Treatment</Text>
                          <Text className="text-sm text-gray-800 mb-4">{scan.chemical_advice || 'N/A'}</Text>
                          
                          <Text className="text-[10px] font-poppins-bold text-gray-400 uppercase tracking-widest mb-1">Prevention Plan</Text>
                          <Text className="text-sm text-gray-800">{scan.prevention || 'N/A'}</Text>
                        </View>
                      ))}
                    </View>

                <TouchableOpacity 
                  onPress={generatePDF}
                  disabled={isGenerating}
                  className="mt-10 h-16 bg-black rounded-2xl flex-row items-center justify-center shadow-lg"
                >
                  {isGenerating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-poppins-black uppercase tracking-widest">Export PDF Report</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={resetAndClose}
              className="mt-6 mb-12 items-center py-4"
            >
              <Text className="text-gray-400 font-poppins-bold text-sm uppercase tracking-widest">
                {generatedUri ? 'Done' : 'Cancel'}
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
});
