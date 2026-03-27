import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { CameraView, CameraType, FlashMode } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const CROPS = [
  "Apple", "Bean", "Bellpepper", "Cassava", "Cherry", 
  "Grape", "Maize", "Peach", "Potato", "Strawberry", "Tomato"
];

import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("Maize");

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
            params: { imageUri: photo.uri, cropType: selectedCrop }
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
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        router.push({
            pathname: "/(scan)/preview",
            params: { imageUri: result.assets[0].uri, cropType: selectedCrop }
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
      />
      
      <SafeAreaView className="flex-1 justify-between">
        {/* Header Controls */}
        <View className="flex-row justify-between items-center px-6 pt-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-black/20 items-center justify-center backdrop-blur-md"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row space-x-4">
            <TouchableOpacity 
              onPress={() => Alert.alert("Scanning Tips", "1. Ensure good natural lighting\n2. Hold camera 10-15cm from leaf\n3. Center the spot in the frame")}
              className="w-10 h-10 rounded-2xl bg-accent items-center justify-center backdrop-blur-md"
            >
              <Ionicons name="help-circle" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleFlash}
              className="w-10 h-10 rounded-2xl bg-black/20 items-center justify-center backdrop-blur-md"
            >
              <Ionicons 
                name={flash === 'on' ? "flash" : "flash-off"} 
                size={24} 
                color={flash === 'on' ? "#F4A261" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Advanced Scanning Frame */}
        <View className="flex-1 items-center justify-center">
            <MotiView
              from={{ opacity: 0.3, scale: 0.9 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ loop: true, type: 'timing', duration: 2000 }}
              className="w-72 h-72 rounded-[48px] items-center justify-center border-2 border-white/20"
            >
                {/* Corner Accents */}
                <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-[32px]" />
                <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-accent rounded-tr-[32px]" />
                <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-accent rounded-bl-[32px]" />
                <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-[32px]" />

                {/* Scanning Line Animation */}
                <MotiView 
                    from={{ translateY: -100, opacity: 0 }}
                    animate={{ translateY: 100, opacity: 1 }}
                    transition={{ loop: true, duration: 1500, type: 'timing' }}
                    className="w-64 h-1 bg-accent/50 shadow-lg shadow-accent"
                />
            </MotiView>

            <MotiView 
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl mt-12 border border-white/10"
            >
                <Text className="text-white font-poppins-bold text-[10px] uppercase tracking-[3px] text-center">
                    Center leaf for AI analysis
                </Text>
            </MotiView>
        </View>

        {/* Bottom Section */}
        <View className="pb-8">
           {/* Crop Selector */}
           <View className="mb-6">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                className="flex-row"
              >
                {CROPS.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCrop(crop);
                    }}
                    className={`mr-3 px-5 py-2.5 rounded-full border ${selectedCrop === crop ? 'bg-accent border-accent' : 'bg-black/40 border-white/20'}`}
                  >
                    <Text className={`text-xs font-poppins-bold ${selectedCrop === crop ? 'text-white' : 'text-white/60'}`}>
                      {crop}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
           </View>

           {/* Controls */}
           <View className="flex-row justify-around items-center px-10">
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
        </View>
      </SafeAreaView>
    </View>
  );
}

