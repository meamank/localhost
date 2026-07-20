import m3 from "@/src/constants/m3";
import { StatementMetadata, financeStore } from "@/src/store/financeStore";
import { router } from "expo-router";
import { DeviceEventEmitter, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { Icon } from "../Icon";
import { useColorScheme } from "../useColorScheme";

export default function BankCard({
  statement,
  size,
}: {
  statement: StatementMetadata;
  size?: "full" | "carousel";
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
  const colorScheme = useColorScheme();

  const normalizedBank = statement.bank.toLowerCase().trim();
  const bankIcon = iconMap[normalizedBank] || "chip";

  let containerClass =
    "bg-background border-[3px] border-primary rounded-md justify-between";
  if (size === "carousel") containerClass += " w-[42vw] h-32 p-3";
  else containerClass += " w-7/10 h-40 p-5 mb-2";

  const handleMarkAsPaid = async (e: any) => {
    e.stopPropagation();
    if (!statement.id) return;

    // Immediately mark it as paid in DB
    await financeStore.updateStatementPaidStatus(statement.id, true);
    // Ping listeners so it disappears from the dashboard
    DeviceEventEmitter.emit("finance_data_updated");

    Toast.show({
      type: "custom",
      text1: `${statement.bank} bill marked as paid`,
      text2: "Tap here to UNDO",
      visibilityTime: 5000,
      props: { type: "info" },
      onPress: async () => {
        await financeStore.updateStatementPaidStatus(statement.id!, false);
        DeviceEventEmitter.emit("finance_data_updated");
        Toast.hide();
        Toast.show({
          type: "custom",
          text1: "Statement restored.",
          props: { type: "info" },
        });
      },
    });
  };

  return (
    <Pressable
      onPress={() => router.push(`/${statement.bank}_${statement.card_last4}`)}
      className={containerClass}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <Icon name={bankIcon as any} size={size === "carousel" ? 24 : 28} />
          <View>
            <Text
              className={`text-on-background font-sans font-bold ${size === "carousel" ? "text-title-sm" : "text-title-md"} uppercase`}
            >
              {statement.bank}
            </Text>
            <Text className="text-on-surface-variant text-sm font-medium">
              •••• {statement.card_last4}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleMarkAsPaid}
          hitSlop={15}
          className={`flex-row bg-primary/10 ${size === "carousel" ? "rounded-full" : "rounded-sm"} p-1 items-center`}
        >
          <Icon
            name="tick"
            size={size === "carousel" ? 16 : 20}
            color={m3[colorScheme].primary}
          />
          {size === "carousel" ? null : (
            <Text className="text-label-sm">Mark as paid</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-row justify-between border-t border-outline-variant/30 pt-3">
        <View>
          <Text className={`text-on-surface-variant text-xs mb-0.5`}>
            Total Due
          </Text>
          <Text
            className={`text-primary font-sans font-bold ${size === "carousel" ? "text-body-lg" : "text-exp-title-sm"}`}
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
