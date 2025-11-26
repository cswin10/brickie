import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  suffix?: string;
  containerStyle?: object;
}

export function Input({
  label,
  error,
  suffix,
  containerStyle,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#B8A393"
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#544740",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F3",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8DFD7",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#544740",
    paddingVertical: 14,
  },
  suffix: {
    fontSize: 14,
    color: "#998272",
    marginLeft: 8,
  },
  inputError: {
    borderColor: "#C75B3B",
  },
  errorText: {
    fontSize: 12,
    color: "#C75B3B",
    marginTop: 4,
  },
});
