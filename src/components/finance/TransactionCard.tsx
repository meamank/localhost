import { View, Text } from "react-native";
import React from "react";
import { Icon } from "../Icon";
import { Expense } from "@/src/store/financeStore";
import { CATEGORY_KEYWORDS } from "@/src/constants/statementParser";

export default function TransactionCard({ item }: { item: Expense }) {
  const date = new Date(item.date);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const formattedDate = `${day} ${month}, ${year}`;

  const iconMap: Record<string, string> = {
    food: "food",
    entertainment: "entertainment",
    fuel: "fuel",
    grocery: "grocery",
    shopping: "shopping",
    transport: "travel",
    bills: "bills",
    other: "other-icon",
  };

  const TransactionIcon = iconMap[item.category] || "dinner";

  return (
    <View className="flex-row justify-between mb-6">
      <View className="flex-row gap-4 items-center">
        <View className="bg-background-tertiary/60 p-2 rounded-full">
          <Icon name={TransactionIcon as any} size={24} />
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
