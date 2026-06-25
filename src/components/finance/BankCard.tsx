import { StatementMetadata } from "@/src/store/financeStore";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Icon } from "../Icon";

export default function BankCard({
  statement,
  size,
}: {
  statement: StatementMetadata;
  size?: "full" | "half";
}) {
  if (!statement) return null;

  const dueDate = statement.due_date
    ? new Date(statement.due_date)
    : new Date();
  const formattedDueDate = dueDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  const iconMap: Record<string, string> = {
    sbi: "sbi",
    hdfc: "hdfc",
    icici: "icici",
    "yes bank": "yesbank",
    axis: "axis",
    baroda: "baroda",
  };

  const normalizedBank = statement.bank.toLowerCase().trim();
  const bankIcon = iconMap[normalizedBank] || "chip";

  return (
    <Pressable
      onPress={() => router.push(`/${statement.bank}_${statement.card_last4}`)}
      className={`${size === "half" ? "w-[48%] h-30 p-3" : "w-7/10 h-40 p-5"} bg-background border-[3px] border-primary rounded-md justify-between mb-2`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <Icon name={bankIcon as any} size={size === "half" ? 24 : 28} />
          <View>
            <Text
              className={`text-on-background font-sans font-bold ${size === "half" ? "text-title-sm" : "text-title-md"}  uppercase`}
            >
              {statement.bank}
            </Text>
            <Text className="text-on-surface-variant text-sm font-medium">
              •••• {statement.card_last4}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between border-t border-outline-variant/30 pt-3">
        <View>
          <Text className={`text-on-surface-variant text-xs mb-0.5`}>
            Total Due
          </Text>
          <Text
            className={`text-primary font-sans font-bold ${size === "half" ? "text-title-md" : "text-exp-title-sm"}`}
          >
            ₹
            {statement.total_due.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
        <Text className="text-on-surface-variant text-xs font-semibold self-end pb-0.5">
          Due {formattedDueDate}
        </Text>
      </View>
    </Pressable>
  );
}
