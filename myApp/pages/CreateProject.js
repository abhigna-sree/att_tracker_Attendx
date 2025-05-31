import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Buffer } from 'buffer';
import { useNavigation } from "@react-navigation/native";

const CreateProject = () => {
  const navigation = useNavigation();
  const [mentors, setMentors] = useState([]);
  const [formData, setFormData] = useState({
    pid: "",
    projectName: "",
    projectDesc: "",
    projectDeadline: "",
    executionStartDate: "",
    executionEndDate: "",
    projectSlots: "",
    mentor: "",
    projectImage: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Unauthorized", "No token found. Redirecting...");
        navigation.navigate("Login");
        return;
      }

      try {
        const decoded = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );

        if (decoded.role !== "admin") {
          Alert.alert("Unauthorized", "Access denied. Redirecting...");
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error("Token decode error:", error);
      }
    };

    fetchUserData();

    axios
      .get("http://192.168.230.46:4000/vendor/mentors")
      .then((response) => setMentors(response.data))
      .catch((error) => console.error("Error fetching mentors:", error));
  }, []);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setFormData({ ...formData, projectImage: result.assets[0] });
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.projectImage) {
      Alert.alert("Image Required", "Please upload a project image.");
      return;
    }

    const data = new FormData();
    data.append("pid", formData.pid);
    data.append("projectName", formData.projectName);
    data.append("projectDesc", formData.projectDesc);
    data.append("projectDeadline", formData.projectDeadline);
    data.append("executionStartDate", formData.executionStartDate);
    data.append("executionEndDate", formData.executionEndDate);
    data.append("projectSlots", formData.projectSlots);
    data.append("mentor", formData.mentor);
    data.append("projectImage", {
      uri: formData.projectImage.uri,
      name: formData.projectImage.uri.split("/").pop(),
      type: "image/jpeg",
    });

    try {
      await axios.post(
        "http://192.168.230.46:4000/vendor/createProject",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Project created successfully!");
      navigation.navigate("AdminDashboard");
    } catch (error) {
      console.error("Project creation error:", error);
      Alert.alert("Error", "Failed to create project.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Create New Project</Text>

      <TextInput
        style={styles.input}
        placeholder="Project ID"
        value={formData.pid}
        onChangeText={(text) => handleChange("pid", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Project Name"
        value={formData.projectName}
        onChangeText={(text) => handleChange("projectName", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Project Description"
        value={formData.projectDesc}
        multiline
        numberOfLines={3}
        onChangeText={(text) => handleChange("projectDesc", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Registration Deadline (YYYY-MM-DD)"
        value={formData.projectDeadline}
        onChangeText={(text) => handleChange("projectDeadline", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
        value={formData.executionStartDate}
        onChangeText={(text) => handleChange("executionStartDate", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="End Date (YYYY-MM-DD)"
        value={formData.executionEndDate}
        onChangeText={(text) => handleChange("executionEndDate", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Number of Slots"
        keyboardType="numeric"
        value={formData.projectSlots}
        onChangeText={(text) => handleChange("projectSlots", text)}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.mentor}
          onValueChange={(itemValue) => handleChange("mentor", itemValue)}
          mode="dropdown"
          style={{
            height: 50,
            width: "100%",
            color: formData.mentor ? "#000" : "#999", // Gray if no mentor selected
          }}
        >
          <Picker.Item label="Select a Mentor" value="" />
          {mentors.map((mentor) => (
            <Picker.Item
              key={mentor._id}
              label={mentor.name}
              value={mentor._id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={handleImagePick}
        style={styles.imagePickerButton}
      >
        <Text style={styles.imagePickerText}>Pick Project Image</Text>
      </TouchableOpacity>

      {formData.projectImage && (
        <Image
          source={{ uri: formData.projectImage.uri }}
          style={styles.imagePreview}
        />
      )}

      <Button title="Create Project" onPress={handleSubmit} color="#007BFF" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 30,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: "500",
  },
  pickerContainer: {
  borderWidth: 1,
  borderColor: "#999",
  borderRadius: 5,
  marginBottom: 15,
  paddingHorizontal: 10,
  backgroundColor: "#f9f9f9",
  height: 50,
  justifyContent: "center",
},

  imagePickerButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  imagePickerText: {
    color: "white",
    fontWeight: "600",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default CreateProject;
