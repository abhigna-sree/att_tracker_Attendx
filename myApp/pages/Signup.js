import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNo] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("");
  const [section, setSection] = useState("");
  const navigation = useNavigation();

  const handleSubmit = () => {
    const apiUrl = "http://192.168.230.46:4000/vendor/signup";

    axios
      .post(apiUrl, {
        name,
        rollno: rollNo,
        phone: phoneNumber,
        password,
        dept,
        section,
      })
      .then((result) => navigation.navigate("Login"))
      .catch((err) => {
        console.error("Signup Error:", err);
        Alert.alert("Error", "Signup failed. Try again.");
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.signupBox}>
        <Text style={styles.title}>AttendX</Text>
        <Text style={styles.subtitle}>Create Your Account</Text>

        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Roll Number"
          value={rollNo}
          onChangeText={setRollNo}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNo}
          style={styles.input}
        />
        <TextInput
          placeholder="Department"
          value={dept}
          onChangeText={setDept}
          style={styles.input}
        />
        <TextInput
          placeholder="Section"
          value={section}
          onChangeText={setSection}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE8F5",
    justifyContent: "center",
    alignItems: "center",
  },
  signupBox: {
    width: "80%",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: "#999",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    marginTop: 12,
  },
  loginLink: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});

export default Signup;
