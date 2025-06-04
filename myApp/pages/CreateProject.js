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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Buffer } from "buffer";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const CreateProject = () => {
  const navigation = useNavigation();
  const [mentors, setMentors] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState({
    deadline: false,
    startDate: false,
    endDate: false,
  });

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

        if (decoded.role !== "admin" && decoded.role !== "faculty") {
          Alert.alert("Unauthorized", "Access denied. Redirecting...");
          navigation.navigate("Login");
          return;
        }

        setUserRole(decoded.role);

        // If user is faculty, set them as the mentor
        if (decoded.role === "faculty") {
          setFormData((prev) => ({
            ...prev,
            mentor: decoded.id, // Set the faculty's ID as the mentor
          }));
        }
      } catch (error) {
        console.error("Token decode error:", error);
      }
    };

    fetchUserData();

    // Only fetch mentors list if user is admin
    const fetchMentors = async () => {
      try {
        const response = await axios.get(
          "http://192.168.230.46:4000/vendor/mentors"
        );
        setMentors(response.data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentors();
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

  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker((prev) => ({ ...prev, [field]: false }));
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleChange(
        field === "deadline"
          ? "projectDeadline"
          : field === "startDate"
          ? "executionStartDate"
          : "executionEndDate",
        formattedDate
      );
    }
  };

  const showDatepicker = (field) => {
    setShowDatePicker((prev) => ({ ...prev, [field]: true }));
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
      // Navigate based on user role
      navigation.navigate(
        userRole === "admin" ? "adminDashboard" : "facultyDashboard"
      );
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

      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Registration Deadline (YYYY-MM-DD)"
          value={formData.projectDeadline}
          onChangeText={(text) => handleChange("projectDeadline", text)}
          editable={false}
        />
        <TouchableOpacity
          style={styles.calendarIcon}
          onPress={() => showDatepicker("deadline")}
        >
          <Ionicons name="calendar" size={24} color="#3D52A0" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Start Date (YYYY-MM-DD)"
          value={formData.executionStartDate}
          onChangeText={(text) => handleChange("executionStartDate", text)}
          editable={false}
        />
        <TouchableOpacity
          style={styles.calendarIcon}
          onPress={() => showDatepicker("startDate")}
        >
          <Ionicons name="calendar" size={24} color="#3D52A0" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="End Date (YYYY-MM-DD)"
          value={formData.executionEndDate}
          onChangeText={(text) => handleChange("executionEndDate", text)}
          editable={false}
        />
        <TouchableOpacity
          style={styles.calendarIcon}
          onPress={() => showDatepicker("endDate")}
        >
          <Ionicons name="calendar" size={24} color="#3D52A0" />
        </TouchableOpacity>
      </View>

      {showDatePicker.deadline && (
        <DateTimePicker
          value={
            formData.projectDeadline
              ? new Date(formData.projectDeadline)
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleDateChange(event, date, "deadline")}
        />
      )}

      {showDatePicker.startDate && (
        <DateTimePicker
          value={
            formData.executionStartDate
              ? new Date(formData.executionStartDate)
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleDateChange(event, date, "startDate")}
        />
      )}

      {showDatePicker.endDate && (
        <DateTimePicker
          value={
            formData.executionEndDate
              ? new Date(formData.executionEndDate)
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleDateChange(event, date, "endDate")}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Number of Slots"
        keyboardType="numeric"
        value={formData.projectSlots}
        onChangeText={(text) => handleChange("projectSlots", text)}
      />

      {userRole === "admin" && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.mentor}
            onValueChange={(itemValue) => handleChange("mentor", itemValue)}
            mode="dropdown"
            style={{
              height: 50,
              width: "100%",
              color: formData.mentor ? "#000" : "#999",
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
      )}

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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Project</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#EDE8F5",
    minHeight: "100%",
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
    backgroundColor: "#fff",
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
    backgroundColor: "#3D52A0",
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
  submitButton: {
    backgroundColor: "#3D52A0",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  dateInput: {
    flex: 1,
    padding: 10,
    color: "#000",
  },
  calendarIcon: {
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#999",
  },
});

export default CreateProject;
