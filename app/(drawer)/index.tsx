import BankCard from "@/src/components/finance/BankCard";
import TransactionCard from "@/src/components/finance/TransactionCard";
import {
  Expense,
  StatementMetadata,
  financeStore,
} from "@/src/store/financeStore";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DeviceEventEmitter,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryCard from "@/src/components/finance/CategoryCard";
import Empty from "@/src/components/home/Empty";
import Spacer from "@/src/components/home/Spacer";
import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import { extractDateDetails } from "@/src/constants/helpers";
import { getUniqueStatements } from "@/src/constants/statementUtils";

export default function Home() {
  const [dbData, setDbData] = useState<Expense[]>([]);
  const [statements, setStatements] = useState<StatementMetadata[]>([]);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const loadData = useCallback(() => {
    financeStore.queryExpenses().then((data) => setDbData(data));
    financeStore.getStatements().then((allStatements) => {
      setStatements(getUniqueStatements(allStatements));
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "finance_data_updated",
      loadData,
    );
    return () => subscription.remove();
  }, [loadData]);

  const totalSpending = statements.reduce(
    (sum, stmt) => sum + stmt.total_due,
    0,
  );

  const categoryData = useMemo(
    () =>
      dbData.reduce(
        (acc, item) => {
          // 1. Check if the item belongs to one of the latest statements
          const parentStatement = statements.find(
            (s) => s.bank === item.bank && s.card_last4 === item.card_last4,
          );

          let isCurrentCycle = false;

          // If it belongs to a card, verify it falls within the billing period
          if (
            parentStatement &&
            parentStatement.billing_period?.includes("to")
          ) {
            const [startStr, endStr] =
              parentStatement.billing_period.split("to");
            try {
              const startEpoch = extractDateDetails(startStr.trim()).epoch;
              const endEpoch = extractDateDetails(endStr.trim()).epoch;
              const txEpoch = extractDateDetails(item.date).epoch;

              if (txEpoch >= startEpoch && txEpoch <= endEpoch) {
                isCurrentCycle = true;
              }
            } catch (e) {
              // If date parsing fails, just include it to be safe
              isCurrentCycle = true;
            }
          } else {
            // If it's a manual expense (no bank/card), or no billing period exists, include it for the current month
            isCurrentCycle = true;
          }

          if (item.type === "debit" && isCurrentCycle) {
            const cat = item.category?.toLowerCase() || "other";

            // Optional: Exclude CC payments if they still sneak in as debits
            const isCcPayment =
              cat === "cc payment" ||
              cat === "credit card payment" ||
              item.merchant?.toLowerCase().includes("cc payment") ||
              item.merchant?.toLowerCase().includes("credit card");

            if (!isCcPayment) {
              acc[cat] = (acc[cat] || 0) + item.amount;
            }
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
    [dbData, statements],
  );

  const headerList = useMemo(() => statements.slice(0, 2), [statements]);
  const transactionList = useMemo(() => dbData.slice(0, 20), [dbData]);

  const renderHeader = useCallback(
    () => (
      <View>
        <View className="py-8 rounded-3xl mb-6 items-center">
          <Text className="text-on-surface-variant text-title-sm font-bold mb-2 uppercase tracking-widest">
            Total Due
          </Text>

          <Text className="text-primary text-display-md font-bold tracking-widest">
            ₹
            {totalSpending.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* CARDS */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-foreground-secondary font-display text-title-sm font-bold tracking-wide">
            Cards
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-sans font-semibold text-body-sm">
              View All
            </Text>
            <Pressable onPress={() => router.push("/cardHub")}>
              <Icon name="chevron-right" size={18} />
            </Pressable>
          </View>
        </View>

        {statements.length > 0 ? (
          <>
            <View className="mb-4 gap-3">
              <FlatList
                data={headerList}
                renderItem={({ item }) => (
                  <BankCard statement={item} size="half" />
                )}
                keyExtractor={(item, idx) => idx.toString()}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              />
            </View>
          </>
        ) : (
          <Empty title="cards" />
        )}

        <Spacer />

        <Text className="text-foreground-secondary font-display text-title-sm font-bold tracking-wide mb-2">
          Categories
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {Object.keys(categoryData).length > 0 ? (
            Object.entries(categoryData)
              .sort(([catA, amtA], [catB, amtB]) => {
                if (catA === "other") return 1;
                if (catB === "other") return -1;
                return amtB - amtA;
              })
              .map(([category, amount], index) => (
                // <ChartBar
                //   key={category}
                //   width={(amount / totalSpending) * 100}
                //   label={category}
                //   index={index}
                // />
                <View key={category} style={{ width: "48%" }}>
                  <CategoryCard
                    category={category}
                    amount={amount}
                    index={index}
                  />
                </View>
              ))
          ) : (
            <Empty title="categories" />
          )}
        </View>

        <Spacer />

        <Text className="text-foreground-secondary font-display text-title-sm font-bold tracking-wide mb-2">
          Recent Transactions
        </Text>
      </View>
    ),
    [totalSpending, colorScheme, statements.length, headerList, categoryData],
  );

  const renderTransactionItem = useCallback(
    ({ item }: any) => <TransactionCard item={item} />,
    [],
  );

  return (
    <View className="flex-1 justify-center bg-background">
      <FlatList
        data={transactionList}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 120, // Enough space for the floating tab bar
          paddingHorizontal: 16,
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransactionItem}
        ListEmptyComponent={<Empty title="transactions" />}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/chat")}
        className="absolute right-6 bg-primary items-center justify-center rounded-full"
        style={{
          bottom: Math.max(insets.bottom + 24, 24),
          width: 56,
          height: 56,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Text className="text-title-sm text-on-primary">Ask</Text>
      </Pressable>
    </View>
  );
}
