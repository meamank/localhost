import { Icon } from "@/src/components/Icon";
import { Expense } from "@/src/store/financeStore";
import { Image, Text, View } from "react-native";

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
  const date = new Date(item.date);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const formattedDate = `${day} ${month}, ${year}`;

  const merchantLower = item.merchant.replace(/\s/g, "").toLowerCase();

  // Check if we have a PNG for this merchant
  const matchedImageKey = Object.keys(merchantImages).find((key) =>
    merchantLower.includes(key),
  );

  // Fallback map for SVG Icons
  const iconMap: Record<string, string> = {
    entertainment: "entertainment",
    fuel: "fuel",
    grocery: "grocery",
    shopping: "shopping",
    transport: "travel",
    bills: "bills",
    health: "health-icon",
    other: "other-icon",
  };
  const fallbackIcon = iconMap[item.category] || "dinner";

  return (
    <View className="flex-row justify-between mb-6">
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
        <Text className="text-foreground-secondary/90 text-label-md font-bold mb-2 self-end">
          ₹{item.amount}
        </Text>
        <Text className="text-muted/80 text-label-md font-semibold">
          {`${item.bank}••••${item.card_last4}`}
        </Text>
      </View>
    </View>
  );
}
