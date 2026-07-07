import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import iconColors from "@/src/constants/IconColors";
import m3 from "@/src/constants/m3";
import { Attachment, useAttachment } from "@/src/hooks/useAttachment";
import { useLlamaStore } from "@/src/store/llamaStore";

import { useModelStore } from "@/src/store/modelStore";

import { Tabs } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function Models() {
  const [isLoading, setIsLoading] = useState(false);
  const localModels = useModelStore((state) => state.localModels);
  const activeModelId = useModelStore((state) => state.activeModelId);
  const addLocalModel = useModelStore((state) => state.addLocalModel);
  const setActiveModelId = useModelStore((state) => state.setActiveModelId);

  const colorScheme = useColorScheme();
  const theme = m3[colorScheme];
  const { pickAttachment, removeAttachment, attachment } = useAttachment();

  const initModel = useLlamaStore((state) => state.initModel);
  const isModelReady = useLlamaStore((state) => state.isModelReady);
  const isInitializing = useLlamaStore((state) => state.isModelLoading);

  const handleSelectModel = async () => {
    try {
      setIsLoading(true);
      const pickedDoc = await pickAttachment();

      if (pickedDoc?.status === "ready") {
        await addLocalModel(pickedDoc);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitModel = async (modelId: string, modelUri: string) => {
    setActiveModelId(modelId);
    await initModel(modelUri);
  };

  console.log("Model ready?", isModelReady);
  console.log("model id?", activeModelId);

  return (
    <View className="flex-1 bg-background-primary p-4">
      <Tabs.Screen
        options={{
          title: "Available Models",
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "GoogleSansFlexRound_700Bold",
                fontSize: 20,
                color: m3[colorScheme].onSurface,
              }}
            >
              Available Models
            </Text>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => console.log("Icon pressed!")}
              style={{ paddingRight: 16 }}
            >
              <Icon
                name="settings"
                size={24}
                color={iconColors[colorScheme].primary}
              />
            </Pressable>
          ),
        }}
      />
      {/* <View className="bg-background-secondary rounded-sm p-2 gap-2">
        <Text className="text-foreground-primary text-base font-bold">
          Device Details:
        </Text>
        <Text className="text-foreground-secondary">
          RAM:{deviceInfo?.totalRam?.toFixed(2) ?? 0} GB · Disk Available:{" "}
          {deviceInfo?.freeStorage?.toFixed(2) ?? 0} GB
        </Text>
      </View> */}

      {/* Model Cards */}

      <Pressable
        onPress={() => handleSelectModel()}
        className="py-4 rounded-2xl items-center justify-center flex-row active:opacity-80"
        style={{ backgroundColor: theme.primary }}
      >
        <Icon name="pdf" size={20} color={theme.onPrimary} />
        <Text
          className="text-label-lg font-bold ml-2"
          style={{ color: theme.onPrimary }}
        >
          Select Custom Model
        </Text>
      </Pressable>
      {localModels &&
        localModels.map((model) => {
          return (
            <View
              className="bg-accent-blue-container px-4 py-2 w-full rounded-sm mt-6 gap-4"
              key={model.id}
            >
              <Text>{model.name}</Text>

              {isModelReady && activeModelId === model.id ? (
                <Text className="text-success text-body-md">Model Ready</Text>
              ) : (
                <Pressable
                  onPress={() => handleInitModel(model.id, model.uri)}
                  className="bg-accent-blue-bold px-2 py-1 w-1/2 rounded-2xl"
                >
                  {isInitializing && activeModelId === model.id ? (
                    <View className="flex-1 items-center justify-center gap-3 px-8 bg-background-primary">
                      <ActivityIndicator size="small" color="#000" />
                      <Text className="text-sm text-black/50">
                        Initializing...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-accent-blue text-center"> Init</Text>
                  )}
                </Pressable>
              )}
            </View>
          );
        })}
    </View>
  );
}
