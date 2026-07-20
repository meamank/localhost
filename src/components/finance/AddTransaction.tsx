import m3 from "@/src/constants/m3";
import { useFinance } from "@/src/hooks/useFinance";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { DeviceEventEmitter, Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useColorScheme } from "../useColorScheme";

interface TransactionProps {
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
}

const Transaction = ({ value, placeholder, onChange }: TransactionProps) => {
  return (
    <View className="flex gap-2 ">
      <Text className="text-primary text-title-md">{placeholder}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
        className={`border rounded-xs w-full h-14 text-body-lg px-4 border-border`}
      />
    </View>
  );
};

const CATEGORIES = [
  "Food",
  "Transport",
  "Grocery",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

export default function AddTransaction({ onClose }: { onClose?: () => void }) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());

  const { addExpense } = useFinance();
  const colorScheme = useColorScheme();

  const submitHandler = async () => {
    if (!merchant && !amount && !category && !description) return;
    const expense = {
      merchant: merchant.trim().toLocaleLowerCase(),
      amount: parseFloat(amount) || 0,
      category: category.trim().toLowerCase(),
      note: description.trim().toLocaleLowerCase(),
      date: date.toISOString().split("T")[0],
      currency: "inr",
    };
    console.log(expense);

    try {
      await addExpense(expense);
      DeviceEventEmitter.emit("finance_data_updated");
      Toast.show({
        type: "custom",
        text1: "Transaction added successfully!",
      });
      if (onClose) onClose();
    } catch (error) {
      Toast.show({
        type: "custom",
        text1: "Failed to add transaction",
        props: { type: "error" },
      });
    }
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: (event, selectedDate) => {
        if (selectedDate) setDate(selectedDate);
      },
      mode: "date",
      maximumDate: new Date(),
    });
  };

  return (
    <View className="flex p-6 gap-4">
      <Text
        className="text-title-md font-bold text-center"
        style={{ color: m3[colorScheme].onSurface }}
      >
        Add Transaction
      </Text>
      <Transaction
        value={merchant}
        placeholder="Merchant"
        onChange={setMerchant}
      />
      <Transaction value={amount} placeholder="Amount" onChange={setAmount} />
      <Transaction
        value={description}
        placeholder="Description"
        onChange={setDescription}
      />

      <View className="flex gap-4">
        <Text className="text-primary text-title-md">Category</Text>
        <View className="flex-row gap-4 flex-wrap justify-center">
          {CATEGORIES.map((cat) => {
            return (
              <Pressable
                onPress={() => setCategory(cat)}
                key={cat}
                className={`${category === cat ? "bg-primary-container border-primary" : "bg-surface border-primary"} border  py-1 px-2 rounded-full`}
              >
                <Text className="text-label-md">{cat}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="flex gap-2">
        <Text className="text-primary text-title-md">Date</Text>
        <Pressable
          onPress={showDatePicker}
          className="border border-border p-4 rounded-xs"
        >
          <Text className="text-body-lg text-muted">
            {date.toLocaleDateString()}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={submitHandler}
        className="bg-primary p-4 rounded-full mt-4"
      >
        <Text className="text-on-primary text-center font-bold text-title-md">
          Add
        </Text>
      </Pressable>
    </View>
  );
}
