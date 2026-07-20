import { Icon } from "@/src/components/Icon";
import m3 from "@/src/constants/m3";
import { useFinance } from "@/src/hooks/useFinance";
import { Expense } from "@/src/store/financeStore";
import { DeviceEventEmitter, Image, Pressable, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Toast from "react-native-toast-message";
import { useColorScheme } from "../useColorScheme";

const merchantImages: Record<string, any> = {
  zomato: require("@/src/assets/images/zomato.png"),
  blinkit: require("@/src/assets/images/blinkit.png"),
  airtel: require("@/src/assets/images/airtel.png"),
  jiomart: require("@/src/assets/images/jiomart.png"),
  smartpoint: require("@/src/assets/images/jiomart.png"),
  swiggy: require("@/src/assets/images/swiggy.png"),
  instamart: require("@/src/assets/images/instamart.png"),
  zepto: require("@/src/assets/images/zepto.png"),
};

export default function TransactionCard({ item }: { item: Expense }) {
  const colorScheme = useColorScheme();
  const { deleteExpense } = useFinance();
  const date = new Date(item.date);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const formattedDate = `${day} ${month}, ${year}`;

  const deleteTransaction = async (id: number) => {
    try {
      await deleteExpense(id);
      DeviceEventEmitter.emit("finance_data_updated");
      Toast.show({
        type: "custom",
        text1: "Transaction deleted successfully!",
      });
    } catch (error) {
      Toast.show({
        type: "custom",
        text1: "Failed to delete transaction",
        props: { type: "error" },
      });
    }
  };

  const merchantLower = item.merchant.replace(/\s/g, "").toLowerCase();

  // Check if we have a PNG for this merchant
  const matchedImageKey = Object.keys(merchantImages).find((key) =>
    merchantLower.includes(key),
  );

  // Fallback map for SVG Icons
  const iconMap: Record<string, string> = {
    entertainment: "entertainment",
    fuel: "fuel",
    grocery: "grocery-icon",
    shopping: "shopping",
    transport: "travel",
    bills: "bills",
    health: "health-icon",
    other: "other-icon",
    food: "food",
  };
  const fallbackIcon =
    iconMap[(item.category || "other").trim().toLowerCase()] || "dinner";

  const renderRightActions = () => {
    return (
      <View className="flex-row bg-surface-container rounded-r-sm items-center gap-2 mb-6 px-2">
        <Pressable
          className="bg-info/10 justify-center items-center rounded-lg p-2"
          onPress={() => console.log("Edit clicked", item.id)}
        >
          <Icon name="new-chat" size={18} color={m3[colorScheme].primary} />
        </Pressable>
        <Pressable
          className="bg-danger/10 justify-center items-center rounded-lg p-2"
          onPress={() => deleteTransaction(item.id)}
        >
          <Icon name="delete" size={18} color={m3[colorScheme].error} />
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View className="flex-row justify-between mb-6 bg-background">
        <View className="flex-row gap-4 items-center">
          <View
            className="bg-background-tertiary/60 p-2 rounded-full justify-center items-center"
            style={{ width: 44, height: 44 }}
          >
            {matchedImageKey ? (
              <Image
                source={merchantImages[matchedImageKey]}
                style={{ width: 28, height: 28, resizeMode: "contain" }}
              />
            ) : (
              <Icon name={fallbackIcon as any} size={24} />
            )}
          </View>
          <View>
            <Text
              className="text-foreground-secondary/90 text-label-md font-bold mb-2 max-w-48"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.merchant}
            </Text>
            <Text className="text-muted/80 text-label-md font-semibold">
              {formattedDate}
            </Text>
          </View>
        </View>
        <View>
          <View className="flex-row gap-1 justify-end">
            {item.type && item.type === "debit" ? (
              <Icon name="debit" size={14} color={m3[colorScheme].error} />
            ) : (
              <Icon name="credit" size={14} color={m3[colorScheme].success} />
            )}
            <Text className="text-foreground-secondary/90 text-label-md font-bold mb-2">
              ₹{item.amount}
            </Text>
          </View>

          <Text className="text-muted/80 text-label-md font-semibold">
            {item.source === "statement"
              ? `${item.bank}••••${item.card_last4}`
              : "Cash"}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
}
