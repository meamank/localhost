import { Text, View } from "react-native";

export default function Empty({ title }: { title: string }) {
  return (
    <View className="flex w-full justify-center items-center">
      <Text className="text-secondary font-sans font-bold tracking-widest">
        No {title} available!
      </Text>
    </View>
  );
}
