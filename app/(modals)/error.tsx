import React from 'react';
import { View, Text } from 'react-native';

export default function ErrorModal() {
  return (
    <View className="flex-1 items-center justify-center bg-muted">
      <Text className="text-textPrimary font-bold text-xl">Error Modal</Text>
      <Text className="text-textSecondary">Something went wrong</Text>
    </View>
  );
}



