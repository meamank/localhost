import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import Toast, { ToastConfig } from "react-native-toast-message";
import m3 from "../constants/m3";
import { Icon } from "./Icon";
import { useColorScheme } from "./useColorScheme";

export default function AppToast() {
  const colorScheme = useColorScheme();

  const config: ToastConfig = {
    custom: ({ text1, text2, props, onPress }) => {
      const type = props?.type || "success";

      // Default to success styling
      let borderColor = "border-success";
      let gradientColors = ["#a4f5cc", "#FFFFFF"];
      let iconBg = "bg-success";
      let iconName = "tick";
      let iconColor = m3[colorScheme].onPrimary;

      if (type === "error") {
        borderColor = "border-danger";
        gradientColors = ["#fca5a5", "#FFFFFF"];
        iconBg = "bg-danger";
        iconName = "close";
        iconColor = m3[colorScheme].onPrimary;
      } else if (type === "info") {
        borderColor = "border-info";
        gradientColors = ["#a5d8fc", "#FFFFFF"];
        iconBg = "bg-info";
        iconName = "info";
        iconColor = m3[colorScheme].onPrimary;
      }

      return (
        <Pressable onPress={onPress} className="w-full items-center">
          <LinearGradient
            className={`flex-row w-4/5 p-2 gap-3 border ${borderColor} rounded-full`}
            style={{ borderRadius: 100 }}
            colors={gradientColors as [string, string]}
            start={{ x: -0.2, y: 0 }}
            end={{ x: 0.3, y: 0 }}
          >
            <View className={`${iconBg} self-center rounded-full p-1`}>
              <Icon name={iconName as any} size={18} color={iconColor} />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-on-surface font-semibold text-label-md">
                {text1}
              </Text>
              {!!text2 && (
                <Text className="text-secondary font-medium text-label-sm">
                  {text2}
                </Text>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      );
    },
  };

  return <Toast config={config} />;
}
