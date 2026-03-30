import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Platform, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

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
  const viewShotRef = useRef<any>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
              body { 
                font-family: 'Courier Prime', monospace; 
                padding: 50px; 
                background-color: #fff;
                color: #000;
                line-height: 1.5;
              }
              .receipt { width: 100%; max-width: 750px; margin: 0 auto; }
              .center { text-align: center; }
              .header { margin-bottom: 40px; border-bottom: 3px dashed #000; padding-bottom: 25px; }
              .title { font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 2px; }
              .sub-title { font-size: 14px; font-weight: 700; margin-top: 5px; text-transform: uppercase; }
              .date { font-size: 14px; margin-top: 15px; }
              
              .scan-item { margin-bottom: 50px; page-break-inside: avoid; border-bottom: 1px dashed #ccc; padding-bottom: 30px; }
              
              .main-row { margin-bottom: 20px; }
              .label { font-weight: 700; font-size: 14px; text-decoration: underline; display: block; margin-top: 15px; margin-bottom: 5px; color: #000; }
              .content { font-size: 14px; display: block; color: #000; text-transform: uppercase; }
              
              .diagnosis-box { border: 2px solid #000; padding: 15px; margin-bottom: 15px; background-color: #f9f9f9; }
              .diagnosis-text { font-size: 20px; font-weight: 700; }
              .severity-text { font-size: 14px; font-weight: 700; display: block; margin-top: 5px; }

              .footer { margin-top: 80px; text-align: center; border-top: 3px dashed #000; padding-top: 40px; }
              .footer-title { font-size: 24px; font-weight: 700; margin: 0; }
              .legal { font-size: 10px; margin-top: 30px; text-align: center; opacity: 0.8; font-style: italic; }
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
                    <div style="font-size: 11px; margin-top: 5px;">RECORDED ON: ${scan.date}</div>
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
                <p>TOTAL ITEMS PROCESSED: ${selectedScans.length}</p>
                <h2 class="footer-title">BINGWA SHAMBANI AI</h2>
                <p>DIGITAL CROP PROTECTION SERVICES</p>
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

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please check your data and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 100 }}
          className="bg-white w-full max-h-[95vh] rounded-t-[40px] overflow-hidden shadow-2xl"
        >
          {/* Top Drag Bar */}
          <View className="items-center py-4 bg-white">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </View>

          <ScrollView className="flex-1 px-6 pb-10" showsVerticalScrollIndicator={false}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
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
                          {index + 1}. {scan.crop.toUpperCase()} / {scan.result.toUpperCase()}
                        </Text>
                        <Text style={styles.monospaceSeverity}>
                          SEVERITY: {scan.severity.toUpperCase()}
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
                      BINGWA SHAMBANI
                    </Text>
                  </View>

                  <View className="mt-10 mb-4 opacity-40">
                    <Text style={styles.cardInfo}>SECURED BY: BINGWA AI VAULT</Text>
                    <Text style={styles.cardInfo}>OFFICIAL AI PRESCRIPTION SUMMARY</Text>
                  </View>
                </View>

                <View style={styles.jaggedEdgeBottom} />
              </View>
            </ViewShot>

            <TouchableOpacity 
              onPress={generatePDF}
              disabled={isGenerating}
              className="mt-10 h-20 bg-accent rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-accent/40"
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="receipt" size={28} color="white" className="mr-4" />
                  <View>
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-widest leading-none">
                      Receipt-ify
                    </Text>
                    <Text className="text-white/70 font-poppins-bold text-[10px] uppercase mt-1">
                      Download Full PDF Report
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onClose}
              className="mt-6 mb-12 items-center py-4"
            >
              <Text className="text-gray-400 font-poppins-bold text-sm uppercase tracking-widest">Close Vault</Text>
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
