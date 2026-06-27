import BankCard from "@/src/components/finance/BankCard";
import TransactionCard from "@/src/components/finance/TransactionCard";
import { Icon } from "@/src/components/Icon";
import {
  Expense,
  financeStore,
  StatementMetadata,
} from "@/src/store/financeStore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/src/components/useColorScheme";
import { extractDateDetails } from "@/src/constants/helpers";
import m3 from "@/src/constants/m3";
import { getUniqueStatements } from "@/src/constants/statementUtils";
import { BarChart } from "react-native-gifted-charts";

export default function CardDetailsScreen() {
  const { card } = useLocalSearchParams<{
    card: string;
  }>();
  const [currentStatement, setCurrentStatement] =
    useState<StatementMetadata | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);

  const [uniqueCards, setUniqueCards] = useState<StatementMetadata[]>([]);

  const [historicalStatements, setHistoricalStatements] = useState<
    StatementMetadata[]
  >([]);

  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [bank, last4] = card.split("_");
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();

  useEffect(() => {
    financeStore.getStatements().then((allStatements) => {
      // Get unique latest statements for the next/prev arrows
      const uniques = getUniqueStatements(allStatements);
      setUniqueCards(uniques);

      const matchIndex = uniques.findIndex(
        (statement) =>
          statement.card_last4 === last4 && statement.bank === bank,
      );
      if (matchIndex !== -1) {
        setCurrentCardIndex(matchIndex);
        setCurrentStatement(uniques[matchIndex]);
      } else {
        setCurrentCardIndex(null);
        setCurrentStatement(null);
      }

      const history = allStatements
        .filter((s) => s.card_last4 === last4 && s.bank === bank)
        .sort(
          (a, b) =>
            (b?.due_date ? Date.parse(b.due_date) : 0) -
            (a?.due_date ? Date.parse(a.due_date) : 0),
        );

      const historyIndex = history.findIndex(
        (hist) => hist.card_last4 === last4 && hist.bank === bank,
      );
      setCurrentHistoryIndex(historyIndex);
      setHistoricalStatements(history);
    });
  }, [card]);

  useEffect(() => {
    financeStore.queryExpenses().then((allTransactions) => {
      let matches = allTransactions.filter(
        (transaction) =>
          transaction.bank === bank && transaction.card_last4 === last4,
      );
      if (
        currentStatement?.billing_period &&
        currentStatement.billing_period.includes("to")
      ) {
        const [start, end] =
          currentStatement?.billing_period?.split("to") || [];
        const startEpoch = extractDateDetails(start.trim()).epoch;
        const endEpoch = extractDateDetails(end.trim()).epoch;

        matches = matches.filter((transaction) => {
          const txEpoch = extractDateDetails(transaction.date).epoch;
          return txEpoch >= startEpoch && txEpoch <= endEpoch;
        });
      }
      setTransactions(matches);
    });
  }, [currentStatement, bank, last4]);

  const nextCard = () => {
    if (
      currentCardIndex !== null &&
      uniqueCards.length > 0 &&
      currentCardIndex < uniqueCards.length - 1
    ) {
      const nextObj = uniqueCards[currentCardIndex + 1];

      if (!nextObj) {
        return null;
      }

      const { bank, card_last4 } = nextObj;

      router.setParams({ card: `${nextObj.bank}_${nextObj.card_last4}` });
    }
  };

  const previousCard = () => {
    if (
      currentCardIndex !== null &&
      uniqueCards.length > 0 &&
      currentCardIndex > 0
    ) {
      const prevObj = uniqueCards[currentCardIndex - 1];
      if (!prevObj) {
        return null;
      }
      const { bank, card_last4 } = prevObj;

      router.setParams({ card: `${prevObj.bank}_${prevObj.card_last4}` });
    }
  };

  const nextHistory = () => {
    if (
      currentHistoryIndex !== null &&
      historicalStatements.length > 0 &&
      currentHistoryIndex < historicalStatements.length - 1
    ) {
      const nextObj = historicalStatements[currentHistoryIndex + 1];

      if (!nextObj) {
        return null;
      }

      setCurrentStatement(nextObj);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const previousHistory = () => {
    if (
      currentHistoryIndex !== null &&
      historicalStatements.length > 0 &&
      currentHistoryIndex > 0
    ) {
      const prevObj = historicalStatements[currentHistoryIndex - 1];
      if (!prevObj) {
        return null;
      }
      const { bank, card_last4 } = prevObj;

      setCurrentStatement(prevObj);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const formattedStatementDate = (billing_period: string) => {
    if (!billing_period) return "";

    let dateString = billing_period;
    if (billing_period.toLowerCase().includes("to")) {
      const parts = billing_period.toLowerCase().split("to");
      dateString = parts[1]?.trim() || billing_period;
    }

    const date = new Date(dateString);

    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${month}, ${year}`;
  };

  const chartTransactionsByDate = Object.entries(
    transactions?.reduce(
      (acc, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = 0;
        }
        acc[curr.date] += curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([date, totalAmount]) => {
      const extractedDate = extractDateDetails(date);
      const formattedDate = `${extractedDate.month.slice(0, 3).toUpperCase()} ${extractedDate.date}`;

      return {
        value: totalAmount,
        label: formattedDate,
        yAxisLabelText: totalAmount,
      };
    })
    .reverse();

  return (
    <View
      style={{ paddingTop: insets.top + 80 }}
      className="flex-1 bg-accent-blue-surface p-4"
    >
      <Stack.Screen
        options={{
          title: card.replace("_", "••••") || "Card Details",
          headerTransparent: true,
          headerTitleStyle: {
            fontFamily: "GoogleSansFlexRound_600SemiBold",
          },
        }}
      />
      <View className="flex-row justify-between items-center border-b border-outline-variant/30 pb-4">
        <Pressable
          onPress={previousCard}
          disabled={currentCardIndex === null || currentCardIndex === 0}
          className="bg-primary-container rounded-full p-1 disabled:opacity-50"
        >
          <Icon name="chevron-left" size={28} />
        </Pressable>
        {currentStatement && (
          <BankCard statement={currentStatement} size="full" />
        )}
        <Pressable
          onPress={nextCard}
          disabled={
            currentCardIndex === null ||
            uniqueCards.length === 0 ||
            currentCardIndex === uniqueCards.length - 1
          }
          className="bg-primary-container rounded-full p-1 disabled:opacity-50"
        >
          <Icon name="chevron-right" size={28} />
        </Pressable>
      </View>

      {/* Chart */}
      <View className="flex-row justify-between items-center">
        <Pressable
          onPress={previousHistory}
          disabled={currentHistoryIndex === 0}
          className="disabled:opacity-50"
        >
          <Icon name="chevron-left" size={24} />
        </Pressable>
        {historicalStatements[currentHistoryIndex] && (
          <View className="flex my-6 ">
            <Text className="text-title-md font-sans font-semibold opacity-80">
              {formattedStatementDate(
                historicalStatements[currentHistoryIndex].billing_period,
              )}
            </Text>
            {/* <Text className="text-exp-title-sm font-bold text-primary">
                ₹
                {historicalStatements[
                  currentHistoryIndex
                ].total_due.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text> */}
          </View>
        )}
        <Pressable
          onPress={nextHistory}
          disabled={currentHistoryIndex === historicalStatements.length - 1}
          className="disabled:opacity-50"
        >
          <Icon name="chevron-right" size={24} />
        </Pressable>
      </View>
      <View style={{ backgroundColor: m3[colorScheme].accentBlueSurface }}>
        <BarChart
          initialSpacing={5}
          data={chartTransactionsByDate}
          showGradient
          gradientColor={m3[colorScheme].primary}
          frontColor={m3[colorScheme].primaryContainer}
          noOfSections={3}
          barBorderRadius={5}
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelTextStyle={{
            fontSize: 12,
            fontWeight: "500",
            fontFamily: "GoogleSansFlexRound_600SemiBold",
            color: m3[colorScheme].outlineVariant,
          }}
          yAxisTextStyle={{
            fontWeight: "500",
            color: m3[colorScheme].outlineVariant,
          }}
          showXAxisIndices={false}
          dashGap={10}
        />
      </View>

      <Text className="text-on-surface font-sans font-semibold text-title-md mt-4 mb-6">
        Transactions
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionCard item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
