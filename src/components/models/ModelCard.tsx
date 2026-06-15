import iconColors from "@/src/constants/IconColors";
import { ModelMeta, ModelStatus } from "@/src/types";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Icon } from "../Icon";
interface ModelCardProps {
  model: ModelMeta;
  modelStatus: ModelStatus;
  isActive: boolean;
  progress: number;
  error: string | null;
  onDownload: () => void;
  onInit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onResume: () => void;
  onPause: () => void;
}

export default function ModelCard({
  model,
  modelStatus,
  isActive,
  progress,
  error,
  onDownload,
  onInit,
  onCancel,
  onDelete,
  onPause,
  onResume,
}: ModelCardProps) {
  const progressPercent = Math.round(progress * 100);

  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";

  return (
    <View className="bg-background-secondary rounded-2xl p-4 mb-4 border border-border gap-2">
      {/* Header row */}
      <View className="flex gap-1">
        <View className="flex-row items-center gap-1.5 bg-background-tertiary self-start px-2 py-0.5 rounded-full border border-border">
          <Image
            source={{ uri: model.logo_url }}
            height={16}
            width={16}
            style={{ borderRadius: 100 }}
          />
          <Text className="text-foreground-secondary font-medium text-xs">
            {model.org}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-base text-foreground-primary font-bold">
            {model.name}
          </Text>
          {modelStatus === "initializing" && (
            <View className="flex-row items-center gap-1.5 rounded-full bg-primary/20 px-2 py-1">
              <ActivityIndicator size="small" color="#0285ff" />
              <Text className="text-xs text-primary">Initializing...</Text>
            </View>
          )}
          {modelStatus === "ready" && isActive && (
            <View className="rounded-full bg-success px-1.5 py-1">
              <Text className="text-xs font-medium text-white">Active</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      <Text
        className="text-sm text-foreground-secondary font-medium"
        numberOfLines={1}
      >
        {model.description}
      </Text>

      {/* Specs */}
      {/* <View className="flex-row justify-between">
        <Text className="text-sm text-foreground-tertiary">
          RAM Required: {model.ramRequiredGB} GB
        </Text>
        <Text className="text-sm text-foreground-tertiary">
          Model Size: {model.size} GB
        </Text>
      </View> */}

      {/* Progress bar */}
      {(modelStatus === "downloading" || modelStatus === "paused") && (
        <View className="gap-2">
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-background-tertiary">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-foreground-tertiary">
              {progressPercent}%
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-between items-center pt-2 border-t border-border">
        {/* BOTTOM_LEFT slot */}
        {modelStatus === "not downloaded" && (
          <Pressable
            className="flex-row rounded-md bg-foreground-primary px-2 py-1 items-center gap-2"
            onPress={onDownload}
          >
            <Icon
              name="download"
              size={24}
              color={iconColors[colorScheme].background}
            />
            <Text className="text-background-primary">Download</Text>
          </Pressable>
        )}

        {modelStatus === "downloading" && (
          <Pressable
            onPress={onPause}
            className="rounded-lg bg-background-tertiary px-3 py-1.5 active:opacity-60"
          >
            <Text className="text-xs font-medium text-foreground-secondary">
              Pause
            </Text>
          </Pressable>
        )}

        {modelStatus === "paused" && (
          <Pressable
            onPress={onResume}
            className="rounded-lg bg-background-tertiary px-3 py-1.5 active:opacity-60"
          >
            <Text className="text-xs font-medium text-foreground-secondary">
              Resume
            </Text>
          </Pressable>
        )}

        {modelStatus === "downloaded" && (
          <Pressable
            onPress={onInit}
            className="flex-row rounded-md bg-primary px-2 py-1 items-center gap-2"
          >
            <Icon name="process" size={24} color="#fff" />
            <Text className="text-sm font-medium text-foreground-primary">
              Initialize
            </Text>
          </Pressable>
        )}

        {modelStatus === "ready" && (
          <Text className="text-sm text-success">Model Ready</Text>
        )}

        {/* BOTTOM_RIGHT slot */}
        {(modelStatus === "downloading" || modelStatus === "paused") && (
          <Pressable
            onPress={onCancel}
            className="rounded-lg bg-background-tertiary px-3 py-1.5 active:opacity-60"
          >
            <Text className="text-xs font-medium text-foreground-secondary">
              Cancel
            </Text>
          </Pressable>
        )}

        {(modelStatus === "downloaded" || modelStatus === "ready") && (
          <Pressable onPress={onDelete}>
            <Icon
              name="delete"
              size={24}
              color={iconColors[colorScheme].danger}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
