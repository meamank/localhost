import "@/global.css";
import { Icon } from "@/src/components/Icon";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { useRef } from "react";

import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useColorScheme } from "@/src/components/useColorScheme";
import m3 from "@/src/constants/m3";
import { Drawer } from "expo-router/drawer";
import { Pressable, View } from "react-native";
import AddScreen from "./add";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const headerColor = colorScheme === "light" ? "#ffffff" : "#212121";
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: m3[colorScheme].onPrimaryContainer,
          drawerActiveBackgroundColor: m3[colorScheme].primaryContainer,
          drawerInactiveTintColor: m3[colorScheme].onSurfaceVariant,
          drawerLabelStyle: {
            fontFamily: "GoogleSansFlexRound_600SemiBold",
            fontSize: 14,
          },
          drawerStyle: {
            backgroundColor: m3[colorScheme].surface,
            width: 280,
          },
          headerShown: useClientOnlyValue(false, true),
          headerStyle: {
            backgroundColor: headerColor,
          },
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => bottomSheetRef.current?.snapToIndex(0)}
                style={{ paddingRight: 16 }}
              >
                <Icon name="plus" size={28} color={m3[colorScheme].primary} />
              </Pressable>
              <Pressable
                onPress={() => console.log("Icon pressed!")}
                style={{ paddingRight: 16 }}
              >
                <Icon
                  name="notifications-outline"
                  size={28}
                  color={m3[colorScheme].onSurface}
                />
              </Pressable>
            </View>
          ),
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "LocalHost",
            headerTitleStyle: {
              fontFamily: "GoogleSansFlexRound_600SemiBold",
              fontSize: 24,
            },
            drawerLabel: "Home",
            headerStyle: {
              backgroundColor: "transparent",
            },
            headerTitleAlign: "left",
            headerTransparent: true,
            headerShadowVisible: false,
            drawerIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "home-active" : "home-inactive"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: "Chat",
            drawerIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "chat-active" : "chat-inactive"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="add"
          options={{
            drawerItemStyle: { display: "none" }, // Hide add screen from drawer, accessible via header + button
          }}
        />
        <Drawer.Screen
          name="Models"
          options={{
            drawerLabel: "Models",
            drawerIcon: ({ color, focused }) => (
              <Icon name="models-tab" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="debug"
          options={{
            title: "Debug",
            drawerIcon: ({ color, focused }) => (
              <Icon
                name="models-tab" // Using the same icon as before
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Drawer>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose={true}
        enableDynamicSizing={true}
        backgroundStyle={{ backgroundColor: m3[colorScheme].surface }}
        handleIndicatorStyle={{
          backgroundColor: m3[colorScheme].onSurfaceVariant,
        }}
      >
        <BottomSheetView style={{ flex: 1, width: "100%" }}>
          <AddScreen onClose={() => bottomSheetRef.current?.close()} />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
