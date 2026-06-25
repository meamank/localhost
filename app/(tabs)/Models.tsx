import { Icon } from "@/src/components/Icon";
import ModelCard from "@/src/components/models/ModelCard";
import { useColorScheme } from "@/src/components/useColorScheme";
import iconColors from "@/src/constants/IconColors";
import m3 from "@/src/constants/m3";
import { AVAILABLE_MODELS } from "@/src/constants/models";
import { useModelDownload } from "@/src/hooks/useModelDownload";
import { useModelSelection } from "@/src/hooks/useModelSelection";
import { useModelStore } from "@/src/store/modelStore";

import { Tabs } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function Models() {
  const {
    downloadModel,
    cancelDownloading,
    resumeDownloading,
    pauseDownloading,
    deleteDownloaded,
  } = useModelDownload();
  const { selectModel } = useModelSelection();

  const localModels = useModelStore((state) => state.localModels);
  const modelStates = useModelStore((state) => state.modelStates);
  const activeModelId = useModelStore((state) => state.activeModelId);
  const isModelReady = useModelStore((state) => state.isModelready);
  const modelSizes = useModelStore((state) => state.modelSizes);

  const colorScheme = useColorScheme();
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

      <FlatList
        data={AVAILABLE_MODELS}
        keyExtractor={(item) => item.id}
        className="mt-4"
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: catalogModel }) => {
          const localState = localModels.find(
            (model) => model.id === catalogModel.id,
          );

          const ephemeralState = modelStates[catalogModel.id];

          let status =
            ephemeralState?.status || localState?.status || "not downloaded";
          if (activeModelId === catalogModel.id) {
            status = isModelReady ? "ready" : "initializing";
          }

          let progress =
            ephemeralState?.progress ?? localState?.downloadProgress ?? 0;

          return (
            <ModelCard
              model={catalogModel}
              dynamicSize={modelSizes[catalogModel.id]}
              modelStatus={status as any}
              isActive={activeModelId === catalogModel.id}
              progress={progress}
              error={null}
              onDownload={() => downloadModel(catalogModel)}
              onInit={() => {
                const latestLocalState = useModelStore
                  .getState()
                  .localModels.find((m) => m.id === catalogModel.id);
                if (latestLocalState) selectModel(latestLocalState);
              }}
              onCancel={() => cancelDownloading(catalogModel)}
              onPause={() => pauseDownloading(catalogModel)}
              onResume={() => resumeDownloading(catalogModel)}
              onDelete={() => deleteDownloaded(catalogModel)}
            />
          );
        }}
      />
    </View>
  );
}
