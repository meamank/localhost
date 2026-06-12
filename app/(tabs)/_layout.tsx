import "@/global.css";
import { Icon } from "@/src/components/Icon";

import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useColorScheme } from "@/src/components/useColorScheme";
import Colors from "@/src/constants/Colors";
import iconColors from "@/src/constants/IconColors";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const headerColor = colorScheme === "light" ? "#ffffff" : "#212121";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
        headerLeft: () => (
          <Pressable
            onPress={() => console.log("Icon pressed!")}
            style={{ paddingLeft: 16 }}
          >
            <Icon
              name="menu"
              size={24}
              color={iconColors[colorScheme].primary}
            />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color }) => (
            <Icon name="chat-tab" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Models"
        options={{
          title: "Models",
          tabBarIcon: ({ color }) => (
            <Icon name="models-tab" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
