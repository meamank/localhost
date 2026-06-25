import { View, Text } from "react-native";
import React from "react";
import { Icon } from "../Icon";
import { useColorScheme } from "../useColorScheme";
import m3 from "@/src/constants/m3";

export default function CategoryCard({
  category,
  amount,
  index = 0,
}: {
  category: string;
  amount: number;
  index?: number;
}) {
  const colorScheme = useColorScheme();
  const theme = m3[colorScheme];

  // Pick a sequential color based on index
  const colorKeys = [
    "accentPurple",
    "accentBlue",
    "accentOrange",
    "accentRose",
  ] as const;
  
  const colorKey = colorKeys[index % colorKeys.length];

  const surfaceColor = theme[colorKey];
  const onColor = theme[`${colorKey}On` as keyof typeof theme];
  const boldColor = theme[`${colorKey}Bold` as keyof typeof theme];

  return (
    <View
      className="w-full rounded-md p-4 border"
      style={{
        backgroundColor: surfaceColor,
        borderColor: `${onColor}20`,
      }}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Icon name={`${category}-icon` as any} size={20} color={boldColor} />
        <Text className="font-semibold text-sm" style={{ color: onColor }}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </View>
      <Text className="font-black text-xl" style={{ color: boldColor }}>
        ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}
