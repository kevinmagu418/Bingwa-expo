import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs 
      initialRouteName="scan"
      screenOptions={{
        tabBarActiveTintColor: "#25D366",
        tabBarInactiveTintColor: isDark ? "#8696A0" : "#54656F",
        tabBarStyle: {
          backgroundColor: isDark ? "#0B141A" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          // Adjust height and padding for safe area insets
          // On Android edge-to-edge, insets.bottom is the navigation bar height
          // Using a slightly larger base height (72 instead of 64) for better touch targets
          height: Platform.OS === 'ios' ? 88 : 72 + (insets.bottom > 0 ? insets.bottom : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          paddingTop: 12,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 10,
        }
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{ 
          title: "Scan",
          tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{ 
          title: "History",
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{ 
          title: "Learn",
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}


