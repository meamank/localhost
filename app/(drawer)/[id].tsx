// import { Icon } from "@/src/components/Icon";
// import { useColorScheme } from "@/src/components/useColorScheme";
// import iconColors from "@/src/constants/IconColors";
// import Slider from "@expo/ui/community/slider";
// import { router, Stack, useLocalSearchParams } from "expo-router";
// import { useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// export default function ModelConfigScreen() {
//   const { id } = useLocalSearchParams();
//   const modelId = Array.isArray(id) ? id[0] : id;
//   // const { activeModelConfig, updateModelConfig, clearModelConfig } = useModel();

//   // const currentConfig = activeModelConfig || {};

//   // const [systemPrompt, setSystemPrompt] = useState(
//   //   currentConfig.systemPrompt || "You are a helpful assistant.",
//   // );
//   // const [temperature, setTemperature] = useState(
//   //   currentConfig.temperature ?? 0.7,
//   // );
//   // const [topP, setTopP] = useState(currentConfig.topP ?? 0.9);
//   // const [repetitionPenalty, setRepetitionPenalty] = useState(
//   //   currentConfig.repetitionPenalty ?? 1.0,
//   // );

//   const colorScheme = useColorScheme();

//   const handleSave = () => {
//     updateModelConfig(modelId, {
//       systemPrompt,
//       temperature,
//       topP,
//       repetitionPenalty,
//     });
//     router.back();
//   };

//   const handleClear = () => {
//     clearModelConfig(modelId);
//     router.back();
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={100}
//     >
//       <Stack.Screen
//         options={{
//           headerRight: () => (
//             <Pressable
//               onPress={() => router.push(`/(drawer)/`)}
//               className="flex bg-background-tertiary p-2 rounded-full mr-4"
//             >
//               <Icon
//                 name="cancel"
//                 size={16}
//                 color={iconColors[colorScheme].danger}
//               />
//             </Pressable>
//           ),
//         }}
//       />
//       <ScrollView className="flex-1 bg-background-primary px-4 py-6">
//         <View className="mb-6">
//           <Text className="text-foreground-primary font-semibold mb-2">
//             System Prompt
//           </Text>
//           <TextInput
//             value={systemPrompt}
//             onChangeText={setSystemPrompt}
//             multiline
//             className="bg-background-secondary text-foreground-primary p-4 rounded-lg min-h-30 text-base"
//             placeholder="You are a helpful assistant."
//             placeholderTextColor="#8f8f8f"
//           />
//         </View>

//         <View className="mb-6">
//           <View className="flex-row justify-between mb-2">
//             <Text className="text-foreground-primary font-semibold">
//               Temperature
//             </Text>
//             <Text className="text-foreground-primary">
//               {temperature.toFixed(2)}
//             </Text>
//           </View>

//           <Slider
//             value={temperature}
//             onValueChange={setTemperature}
//             minimumValue={0}
//             maximumValue={2}
//             step={0.05}
//           />

//           <Text className="text-[#8f8f8f] text-xs mt-1">
//             Controls randomness: Lowering results in less random completions.
//           </Text>
//         </View>

//         <View className="mb-6">
//           <View className="flex-row justify-between mb-2">
//             <Text className="text-foreground-primary font-semibold">Top P</Text>
//             <Text className="text-foreground-primary">{topP.toFixed(2)}</Text>
//           </View>
//           <Slider
//             value={topP}
//             onValueChange={setTopP}
//             minimumValue={0}
//             maximumValue={1}
//             step={0.05}
//           />
//           <Text className="text-[#8f8f8f] text-xs mt-1">
//             Controls diversity via nucleus sampling.
//           </Text>
//         </View>

//         <View className="mb-8">
//           <View className="flex-row justify-between mb-2">
//             <Text className="text-foreground-primary font-semibold">
//               Repetition Penalty
//             </Text>
//             <Text className="text-foreground-primary">
//               {repetitionPenalty.toFixed(2)}
//             </Text>
//           </View>
//           <Slider
//             value={repetitionPenalty}
//             onValueChange={setRepetitionPenalty}
//             minimumValue={1}
//             maximumValue={2}
//             step={0.05}
//           />
//           <Text className="text-[#8f8f8f] text-xs mt-1">
//             Penalizes new tokens based on whether they appear in the text so
//             far.
//           </Text>
//         </View>

//         <Pressable
//           onPress={handleSave}
//           className="bg-foreground-primary rounded-xl py-4 items-center mb-4"
//         >
//           <Text className="text-background-primary font-bold text-lg">
//             Save Configuration
//           </Text>
//         </Pressable>

//         <Pressable
//           onPress={handleClear}
//           className="bg-transparent border border-foreground-primary rounded-xl py-4 items-center mb-8"
//         >
//           <Text className="text-foreground-primary font-bold text-lg">
//             Reset to Defaults
//           </Text>
//         </Pressable>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }
