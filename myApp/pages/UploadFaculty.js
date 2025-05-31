import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

const UploadUsers = () => {
  const [jsonText, setJsonText] = useState(""); // user will paste JSON here
  const [message, setMessage] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("No token found, redirecting to login.");
        navigation.navigate("Login");
        return;
      }
      try {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        if (decodedToken.role !== "admin") {
          console.log("Unauthorized access, redirecting...");
          navigation.navigate("Login");
          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleUpload = async () => {
    if (!jsonText) {
      setMessage("Please enter valid JSON content.");
      return;
    }

    let jsonObj;
    try {
      jsonObj = JSON.parse(jsonText);
    } catch {
      setMessage("Invalid JSON format.");
      return;
    }

    try {
      const res = await axios.post(
        "http://192.168.230.46:4000/vendor/uploadusers",
        jsonObj,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage(res.data.message || "Upload successful!");
    } catch (error) {
      setMessage("Error uploading JSON data.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paste JSON content of users</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}

      <TextInput
        multiline
        numberOfLines={10}
        placeholder="Paste your JSON here"
        value={jsonText}
        onChangeText={setJsonText}
        style={styles.textInput}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE8F5',  // Light lavender-ish, like your .container1
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#3D52A0', // Dark blue like .carbut background but for text
    marginBottom: 25,
    textAlign: 'center',
  },
  message: {
    marginBottom: 18,
    color: 'black',  // black text on light background for visibility
    fontSize: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#ADBBDA', // same as .admincard background
    borderRadius: 15,
    paddingVertical: 44,
    paddingHorizontal: 25,
    minWidth: 230,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  fileButtonText: {
    color: 'black',  // black text on light button background
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#3D52A0', // your .carbut blue background
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 25,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000080',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});


export default UploadUsers;
