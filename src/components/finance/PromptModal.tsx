import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface PromptProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onSubmit: (inputValue: string) => void;
}

const PromptModal = ({ visible, title = "Enter Password", onClose, onSubmit }: PromptProps) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            onChangeText={setInputValue}
            value={inputValue}
            placeholder="Type here..."
            secureTextEntry={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => {
              setInputValue("");
              onClose();
            }}>
              <Text style={styles.button}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              onSubmit(inputValue);
              setInputValue("");
            }}>
              <Text style={[styles.button, styles.submit]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 15,
    borderRadius: 5,
  },
  buttonContainer: { flexDirection: "row", justifyContent: "flex-end" },
  button: { marginLeft: 20, color: "blue", fontWeight: "600" },
  submit: { color: "green" },
});

export default PromptModal;
