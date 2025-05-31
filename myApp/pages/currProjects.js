import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from 'buffer';
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";

const CurrentProject = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login.");
          navigation.navigate("Login");
          return;
        }

        // const decodedToken = jwtDecode(token);
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        
        const stuid = decodedToken.rollno;

        const [mentorsRes, projectsRes] = await Promise.all([
          axios.get("http://192.168.230.46:4000/vendor/mentors"),
          axios.get(`http://192.168.230.46:4000/vendor/userprojects/${stuid}`),
        ]);

        setMentors(mentorsRes.data);
        const fetchedProjects = projectsRes.data;
        setProjects(fetchedProjects);

        const attendanceData = {};

        for (const proj of fetchedProjects) {
          const executionStart = new Date(proj.executionStartDate);
          const today = new Date();

          if (executionStart <= today) {
            const daysSinceStart =
              Math.floor((today - executionStart) / (1000 * 60 * 60 * 24)) + 1;
            const daysToShow = Math.min(daysSinceStart, 7);

            const projectAttendance = [];

            for (let i = 0; i < daysToShow; i++) {
              const date = new Date(executionStart);
              date.setDate(date.getDate() + i);
              const formattedDate = date.toISOString().split("T")[0];

              try {
                const res = await axios.get(
                  `http://192.168.230.46:4000/api/attendance/${proj.pid}/${formattedDate}/${stuid}`
                );

                projectAttendance.push({
                  date: date.toLocaleDateString(),
                  status:
                    res.data?.attendanceStatus === true ? "Present" : "Absent",
                });
              } catch (err) {
                projectAttendance.push({
                  date: date.toLocaleDateString(),
                  status: "Not marked",
                });
              }
            }

            attendanceData[proj.pid] = projectAttendance;
          }
        }

        setAttendanceRecords(attendanceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  const findMentorName = (mentorId) => {
    const mentor = mentors.find((m) => String(m._id) === String(mentorId));
    return mentor ? mentor.name : "Unknown";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Your Applied Projects</Text>

      {projects.length === 0 ? (
        <Text style={styles.noProjects}>You have no projects assigned.</Text>
      ) : (
        projects.map((proj) => (
          <View key={proj.pid} style={styles.projectCard}>
            <Text style={styles.projectTitle}>{proj.title}</Text>
            <Text style={styles.projectText}>Project ID: {proj.pid}</Text>
            <Text style={styles.projectText}>
              Mentor: {findMentorName(proj.mentor)}
            </Text>
            <Text style={styles.projectText}>
              Start: {proj.executionStartDate}
            </Text>
            <Text style={styles.projectText}>End: {proj.executionEndDate}</Text>
            <Text style={styles.projectText}>Team ID: {proj.teamId}</Text>
          </View>
        ))
      )}

      {projects.some(
        (proj) => new Date(proj.executionStartDate) <= new Date()
      ) && (
        <>
          <Text style={styles.heading}>Your Attendance (Last 7 Days)</Text>
          {projects.map(
            (proj) =>
              new Date(proj.executionStartDate) <= new Date() && (
                <View key={proj.pid} style={styles.attendanceCard}>
                  <Text style={styles.subHeading}>{proj.title}</Text>
                  {attendanceRecords[proj.pid]?.map((att, index) => (
                    <View key={index} style={styles.attendanceRow}>
                      <Text style={styles.attendanceText}>{att.date}</Text>
                      <Text
                        style={[
                          styles.attendanceStatus,
                          att.status === "Present"
                            ? styles.present
                            : att.status === "Absent"
                            ? styles.absent
                            : styles.notMarked,
                        ]}
                      >
                        {att.status}
                      </Text>
                    </View>
                  ))}
                </View>
              )
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#1f1f1f",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 16,
  },
  noProjects: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 16,
  },
  projectCard: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  projectText: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  attendanceCard: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  attendanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  attendanceText: {
    color: "#ccc",
  },
  attendanceStatus: {
    fontWeight: "bold",
  },
  present: {
    color: "#28a745",
  },
  absent: {
    color: "#dc3545",
  },
  notMarked: {
    color: "#ffc107",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
  },
});

export default CurrentProject;
