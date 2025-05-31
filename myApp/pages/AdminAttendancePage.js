import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import axios from "axios";

const AdminAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    axios
      .get("http://192.168.230.46:4000/api/admin/active-attendance")
      .then((res) => {
        setAttendanceData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching attendance", err);
      });
  }, []);

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
      <Text style={styles.header}>Attendance Details of the Day</Text>

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
  header: {
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 16,
    fontFamily: "Arial",
    color: "#000",
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
