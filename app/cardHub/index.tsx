import { Stack } from "expo-router";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";

import BankCard from "@/src/components/finance/BankCard";
import { getUniqueStatements } from "@/src/constants/statementUtils";
import { financeStore, StatementMetadata } from "@/src/store/financeStore";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CardHub() {
  const [statements, setSatements] = useState<StatementMetadata[]>([]);
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    financeStore
      .getStatements()
      .then((allStatements) =>
        setSatements(getUniqueStatements(allStatements)),
      );
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const latestStatement = statements[0];
  const otherStatements = statements.slice(1);

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 80, paddingBottom: 40 }}
      className="flex p-4 w-full"
    >
      <Stack.Screen
        options={{
          title: "All Cards",
          headerTransparent: true,
          headerTitleStyle: {
            fontFamily: "GoogleSansFlexRound_600SemiBold",
          },
        }}
      />

      {latestStatement && (
        <View style={{ marginBottom: 20, width: "100%", alignItems: "center" }}>
          <BankCard statement={latestStatement} size="full" />
        </View>
      )}

      {otherStatements.length > 0 &&
        (expanded ? (
          <View style={{ gap: 8, width: "100%", alignItems: "center" }}>
            {otherStatements.map((stmt, idx) => (
              <BankCard key={idx} statement={stmt} size="full" />
            ))}
            <Pressable
              onPress={toggleExpand}
              className="mt-4 p-3 bg-primary/10 rounded-lg w-7/10"
            >
              <Text className="text-primary text-center font-bold">
                Collapse Stack
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={toggleExpand}
            style={{ width: "100%", alignItems: "center" }}
          >
            <View
              pointerEvents="none"
              style={{
                height: 160 + otherStatements.length * 70,
                width: "100%",
                position: "relative",
              }}
            >
              {otherStatements.map((stmt, idx) => (
                <View
                  key={idx}
                  style={{
                    position: "absolute",
                    bottom: idx * 70,
                    width: "100%",
                    alignItems: "center",
                    zIndex: otherStatements.length - idx,
                  }}
                >
                  <BankCard statement={stmt} size="full" />
                </View>
              ))}
            </View>
          </Pressable>
        ))}
    </ScrollView>
  );
}
