import iconColors from "@/src/constants/IconColors";
import { Attachment } from "@/src/hooks/useAttachment";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { Icon } from "../Icon";

interface Props {
  attachment: Attachment;
  onRemove: () => void;
}

export default function AttachmentThumbnail({ attachment, onRemove }: Props) {
  const renderContent = () => {
    if (attachment.status !== "ready") {
      return (
        <View className="w-18 h-18 rounded-lg bg-background-tertiary justify-center items-center">
          <ActivityIndicator className="text-foreground-primary" />
        </View>
      );
    }

    if (attachment.type === "image") {
      return (
        <Image
          source={{ uri: attachment.uri }}
          className="w-16 h-16 rounded-lg"
        />
      );
    }
  };

  console.log("in Thumbnail", attachment);

  return (
    <View className="relative">
      {renderContent()}
      <TouchableOpacity
        onPress={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-[10px] bg-background-tertiary justify-center items-center"
      >
        <Icon name="cancel" size={8} color={iconColors.dark.danger} />
      </TouchableOpacity>
    </View>
  );
}
