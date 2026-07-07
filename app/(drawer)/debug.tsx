import { Expense, financeStore } from "@/src/store/financeStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function DebugDB() {
  const [data, setData] = useState<Expense[]>([]);
  const [statements, setStatements] = useState<any[]>([]);

  const loadData = () => {
    financeStore.queryExpenses().then(setData);
    financeStore.getStatements().then(setStatements);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  console.log(statements);

  const handleClear = async () => {
    try {
      await financeStore.clearAllData();
      Toast.show({ type: "success", text1: "Database Cleared" });
      loadData();
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed to clear database" });
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Button title="Clear Database" onPress={handleClear} color="#ff3b30" />
      </View>
      <Text className="text-foreground-primary">
        Statements:
        {JSON.stringify(statements, null, 2)}
        {"\n\n"}
        Expenses:
        {JSON.stringify(data, null, 2)}
      </Text>
    </ScrollView>
  );
}
