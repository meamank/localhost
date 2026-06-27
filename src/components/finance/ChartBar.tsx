import m3 from "@/src/constants/m3";
import { View } from "react-native";
import { useColorScheme } from "../useColorScheme";

export default function ChartBar({
  label,
  width,
  index,
}: {
  label: string;
  width: number;
  index: number;
}) {
  const colorScheme = useColorScheme();
  const theme = m3[colorScheme];

  // Pick a sequential color based on index
  const colorKeys = [
    "accentPurple",
    "accentBlue",
    "accentOrange",
    "accentRose",
    "primaryContainer",
    "outline",
  ] as const;

  const colorKey = colorKeys[index % colorKeys.length];

  const surfaceColor = theme[colorKey];
  const onColor = theme[`${colorKey}On` as keyof typeof theme];
  const boldColor = theme[`${colorKey}Bold` as keyof typeof theme];

  return (
    <View
      className="bg-primary-container h-10 rounded-xs"
      style={{ width: `${width}%`, backgroundColor: surfaceColor }}
    ></View>
  );
}
