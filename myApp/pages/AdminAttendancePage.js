import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";

const AdminAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const res = await axios.get(
        "http://192.168.230.46:4000/api/admin/active-attendance"
      );
      setAttendanceData(res.data);
    } catch (err) {
      console.error("Error fetching attendance", err);
      Alert.alert("Error", "Failed to fetch attendance data");
    }
  };

  const generateExcelContent = () => {
    // Create CSV content
    let csvContent = "Project ID,Project Title,Roll No,Status\n";

    attendanceData.forEach((project) => {
      project.students.forEach((student) => {
        csvContent += `${project.pid},${project.title},${student.rollNo},${student.attendanceStatus ? "Present" : "Absent"}\n`;
      });
    });

    return csvContent;
  };

  const downloadAttendance = async () => {
    try {
      setLoading(true);
      const csvContent = generateExcelContent();
      const fileName = `attendance_${
        new Date().toISOString().split("T")[0]
      }.csv`;

      if (Platform.OS === "web") {
        // For web platform
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      } else {
        // For mobile platforms
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Download Attendance Sheet",
          UTI: "public.comma-separated-values-text",
        });
      }

      Alert.alert("Success", "Attendance sheet has been downloaded!");
    } catch (error) {
      console.error("Error downloading attendance:", error);
      Alert.alert("Error", "Failed to download attendance sheet");
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.rollNo}</Text>
      <Text
        style={[
          styles.cell,
          item.attendanceStatus ? styles.present : styles.absent,
        ]}
      >
        {item.attendanceStatus ? "Present" : "Absent / Not marked"}
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Attendance Details of the Day</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={downloadAttendance}
          disabled={loading}
        >
          <Ionicons name="download-outline" size={24} color="white" />
          <Text style={styles.downloadButtonText}>
            {loading ? "Downloading..." : "Download Sheet"}
          </Text>
        </TouchableOpacity>
      </View>

      {attendanceData.map((project) => (
        <View key={project.pid} style={styles.card}>
          <Text style={styles.projectTitle}>
            {project.title} ({project.pid})
          </Text>

          <View style={styles.table}>
            <View style={styles.rowHeader}>
              <Text style={[styles.cell, styles.headerCell]}>Roll No</Text>
              <Text style={[styles.cell, styles.headerCell]}>Status</Text>
            </View>

            <FlatList
              data={project.students}
              renderItem={renderStudent}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EDE8F5",
    padding: 16,
    minHeight: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Arial",
    color: "#000",
    flex: 1,
  },
  downloadButton: {
    backgroundColor: "#3D52A0",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  downloadButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ADBBDA",
    margin: 10,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3D52A0",
    marginBottom: 12,
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#343a40",
  },
  cell: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#dee2e6",
    textAlign: "center",
    fontFamily: "Arial",
  },
  headerCell: {
    color: "#fff",
    fontWeight: "bold",
  },
  present: {
    backgroundColor: "#d4edda",
  },
  absent: {
    backgroundColor: "#f8d7da",
  },
});

export default AdminAttendancePage;
