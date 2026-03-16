import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: "#5F8F63", // background color from theme
      tabBarInactiveTintColor: "#2F4F2F", // textSecondary color from theme
      tabBarStyle: {
        backgroundColor: "#EEF5EE", // muted color from theme
        borderTopWidth: 1,
        borderTopColor: "#7FAF86", // surface color from theme for border
      },
      headerShown: false,
    }}>
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


