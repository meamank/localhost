import { Pressable, Text, View } from "react-native";
import { Icon } from "../Icon";

interface AttachmentTypeProps {
  iconName: string;
  title: string;
  onPress: () => void;
}

export default function AttachmentType({
  iconName,
  title,
  onPress,
}: AttachmentTypeProps) {
  return (
    <Pressable onPress={onPress} className="flex-row gap-4 items-center">
      <View className="bg-primary-container p-2 rounded-sm">
        <Icon name={iconName as any} size={18} />
      </View>
      <Text className="text-label-md">{title}</Text>
    </Pressable>
  );
}
