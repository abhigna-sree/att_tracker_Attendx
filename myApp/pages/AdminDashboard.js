import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://192.168.230.46:4000/vendor/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });

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

        if (decodedToken.role !== "admin") {
          console.log("Unauthorized access, redirecting...");
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

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const goToCreateProject = () => navigation.navigate("CreateProject");
  const goToUploadFaculty = () => navigation.navigate("UploadFaculty");
  const viewProfile = () => navigation.navigate("AdminAttendancePage");

  const deleteProject = (id) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            fetch(`http://192.168.230.46:4000/vendor/projects/${id}`, {
              method: "DELETE",
            })
              .then((response) => response.json())
              .then(() => {
                setProjects((prevProjects) =>
                  prevProjects.filter((project) => project._id !== id)
                );
              })
              .catch((error) =>
                console.error("Error deleting project:", error)
              );
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.fullScreen}>
      <View style={styles.container1}>
        <Text style={styles.stuname}>
          Welcome, {user ? `${user.name} (${user.role})` : "User"}
        </Text>
        <View style={styles.cardRow}>
          <View style={styles.cardbg}>
            <Text style={styles.cardTitle}>New Project</Text>
            <Text style={styles.cardText}>
              Create a new project and assign details
            </Text>
            <TouchableOpacity style={styles.btncss} onPress={goToCreateProject}>
              <Text style={styles.btnText}>+ Create Project</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardbg}>
            <Text style={styles.cardTitle}>Upload Faculty</Text>
            <Text style={styles.cardText}>
              Upload faculty details in JSON format only.
            </Text>
            <TouchableOpacity style={styles.btncss} onPress={goToUploadFaculty}>
              <Text style={styles.btnText}>+ Upload</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardbg}>
            <Text style={styles.cardTitle}>Attendance Details</Text>
            <Text style={styles.cardText}>Attendance details of students</Text>
            <TouchableOpacity style={styles.btncss} onPress={viewProfile}>
              <Text style={styles.btnText}>View →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.projectSection}>
          <Text style={styles.cardTitle}>Manage Existing Projects</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#3D52A0" />
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <View key={project._id} style={styles.projectItem}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <View style={styles.projectActions}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#f0ad4e" }]}
                    onPress={() =>
                      navigation.navigate("EditProject", { id: project._id })
                    }
                  >
                    <Text style={styles.btnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#d9534f" }]}
                    onPress={() => deleteProject(project._id)}
                  >
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.cardText}>No projects found.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  fullScreen: {
    flexGrow: 1,
    backgroundColor: "#EDE8F5",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  container1: {
    backgroundColor: "#EDE8F5",
    padding: 20,
    width: "100%",
  },
  stuname: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  cardbg: {
    backgroundColor: "#ADBBDA",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 300,
    margin: 10,
    alignItems: "center",
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  btncss: {
    backgroundColor: "#3D52A0",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "60%",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
  projectSection: {
    marginTop: 20,
    padding: 10,
  },
  projectItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectActions: {
    flexDirection: "row",
    gap: 10,
  },
  projectItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  projectActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallBtn: {
    backgroundColor: "#3D52A0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});
