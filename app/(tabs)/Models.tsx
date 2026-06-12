import { Icon } from "@/src/components/Icon";
import ModelCard from "@/src/components/models/ModelCard";
import { useColorScheme } from "@/src/components/useColorScheme";
import iconColors from "@/src/constants/IconColors";
import { AVAILABLE_MODELS } from "@/src/constants/models";
import { useModel } from "@/src/context/ModelContext";
import { useModelDownload } from "@/src/hooks/useModelDownload";
import { useModelInit } from "@/src/hooks/useModelInit";
import { Stack } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function Models() {
  const { localModels, activeModelId, deviceInfo, removeLocalModel } =
    useModel();
  const { downloadModel, cancelDownload, resumeDownloading, pauseDownloading } =
    useModelDownload();
  const { initModel } = useModelInit();

  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 bg-background-primary p-4">
      <Stack.Screen
        options={{
          title: "Available Models",
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
      <View className="bg-background-secondary rounded-sm p-2 gap-2">
        <Text className="text-foreground-primary text-base font-bold">
          Device Details:
        </Text>
        <Text className="text-foreground-secondary">
          RAM:{deviceInfo?.totalRam?.toFixed(2) ?? 0} GB · Disk Available:{" "}
          {deviceInfo?.freeStorage?.toFixed(2) ?? 0} GB
        </Text>
      </View>

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

          const status = localState?.status || "not downloaded";

          return (
            <ModelCard
              model={catalogModel}
              modelStatus={status}
              isActive={activeModelId === catalogModel.id}
              progress={localState?.downloadProgress || 0}
              error={null}
              onDownload={() => downloadModel(catalogModel)}
              onInit={() => localState && initModel(localState)}
              onCancel={() => cancelDownload(catalogModel)}
              onPause={() => pauseDownloading(catalogModel)}
              onResume={() => resumeDownloading(catalogModel)}
              onDelete={() => removeLocalModel(catalogModel.id)}
            />
          );
        }}
      />
    </View>
  );
}
