import "@/global.css";
import { Icon } from "@/src/components/Icon";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { useRef } from "react";

import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useColorScheme } from "@/src/components/useColorScheme";
import m3 from "@/src/constants/m3";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import AddScreen from "./add";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const headerColor = colorScheme === "light" ? "#ffffff" : "#212121";
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: m3[colorScheme].onSurface,
          tabBarInactiveTintColor: m3[colorScheme].onSurfaceVariant,
          tabBarItemStyle: {
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            marginTop: 4,
            fontFamily: "GoogleSansFlexRound_700Bold",
            fontSize: 12,
          },
          tabBarStyle: {
            position: "absolute",
            bottom: 24,
            backgroundColor: m3[colorScheme].accentRoseSurface,
            borderRadius: 9999,
            marginHorizontal: 16,
            height: 72,
            paddingBottom: 0,
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
          },
          headerShown: useClientOnlyValue(false, true),
          headerStyle: {
            backgroundColor: headerColor,
          },
          headerLeft: () => (
            <Pressable
              onPress={() => console.log("Icon pressed!")}
              style={{ paddingLeft: 16 }}
            >
              <Icon name="app-logo" size={28} color={m3[colorScheme].primary} />
            </Pressable>
          ),
          headerRight: () => (
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
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "LocalHost",
            headerTitleStyle: {
              fontFamily: "GoogleSansFlexRound_600SemiBold",
              fontSize: 24,
            },
            tabBarLabel: "Home",

            headerStyle: {
              backgroundColor: "transparent",
            },
            headerTitleAlign: "left",
            headerTransparent: true,
            headerShadowVisible: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused
                    ? m3[colorScheme].primaryContainer
                    : "transparent",
                  paddingHorizontal: 20,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <Icon
                  name={focused ? "home-active" : "home-inactive"}
                  size={24}
                  color={focused ? m3[colorScheme].onPrimaryContainer : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarLabel: "Chat",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused
                    ? m3[colorScheme].primaryContainer
                    : "transparent",
                  paddingHorizontal: 20,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <Icon
                  name={focused ? "chat-active" : "chat-inactive"}
                  size={24}
                  color={focused ? m3[colorScheme].onPrimaryContainer : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarLabel: "",
            tabBarIcon: ({ color, focused }) => (
              <Pressable
                onPress={() => bottomSheetRef.current?.snapToIndex(0)}
                style={{
                  backgroundColor: m3[colorScheme].primary,
                  padding: 12,
                  borderRadius: 9999,
                  marginTop: -12,
                }}
              >
                <Icon
                  name={focused ? "cancel" : "plus"}
                  size={28}
                  color={m3[colorScheme].onPrimary}
                />
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="Models"
          options={{
            tabBarLabel: "Models",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused
                    ? m3[colorScheme].primaryContainer
                    : "transparent",
                  paddingHorizontal: 20,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <Icon
                  name="models-tab"
                  size={24}
                  color={focused ? m3[colorScheme].onPrimaryContainer : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="debug"
          options={{
            title: "Debug",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused
                    ? m3[colorScheme].primaryContainer
                    : "transparent",
                  paddingHorizontal: 20,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <Icon
                  name="models-tab"
                  size={24}
                  color={focused ? m3[colorScheme].onPrimaryContainer : color}
                />
              </View>
            ),
          }}
        />
      </Tabs>
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
