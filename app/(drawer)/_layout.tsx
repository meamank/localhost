import "@/global.css";
import { Icon } from "@/src/components/Icon";

import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useColorScheme } from "@/src/components/useColorScheme";
import Colors from "@/src/constants/Colors";
import iconColors from "@/src/constants/IconColors";

import { Drawer } from "expo-router/drawer";
import { Pressable } from "react-native";

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const headerColor = colorScheme === "light" ? "#ffffff" : "#212121";
  const isHeaderShown = useClientOnlyValue(false, true);

  return (
    <Drawer
      screenOptions={({ navigation }: any) => ({
        drawerActiveTintColor: Colors[colorScheme].tint,
        headerShown: isHeaderShown,
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
            onPress={() => navigation.toggleDrawer()}
            style={{ paddingLeft: 16 }}
          >
            <Icon
              name="menu"
              size={24}
              color={iconColors[colorScheme].primary}
            />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Chat",
          drawerIcon: ({ color }) => (
            <Icon name="chat-tab" size={28} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Models"
        options={{
          title: "Models",
          drawerIcon: ({ color }) => (
            <Icon name="models-tab" size={28} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="[id]"
        options={{
          title: "Model Configuration",
          drawerItemStyle: { display: "none" },
        }}
      /> */}
      <Drawer.Screen
        name="debug"
        options={{
          title: "SqlDB",
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}
