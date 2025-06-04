import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useNavigation } from "@react-navigation/native";

const FacultyDashboard = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.navigate("Login");
          return;
        }

        const decodedToken = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        const facid = decodedToken.rollno;

        // Fetch user data
        const userResponse = await fetch(
          `http://192.168.230.46:4000/userdetails/${decodedToken.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch projects
        const projectResponse = await axios.get(
          `http://192.168.230.46:4000/vendor/getFacProjects/${facid}`
        );
        const currentDate = new Date();
        const filteredProjects = projectResponse.data.filter(
          (proj) => new Date(proj.executionEndDate) >= currentDate
        );
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigation]);

  const goToCreateProject = () => navigation.navigate("CreateProject");
  const goToStudents = (pid) =>
    navigation.navigate("StudentsRegistered", { pid });
  const goToMarkAttendance = (pid) =>
    navigation.navigate("MarkAttendance", { pid });

  return (
    <ScrollView contentContainerStyle={styles.fullScreen}>
      <Text style={styles.stuname}>
        Welcome, {user ? `${user.name} (${user.role})` : "Faculty"}
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
      </View>

      <View style={styles.projectSection}>
        <Text style={styles.cardTitle}>Manage Your Projects</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3D52A0" />
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <View key={project.pid} style={styles.projectItem}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDescription}>
                {project.description}
              </Text>
              <Text>
                Start:{" "}
                {new Date(project.executionStartDate).toLocaleDateString()}
              </Text>
              <Text>
                End: {new Date(project.executionEndDate).toLocaleDateString()}
              </Text>
              <Text style={styles.slots}>Available Slots: {project.slots}</Text>
              <View style={styles.projectActions}>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "#3D52A0" }]}
                  onPress={() => goToStudents(project.pid)}
                >
                  <Text style={styles.btnText}>View Students</Text>
                </TouchableOpacity>
                {new Date() >= new Date(project.executionStartDate) && (
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#28a745" }]}
                    onPress={() => goToMarkAttendance(project.pid)}
                  >
                    <Text style={styles.btnText}>Mark Attendance</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.cardText}>No projects found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flexGrow: 1,
    backgroundColor: "#EDE8F5",
    padding: 20,
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
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  projectDescription: {
    marginBottom: 8,
    color: "#666",
  },
  slots: {
    color: "#dc3545",
    marginVertical: 5,
  },
  projectActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    gap: 10,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
});

export default FacultyDashboard;
