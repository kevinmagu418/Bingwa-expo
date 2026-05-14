import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { isDark } = useTheme();

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
          height: 65,
          elevation: 10,
          zIndex: 1000,
        },
        headerShown: false,
        tabBarHideOnKeyboard: false,
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


