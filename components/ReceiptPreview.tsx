import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Platform, Share, ActivityIndicator } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReceiptScan {
  id: string;
  crop: string;
  result: string;
  severity: string;
  date: string;
  recommendation?: string;
}

interface ReceiptPreviewProps {
  visible: boolean;
  onClose: () => void;
  selectedScans: ReceiptScan[];
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ visible, onClose, selectedScans }) => {
  const viewShotRef = useRef<any>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const totalDiseases = selectedScans.filter(s => s.severity !== 'low' && !s.result.toLowerCase().includes('healthy')).length;

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
              body { font-family: 'Poppins', sans-serif; padding: 20px; color: #111B21; background-color: #fff; }
              .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: 900; color: #25D366; margin: 0; }
              .subtitle { font-size: 10px; color: #54656F; text-transform: uppercase; letter-spacing: 2px; }
              .item { padding: 10px 0; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
              .item-name { font-weight: 700; font-size: 14px; }
              .item-detail { font-size: 12px; color: #54656F; }
              .severity { font-size: 10px; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
              .high { background: #fee2e2; color: #dc2626; }
              .med { background: #ffedd5; color: #ea580c; }
              .low { background: #dcfce7; color: #16a34a; }
              .footer { margin-top: 40px; text-align: center; border-top: 2px dashed #ccc; padding-top: 20px; }
              .footer-text { font-size: 10px; color: #8696A0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">BINGWA SHAMBANI</h1>
              <p class="subtitle">Agro-Prescription Receipt</p>
              <p style="font-size: 12px; margin-top: 10px;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
            ${selectedScans.map(scan => `
              <div class="item">
                <div>
                  <div class="item-name">${scan.crop} - ${scan.result}</div>
                  <div class="item-detail">${scan.date}</div>
                </div>
                <div class="severity ${scan.severity === 'high' ? 'high' : scan.severity === 'medium' ? 'med' : 'low'}">
                  ${scan.severity}
                </div>
              </div>
            `).join('')}
            <div class="footer">
              <p class="footer-text">Present this receipt to your nearest Agrovet for precise treatment supplies.</p>
              <p style="font-size: 14px; font-weight: 700; color: #128C7E;">Powered by Bingwa AI</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          className="bg-white dark:bg-darkSurface w-full max-h-[85vh] rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            className="p-6 flex-row justify-between items-center"
          >
            <View>
              <Text className="text-white font-poppins-black text-xl">Bingwa Receipt</Text>
              <Text className="text-white/70 font-poppins-regular text-[10px] uppercase tracking-widest">Agrovet Ready</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-black/10 rounded-full">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* The Actual Receipt Style View */}
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
              <View className="bg-white p-6 rounded-2xl border border-dashed border-gray-300">
                <View className="items-center mb-6 border-b border-dashed border-gray-200 pb-6">
                  <Text className="text-black font-poppins-black text-2xl tracking-tighter">BINGWA SHAMBANI</Text>
                  <Text className="text-gray-500 font-poppins-regular text-[10px] uppercase tracking-[3px] mt-1">Digital Prescription</Text>
                </View>

                {/* Scan List */}
                <View className="mb-6">
                  <View className="flex-row justify-between mb-4 pb-2 border-b border-gray-100">
                    <Text className="text-gray-400 font-poppins-bold text-[10px] uppercase">Condition</Text>
                    <Text className="text-gray-400 font-poppins-bold text-[10px] uppercase">Severity</Text>
                  </View>
                  
                  {selectedScans.map((scan, index) => (
                    <View key={index} className="flex-row justify-between items-center mb-4">
                      <View className="flex-1 mr-4">
                        <Text className="text-black font-poppins-bold text-sm leading-tight">{scan.crop} - {scan.result}</Text>
                        <Text className="text-gray-500 font-poppins-regular text-[10px]">{scan.date}</Text>
                      </View>
                      <View className={`px-3 py-1 rounded-md ${
                        scan.severity === 'high' ? 'bg-red-100' : scan.severity === 'medium' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        <Text className={`font-poppins-bold text-[9px] uppercase ${
                          scan.severity === 'high' ? 'text-red-600' : scan.severity === 'medium' ? 'text-orange-600' : 'text-green-600'
                        }`}>{scan.severity}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Summary */}
                <View className="border-t-2 border-dashed border-gray-200 pt-6 mb-6">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-500 font-poppins-regular text-xs">Total Items:</Text>
                    <Text className="text-black font-poppins-bold text-xs">{selectedScans.length}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 font-poppins-regular text-xs">Alert Level:</Text>
                    <Text className={`font-poppins-black text-sm ${totalDiseases > 2 ? 'text-red-600' : 'text-green-600'}`}>
                      {totalDiseases > 2 ? 'CRITICAL' : 'STABLE'}
                    </Text>
                  </View>
                </View>

                {/* QR Code */}
                <View className="items-center mt-4">
                  <View className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm mb-4">
                    <QRCode
                      value={`bingwa-expo-agrovet-${selectedScans.map(s => s.id).join('-')}`}
                      size={100}
                      color="#111B21"
                      backgroundColor="white"
                    />
                  </View>
                  <Text className="text-gray-400 font-poppins-regular text-[9px] text-center px-6">
                    Agrovet: Scan this code to view detailed image analysis and specific treatment chemicals.
                  </Text>
                </View>

                <View className="mt-8 items-center">
                  <Text className="text-gray-300 font-poppins-regular text-[8px] uppercase tracking-widest">
                    --- END OF PRESCRIPTION ---
                  </Text>
                </View>
              </View>
            </ViewShot>

            <View className="h-10" />
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 bg-gray-50 dark:bg-black/20 flex-row space-x-4">
            <TouchableOpacity 
              onPress={generatePDF}
              disabled={isGenerating}
              className="flex-1 h-14 bg-accent rounded-2xl flex-row items-center justify-center shadow-lg shadow-accent/20"
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="print" size={20} color="white" className="mr-2" />
                  <Text className="text-white font-poppins-bold text-sm">Print / Share PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
