import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Platform, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  const handleShare = async () => {
    if (!generatedUri) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(generatedUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Bingwa Agro-Report',
        });
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Sharing Error:', error);
      Alert.alert('Error', 'Failed to share the report.');
    }
  };

  const handlePrint = async () => {
    if (!generatedUri) return;
    try {
      await Print.printAsync({ uri: generatedUri });
    } catch (error) {
      console.error('Print Error:', error);
      Alert.alert('Error', 'Failed to open print dialog.');
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
              body { 
                font-family: 'Courier Prime', monospace; 
                padding: 40px 20px; 
                background-color: #fff;
                color: #000;
                line-height: 1.4;
              }
              .receipt { width: 100%; max-width: 800px; margin: 0 auto; }
              .center { text-align: center; }
              .header { margin-bottom: 30px; border-bottom: 2px dashed #000; padding-bottom: 20px; }
              .title { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px; }
              .sub-title { font-size: 12px; font-weight: 700; margin-top: 5px; text-transform: uppercase; }
              .date { font-size: 12px; margin-top: 10px; }
              
              .scan-item { margin-bottom: 40px; page-break-inside: avoid; border-bottom: 1px dashed #ccc; padding-bottom: 20px; }
              
              .main-row { margin-bottom: 15px; }
              .label { font-weight: 700; font-size: 12px; text-decoration: underline; display: block; margin-bottom: 3px; color: #000; }
              .content { font-size: 12px; display: block; color: #000; text-transform: uppercase; }
              
              .diagnosis-box { border: 2px solid #000; padding: 12px; margin-bottom: 15px; background-color: #f5f5f5; }
              .diagnosis-text { font-size: 16px; font-weight: 700; }
              .severity-text { font-size: 12px; font-weight: 700; display: block; margin-top: 3px; }

              .footer { margin-top: 60px; text-align: center; border-top: 2px dashed #000; padding-top: 30px; }
              .footer-title { font-size: 20px; font-weight: 700; margin: 0; }
              .legal { font-size: 9px; margin-top: 25px; text-align: center; opacity: 0.7; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="center header">
                <h1 class="title">BINGWA AGRO-REPORT</h1>
                <p class="sub-title">OFFICIAL AI DIAGNOSIS & PRESCRIPTION</p>
                <div class="date">${today}</div>
              </div>

              ${selectedScans.map((scan, i) => `
                <div class="scan-item">
                  <div class="diagnosis-box">
                    <div class="diagnosis-text">ITEM #${i+1}: ${String(scan.crop).toUpperCase()} / ${String(scan.result).toUpperCase()}</div>
                    <div class="severity-text">SEVERITY LEVEL: ${String(scan.severity).toUpperCase()}</div>
                    <div style="font-size: 10px; margin-top: 4px;">RECORDED ON: ${scan.date}</div>
                  </div>
                  
                  <div class="main-row">
                    <span class="label">ORGANIC REMEDY:</span>
                    <span class="content">${String(scan.organic_advice || 'NO SPECIFIC ORGANIC STEPS LISTED').toUpperCase()}</span>
                  </div>
                  
                  <div class="main-row">
                    <span class="label">CHEMICAL TREATMENT:</span>
                    <span class="content">${String(scan.chemical_advice || 'CONSULT AGROVET FOR CHEMICAL COMPATIBILITY').toUpperCase()}</span>
                  </div>
                  
                  <div class="main-row">
                    <span class="label">PREVENTION STEPS:</span>
                    <span class="content">${String(scan.prevention || 'MAINTAIN FIELD HYGIENE AND CROP ROTATION').toUpperCase()}</span>
                  </div>
                </div>
              `).join('')}

              <div class="footer">
                <p style="font-size: 12px;">TOTAL ITEMS PROCESSED: ${selectedScans.length}</p>
                <h2 class="footer-title">BINGWASHAMBANI AI</h2>
                <p style="font-size: 12px;">DIGITAL CROP PROTECTION SERVICES</p>
              </div>
              
              <div class="legal">
                IMPORTANT: THIS REPORT IS GENERATED BY ARTIFICIAL INTELLIGENCE. 
                PLEASE VERIFY WITH A CERTIFIED AGRONOMIST BEFORE APPLYING 
                INTENSIVE CHEMICAL TREATMENTS. ACCURACY MAY VARY BASED ON PHOTO QUALITY.
              </div>
            </div>
          </body>
        </html>
      `;

      if ((Platform.OS as string) !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      
      const { uri } = await Print.printToFileAsync({ html });
      setGeneratedUri(uri);
      
      if ((Platform.OS as string) !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
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
          {/* Top Drag Bar */}
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
                  Your official agro-report has been generated successfully.
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
                  <View style={styles.receiptContainer}>
                    <View style={styles.jaggedEdge} />
                    
                    <View style={styles.receiptContent}>
                      <View className="items-center mb-8">
                        <Text style={styles.receiptTitle}>BINGWA-IFY</Text>
                        <Text style={styles.receiptSubtitle}>OFFICIAL AGRO-PRESCRIPTION</Text>
                        <Text style={styles.receiptDate}>{today}</Text>
                      </View>

                      <View style={styles.receiptDivider} />

                      {selectedScans.map((scan, index) => (
                        <View key={index} className="mb-10">
                          <View style={styles.diagnosisBox}>
                            <Text style={styles.monospaceDiagnosis}>
                              {index + 1}. {scan.crop?.toUpperCase() || 'UNKNOWN'} / {scan.result?.toUpperCase() || 'UNKNOWN'}
                            </Text>
                            <Text style={styles.monospaceSeverity}>
                              SEVERITY: {scan.severity?.toUpperCase() || 'UNKNOWN'}
                            </Text>
                          </View>
                          
                          <Text style={styles.sectionHeader}>[ORGANIC REMEDY]</Text>
                          <Text style={styles.sectionBody}>{scan.organic_advice?.toUpperCase() || 'NO DATA'}</Text>
                          
                          <Text style={styles.sectionHeader}>[CHEMICAL TREATMENT]</Text>
                          <Text style={styles.sectionBody}>{scan.chemical_advice?.toUpperCase() || 'CONSULT AGROVET'}</Text>
                          
                          <Text style={styles.sectionHeader}>[PREVENTION]</Text>
                          <Text style={styles.sectionBody}>{scan.prevention?.toUpperCase() || 'FIELD HYGIENE'}</Text>

                          {index < selectedScans.length - 1 && (
                            <View style={[styles.receiptDivider, { borderStyle: 'dotted', opacity: 0.3, marginVertical: 30 }]} />
                          )}
                        </View>
                      ))}

                      <View style={styles.receiptDivider} />

                      <View className="mt-8 items-center">
                        <Text style={styles.monospaceFooter}>REPORT TOTAL: {selectedScans.length} SCANS</Text>
                        <Text style={[styles.monospaceFooter, { fontSize: 20, fontWeight: '700', marginTop: 10 }]}>
                          BINGWASHAMBANI
                        </Text>
                      </View>

                      <View className="mt-10 mb-4 opacity-40">
                        <Text style={styles.cardInfo}>SECURED BY: BINGWA AI VAULT</Text>
                        <Text style={styles.cardInfo}>OFFICIAL AI PRESCRIPTION SUMMARY</Text>
                      </View>
                    </View>

                    <View style={styles.jaggedEdgeBottom} />
                  </View>

                <TouchableOpacity 
                  onPress={generatePDF}
                  disabled={isGenerating}
                  className="mt-10 h-20 bg-accent rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-accent/40"
                >
                  {isGenerating ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" className="mr-3" />
                      <Text className="text-white font-poppins-bold uppercase tracking-widest">Generating PDF...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="receipt" size={28} color="white" className="mr-4" />
                      <View>
                        <Text className="text-white font-poppins-black text-sm uppercase tracking-widest leading-none">
                          Receipt-ify
                        </Text>
                        <Text className="text-white/70 font-poppins-bold text-[10px] uppercase mt-1">
                          Create Official Report
                        </Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={resetAndClose}
              className="mt-6 mb-12 items-center py-4"
            >
              <Text className="text-gray-400 font-poppins-bold text-sm uppercase tracking-widest">
                {generatedUri ? 'Done' : 'Close Vault'}
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
  receiptContainer: {
    backgroundColor: 'transparent',
  },
  receiptContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  jaggedEdge: {
    height: 15,
    backgroundColor: '#fff',
    width: '100%',
    borderTopWidth: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
  },
  jaggedEdgeBottom: {
    height: 15,
    backgroundColor: '#fff',
    width: '100%',
    transform: [{ rotate: '180deg' }],
    borderTopWidth: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
  },
  receiptTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -2,
  },
  receiptSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#000',
    marginTop: 5,
    fontWeight: '700',
    textAlign: 'center',
  },
  receiptDate: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#000',
    marginTop: 10,
  },
  receiptDivider: {
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#000',
    marginVertical: 20,
  },
  diagnosisBox: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  monospaceDiagnosis: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  monospaceSeverity: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  sectionHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  sectionBody: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#000',
    marginTop: 6,
    lineHeight: 16,
  },
  monospaceFooter: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
  cardInfo: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    color: '#000',
    marginBottom: 2,
    textAlign: 'center',
  },
});
