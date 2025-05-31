import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

const ApplyProject = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params;

  const [teamMembers, setTeamMembers] = useState(["", "", ""]);
  const [studentRollNo, setStudentRollNo] = useState("");

  useEffect(() => {
    const fetchTokenAndDecode = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login.");
          navigation.navigate("Login");
          return;
        }

        const decodedToken = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );

        if (!decodedToken.rollno) {
          console.error("rollno is missing in decoded token");
          return;
        }

        if (decodedToken.role !== "student") {
          console.error("Unauthorized role:", decodedToken.role);
          navigation.navigate("Login");
          return;
        }

        setStudentRollNo(decodedToken.rollno);
        setTeamMembers([decodedToken.rollno, "", ""]);
      } catch (error) {
        console.error("Token decoding error:", error);
      }
    };

    fetchTokenAndDecode();
  }, [navigation]);

  const handleInputChange = (index, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = value;
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async () => {
    if (teamMembers.some((roll) => roll === "")) {
      Alert.alert("Validation Error", "Please fill all team members' roll numbers.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "http://192.168.230.46:4000/vendor/apply",
        {
          projectId,
          teamMembers,
        },
        {
          headers: { Authorization: token },
        }
      );
      Alert.alert("Success", response.data.message);
      navigation.navigate("Projects");
    } catch (error) {
      console.error("Application error:", error);
      Alert.alert("Error", "Application failed.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Apply for Project {projectId}</Text>
      {teamMembers.map((roll, index) => (
        <View key={index} style={styles.inputGroup}>
          <Text style={styles.label}>Team Member {index + 1} Roll No:</Text>
          <TextInput
            style={[styles.input, index === 0 ? styles.disabledInput : null]}
            value={roll}
            onChangeText={(text) => handleInputChange(index, text)}
            editable={index !== 0}
            placeholder={`Enter roll number`}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.navigate("Projects")}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ApplyProject;
