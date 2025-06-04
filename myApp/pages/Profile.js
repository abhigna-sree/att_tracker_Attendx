import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

const Profile = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login.");
        navigation.navigate("Login");
        return;
      }

      try {
        const decodedToken = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );

        if (!["student", "faculty", "admin"].includes(decodedToken.role)) {
          navigation.navigate("Login");
          return;
        }
        const userId = decodedToken.id;
        const response = await fetch(
          `http://192.168.230.46:4000/userdetails/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigation]);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setMessage("❌ Not authenticated. Please login again.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(
        `http://192.168.230.46:4000/vendor/updatePwd`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user._id, oldPassword, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage("❌ " + (data.message || "Failed to update password"));
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("❌ Error updating password. Please try again.");
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Name</Text>
            <Text style={styles.tableData}>{user.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Roll No</Text>
            <Text style={styles.tableData}>{user.rollno}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Phone</Text>
            <Text style={styles.tableData}>{user.phone}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Role</Text>
            <View style={{ flex: 2, alignItems: "flex-start" }}>
              <View
                style={[
                  styles.badge,
                  user.role === "admin"
                    ? styles.badgeDanger
                    : user.role === "faculty"
                    ? styles.badgePrimary
                    : styles.badgeSuccess,
                ]}
              >
                <Text style={styles.badgeText}>{user.role}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.subHeading}>Update Password</Text>

        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Old Password"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
        </View>
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePasswordUpdate}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>

        {message !== "" && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#EDE8F5",
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  tableHeader: {
    flex: 1,
    fontWeight: "600",
    color: "#495057",
  },
  tableData: {
    flex: 2,
    color: "#212529",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "white",
    fontWeight: "600",
  },
  badgeDanger: {
    backgroundColor: "#dc3545",
  },
  badgePrimary: {
    backgroundColor: "#0d6efd",
  },
  badgeSuccess: {
    backgroundColor: "#198754",
  },
  formGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#0d6efd",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  messageBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#e9ecef",
    borderRadius: 5,
  },
  messageText: {
    color: "#212529",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Profile;
