import { View, Text } from "react-native";
import React from "react";
import { Pressable } from "react-native";

const Row = ({ label, value }: { label: string; value: any }) => (
  <View className="flex-row mb-1">
    <Text className="text-accent-blue-bold min-w-35 font-sans font-bold text-label-lg">
      {label}
    </Text>
    <Text className="text-accent-blue-bold/80 font-sans font-semibold text-label-lg">
      : {value}
    </Text>
  </View>
);

export default function ExtractedResult({
  syntheticMessages,
  onClose,
}: {
  syntheticMessages: any[];
  onClose: () => void;
}) {
  const {
    totalTransactions,
    bank,
    cardLast4,
    billingPeriod,
    dueDate,
    totalDue,
  } = syntheticMessages[0].content;

  return (
    <View className="w-full">
      <Row label="Transactions" value={totalTransactions} />
      <Row label="Card" value={`${bank} •••• ${cardLast4}`} />
      <Row label="Billing Period" value={billingPeriod} />
      <Row label="Due Date" value={dueDate} />
      <Row label="Total Due" value={`₹${totalDue}`} />
      <Pressable
        className="bg-accent-blue-bold px-5 py-3 self-end rounded-sm"
        onPress={onClose}
      >
        <Text className="text-accent-blue-surface text-label-lg">Done</Text>
      </Pressable>
    </View>
  );
}
