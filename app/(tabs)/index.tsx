import BankCard from "@/src/components/finance/BankCard";
import CategoryCard from "@/src/components/finance/CategoryCard";
import TransactionCard from "@/src/components/finance/TransactionCard";
import {
  Expense,
  StatementMetadata,
  financeStore,
} from "@/src/store/financeStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { FlatList, Text, View, DeviceEventEmitter } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

  import { getUniqueStatements } from "@/src/constants/statementUtils";

  export default function Home() {
    const [dbData, setDbData] = useState<Expense[]>([]);
    const [statements, setStatements] = useState<StatementMetadata[]>([]);
    const insets = useSafeAreaInsets();
  
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

  const categoryData = dbData.reduce(
    (acc, item) => {
      if (item.type === "debit") {
        const cat = item.category?.toLowerCase() || "other";
        acc[cat] = (acc[cat] || 0) + item.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const renderHeader = () => (
    <View className="mb-6">
      <View className="py-4 rounded-xl mb-4">
        <Text className="text-on-surface-variant text-title-md font-bold mb-1">
          Total
        </Text>
        <Text className="text-primary text-3xl font-bold">
          ₹{totalSpending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
      </View>
      {statements.length > 0 && (
        <View className="mb-4 gap-3">
          <Text className="text-foreground-primary font-bold text-lg mb-1">
            Credit Cards
          </Text>
          <FlatList
            data={statements}
            renderItem={({ item }) => <BankCard statement={item} size="half" />}
            keyExtractor={(item, idx) => idx.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          />
        </View>
      )}

      <Text className="text-on-surface-variant font-bold text-lg mt-2 mb-2">
        Categories
      </Text>
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
        {Object.entries(categoryData)
          .sort(([catA, amtA], [catB, amtB]) => {
            if (catA === "other") return 1;
            if (catB === "other") return -1;
            return amtB - amtA;
          })
          .map(([category, amount], index) => (
            <View key={category} style={{ width: "48%" }}>
              <CategoryCard category={category} amount={amount} index={index} />
            </View>
          ))}
      </View>

      <Text className="text-on-surface-variant font-bold text-lg mt-2 mb-2">
        Recent Transactions
      </Text>
    </View>
  );

  return (
    <View className="flex-1 justify-center bg-background">
      <FlatList
        data={dbData.slice(0, 20)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 120, // Enough space for the floating tab bar
          paddingHorizontal: 16,
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionCard item={item} />}
      />
    </View>
  );
}
