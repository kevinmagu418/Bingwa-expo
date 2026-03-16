import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StyleSheet, Dimensions } from 'react-native';
import { CameraView, CameraType, FlashMode } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const CAM_WIDTH = width;
const CAM_HEIGHT = width * (16 / 9); // standard aspect ratio

import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleFlash = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const toggleCameraFacing = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false, 
        });
        
        if (photo) {
           router.push({
            pathname: "/(scan)/preview",
            params: { imageUri: photo.uri }
          });
        }
      } catch (error) {
        console.error("Capture failed:", error);
        Alert.alert("Camera Error", "Failed to capture image. Please try again.");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your gallery to pick an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        router.push({
            pathname: "/(scan)/preview",
            params: { imageUri: result.assets[0].uri }
        });
      }
    } catch (e) {
      console.log("Gallery Error: ", e);
      Alert.alert("Gallery Error", "Failed to open image gallery.");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mode="picture"
      >
         <SafeAreaView className="flex-1 justify-between">
           {/* Top Controls */}
           <View className="flex-row justify-between items-center px-6 pt-4">
             <TouchableOpacity 
               onPress={() => router.back()}
               className="w-10 h-10 rounded-full bg-black/40 items-center justify-center backdrop-blur-md"
             >
               <Ionicons name="close" size={24} color="white" />
             </TouchableOpacity>

             <TouchableOpacity 
               onPress={toggleFlash}
               className="w-10 h-10 rounded-full bg-black/40 items-center justify-center backdrop-blur-md"
             >
               <Ionicons 
                 name={flash === 'on' ? "flash" : "flash-off"} 
                 size={24} 
                 color={flash === 'on' ? "#F4A261" : "white"} 
               />
             </TouchableOpacity>
           </View>

           {/* Guidelines Overlay */}
           <View className="flex-1 items-center justify-center pointer-events-none">
             <View className="w-64 h-64 border-2 border-white/50 rounded-3xl border-dashed" />
             <Text className="text-white/80 font-poppins-regular text-xs mt-4 text-center bg-black/40 px-3 py-1 rounded-full overflow-hidden">
               Position leaf within the frame
             </Text>
           </View>

           {/* Bottom Controls */}
           <View className="flex-row justify-around items-center pb-12 px-10">
              {/* Gallery */}
              <TouchableOpacity onPress={pickImage} className="w-12 h-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
                 <Ionicons name="images" size={24} color="white" />
              </TouchableOpacity>

              {/* Shutter */}
              <TouchableOpacity onPress={handleCapture}>
                <MotiView 
                  className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
                  animate={{ scale: isCapturing ? 0.9 : 1 }}
                >
                  <View className="w-16 h-16 bg-white rounded-full" />
                </MotiView>
              </TouchableOpacity>

              {/* Flip */}
              <TouchableOpacity onPress={toggleCameraFacing} className="w-12 h-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
                 <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
           </View>
         </SafeAreaView>
      </CameraView>
    </View>
  );
}
