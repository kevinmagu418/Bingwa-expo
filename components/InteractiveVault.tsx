import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withRepeat, 
    withSequence, 
    withTiming, 
    interpolate, 
    Easing 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Scan } from '../hooks/useScans';

interface VaultCardProps {
  scan: Scan;
  index: number;
  total: number;
  isExpanded: boolean;
  isAutoSelected: boolean;
  isElevated: boolean;
  onPress: () => void;
  expandedShift: number;
}

const GOLD = "#D4AF37";
const DARK_SURFACE = "#1A1A1A";

const VaultCard = ({ scan, index, total, isExpanded, isAutoSelected, isElevated, onPress, expandedShift }: VaultCardProps) => {
  const cardWidth = 220;
  const cardHeight = 300;

  // Map severity to Poker Ranks
  const getRank = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'A';
      case 'medium': return 'K';
      case 'low': return 'Q';
      default: return 'J';
    }
  };

  const getSuitIcon = (idx: number) => {
    const suits = ['leaf', 'sunny', 'water', 'earth'];
    return suits[idx % suits.length];
  };

  const animatedStyle = useAnimatedStyle(() => {
    // True Centering: Position elements absolutely at 50% 50% (conceptually),
    // then use translateX/Y to move them relative to their own center.
    // Since they are inside a flex items-center justify-center container,
    // (0, 0) is already the center of the vault.
    
    // We just need to offset by half the card dimensions to align the CARD'S center with the CONTAINER'S center.
    const centerX = -cardWidth / 2;
    const centerY = -cardHeight / 2;

    // --- Spatial Composition Logic ---
    
    // Closed State: A clustered "Memory Stack" centered in the vault
    const stackRotate = (index - (total / 2)) * 3;
    const stackOffsetX = (index - (total / 2)) * 4; // Centered stagger
    const stackOffsetY = index * 2; // Subtle vertical depth

    // Expanded State: The Poker Card Fan
    let translateX = isExpanded 
        ? centerX + expandedShift
        : centerX + stackOffsetX;

    let translateY = isExpanded
        ? centerY
        : centerY + stackOffsetY + 20; // Slightly lower when closed to feel "stored"

    let rotate = isExpanded
        ? interpolate(index, [0, total - 1], [-8, 18]) 
        : stackRotate;

    let scale = isExpanded ? 1 : 0.96 - (index * 0.03);
    let opacity = isExpanded ? 1 : interpolate(index, [0, 2, 4], [1, 0.8, 0.4]);
    let zIndex = total - index;

    // --- Dynamic Interaction Overrides ---
    if (!isExpanded && isAutoSelected) {
        translateY -= 60;
        scale = 1.08;
        zIndex = 1000;
        opacity = 1;
        rotate = 0;
    }

    if (isElevated) {
        translateX = centerX;
        translateY = centerY - 100;
        scale = 1.25;
        zIndex = 2000;
        rotate = 0;
    }

    const config = { damping: 15, stiffness: 100 };

    return {
      transform: [
        { translateX: withSpring(translateX, config) },
        { translateY: withSpring(translateY, config) },
        { rotate: withSpring(`${rotate}deg`, config) },
        { scale: withSpring(scale, config) }
      ],
      zIndex,
      position: 'absolute',
      top: '50%',
      left: '50%',
      opacity: withTiming(opacity, { duration: 400 })
    };
  });

  const rank = getRank(scan.severity);
  const suitIcon = getSuitIcon(index);

  return (
    <Animated.View style={[animatedStyle, { width: cardWidth, height: cardHeight }]}>
      <Pressable 
        onPress={onPress}
        className="flex-1 bg-[#121212] rounded-[44px] p-1 shadow-[0_30px_60px_rgba(0,0,0,0.9)] border-2 border-amber-500/15 overflow-hidden"
      >
        <LinearGradient 
            colors={['rgba(212, 175, 55, 0.18)', 'transparent']}
            className="absolute inset-0"
        />
        
        <View className="flex-1 bg-[#1A1A1A] rounded-[38px] overflow-hidden p-5 border border-white/5">
            {/* Poker Card Elements */}
            <View className="absolute top-6 left-6 items-center opacity-90">
                <Text className="text-amber-500 font-poppins-black text-2xl leading-5">{rank}</Text>
                <Ionicons name={suitIcon as any} size={16} color={GOLD} />
            </View>

            <View className="absolute bottom-6 right-6 items-center rotate-180 opacity-90">
                <Text className="text-amber-500 font-poppins-black text-2xl leading-5">{rank}</Text>
                <Ionicons name={suitIcon as any} size={16} color={GOLD} />
            </View>

            <Image 
                source={{ uri: scan.image_url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600&auto=format&fit=crop' }} 
                style={{ width: '100%', height: 128, borderRadius: 32, marginTop: 40, marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' }} 
                contentFit="cover" 
                cachePolicy="disk"
                transition={300}
            />
            
            <View className="px-2 items-center">
                <Text className="text-white font-poppins-black text-base uppercase tracking-tight text-center" numberOfLines={1}>
                    {scan.diseases?.crop}
                </Text>
                <Text className="text-amber-500/30 text-[7px] font-poppins-bold uppercase tracking-[5px] mb-5">
                    {scan.diseases?.name}
                </Text>
                
                <View className="flex-row items-center bg-white/5 px-5 py-2 rounded-2xl border border-white/10">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    <Text className="text-white/40 font-poppins-bold text-[9px] uppercase tracking-widest">{scan.severity}</Text>
                </View>
            </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const InteractiveVault = ({ scans, onSelect }: { scans: Scan[], onSelect: (scan: Scan) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoIndex, setAutoIndex] = useState(0);
  const [elevatedIndex, setElevatedIndex] = useState<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: windowWidth } = useWindowDimensions();

  // Responsive calculations
  const vaultPadding = 32; // Reduced padding for smaller screens
  const availableWidth = windowWidth - (vaultPadding * 2);
  const cardWidth = 220;
  const cardCount = Math.min(scans.length, 5);

  // Dynamically calculate fanSpread to fit available width
  // (cardCount - 1) * fanSpread + cardWidth <= availableWidth
  const maxFanSpread = 120; // Maximum spread we'd like
  const fanSpread = cardCount > 1 
    ? Math.min(maxFanSpread, (availableWidth - cardWidth) / (cardCount - 1))
    : 0;

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setElevatedIndex(null);

    if (isExpanded) {
        idleTimer.current = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * cardCount);
            setElevatedIndex(randomIndex);
        }, 5000);
    }
  }, [isExpanded, cardCount]);

  useEffect(() => {
    if (!isExpanded) {
        const interval = setInterval(() => {
            setAutoIndex((prev) => (prev + 1) % cardCount);
        }, 3000);
        return () => clearInterval(interval);
    } else {
        resetIdleTimer();
    }
    return () => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isExpanded, cardCount, resetIdleTimer]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setElevatedIndex(null);
  };

  return (
    <View className="h-[480px] items-center justify-center w-full bg-[#0A0A0A] rounded-[48px] border border-amber-500/20 shadow-2xl overflow-hidden">
      <LinearGradient 
        colors={['rgba(212, 175, 55, 0.05)', 'transparent']}
        className="absolute inset-0"
      />
      
      {/* Dynamic Background Pattern */}
      <View className="absolute inset-0 opacity-5 flex-row flex-wrap justify-around p-10">
          {Array(12).fill(0).map((_, i) => (
              <Ionicons key={i} name="finger-print" size={60} color={GOLD} />
          ))}
      </View>

      <TouchableOpacity 
        onPress={toggleExpand} 
        activeOpacity={1}
        className="relative items-center justify-center w-full h-full"
      >
        <View className="items-center justify-center w-full h-full">
            {scans.slice(0, 5).map((scan, i) => {
                // Responsive shifting math
                const totalWidth = (cardCount - 1) * fanSpread;
                
                // Center the deck horizontally within the available space
                const expandedShift = (i * fanSpread) - (totalWidth / 2);

                return (
                    <VaultCard 
                        key={scan.id} 
                        scan={scan} 
                        index={i} 
                        total={cardCount} 
                        isExpanded={isExpanded}
                        isAutoSelected={!isExpanded && i === autoIndex}
                        isElevated={elevatedIndex === i}
                        onPress={() => {
                            resetIdleTimer();
                            onSelect(scan);
                        }}
                        expandedShift={expandedShift}
                    />
                );
            })}
        </View>

        {/* Interaction Prompt */}
        <Animated.View className="absolute bottom-10 flex-row items-center bg-black/60 px-6 py-3 rounded-full border border-amber-500/30">
            <Ionicons name={isExpanded ? "close-circle" : "lock-open"} size={16} color={GOLD} />
            <Text className="ml-3 text-amber-500 font-poppins-bold text-[10px] uppercase tracking-[3px]">
                {isExpanded ? "Seal Vault" : "Unlock Archive"}
            </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
