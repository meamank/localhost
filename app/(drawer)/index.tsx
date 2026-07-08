import Spacer from "@/src/components/home/Spacer";
import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import m3 from "@/src/constants/m3";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  return (
    <View
      className="flex-1 bg-surface "
      style={{
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 80,
        paddingHorizontal: 20,
      }}
    >
      <Text className="text-on-surface-variant font-sans text-headline-md font-semibold">
        {getGreeting()}
      </Text>
      <Spacer />
      <View className="flex-row justify-between">
        <Pressable
          onPress={() => router.push({ pathname: "/chat", params: { context: "general" } })}
          className="bg-surface-container px-4 py-6 w-[45%] gap-4 rounded-md"
        >
          <View className="bg-primary-container p-2 rounded-sm self-start">
            <Icon
              name="chat-active"
              size={18}
              color={[
                m3[colorScheme].onPrimaryContainer,
                m3[colorScheme].onPrimary,
              ]}
            />
          </View>
          <View className="gap-2">
            <Text className="text-body-lg text-on-primary-container font-medium">
              Talk to Assistant
            </Text>
            <Text className="text-body-md text-secondary w-4/5 tracking-widest">
              Whatever's on your mind
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push("/finance")}
          className="bg-surface-container px-4 py-6 w-[45%] gap-4 rounded-md"
        >
          <View className="bg-primary-container p-2 rounded-sm self-start">
            <Icon
              name="bills"
              size={18}
              color={[
                m3[colorScheme].onPrimaryContainer,
                m3[colorScheme].onPrimary,
              ]}
            />
          </View>
          <View className="gap-2">
            <Text className="text-body-lg text-on-primary-container font-medium">
              Finance
            </Text>
            <Text className="text-body-md text-secondary w-4/5 tracking-widest">
              Track all your expenses
            </Text>
          </View>
        </Pressable>
      </View>
      <Spacer />
      <View>
        <Text className="text-title-md">Today's agenda</Text>
      </View>
    </View>
  );
}
