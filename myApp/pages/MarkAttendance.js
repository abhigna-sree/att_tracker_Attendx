import React, { useState } from "react";
import { View, Text, Button, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Alert } from "react-native";
import axios from "axios";
import StudentAttendance from "../components/StudentAttendance";
import { useRoute } from "@react-navigation/native";

const MarkAttendance = () => {
  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [showPopup, setShowPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isProjectFetched, setIsProjectFetched] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const route = useRoute();
  const { pid } = route.params;

  const fetchStudents = async () => {
    try {
      const { data: studentsList } = await axios.get(`http://192.168.230.46:4000/students/${pid}`);
      const updatedStudents = studentsList.map((student) => ({
        ...student,
        attendanceStatus: true,
        selectedClasses: [],
      }));
      setStudents(updatedStudents);
      setIsProjectFetched(true);
      setResetTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
    }
  };

  const fetchAttendance = async (selectedClassHours) => {
    if (!pid || !attendanceDate || selectedClassHours.length === 0) return null;

    try {
      const response = await axios.get(
        `http://192.168.230.46:4000/attendance?pid=${pid}&date=${attendanceDate}&classHours=${selectedClassHours.join(",")}`
      );
      return response.data;
    } catch (error) {
      console.warn("⚠ No matching attendance found.");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedClasses || selectedClasses.length === 0) {
      setShowWarningPopup(true);
      return;
    }

    try {
      const attendanceData = students.map((student) => ({
        rollNo: student.rollNo,
        pid,
        selectedClasses,
        date: attendanceDate,
        attendanceStatus: student.attendanceStatus === true,
      }));

      await axios.post("http://192.168.230.46:4000/api/attendance", { attendanceData });

      setShowPopup(true);
      setSelectedClasses([]);
      setResetTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Error submitting attendance:", error.response?.data || error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Student Attendance Management
      </Text>

      <TouchableOpacity onPress={fetchStudents} style={styles.fetchButton}>
        <Text style={{ color: "white" }}>Fetch Students</Text>
      </TouchableOpacity>

      {isProjectFetched && (
        <>
          <Text style={styles.label}>Select Attendance Date:</Text>
          <TextInput
            style={styles.largeDateInput}
            value={attendanceDate}
            onChangeText={(text) => setAttendanceDate(text)}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.label}>Select Class Hours:</Text>

          <StudentAttendance
            students={students}
            setStudents={setStudents}
            resetTrigger={resetTrigger}
            fetchAttendance={fetchAttendance}
            selectedClasses={selectedClasses}
            setSelectedClasses={setSelectedClasses}
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={{ color: "white" }}>Submit</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={showPopup} transparent animationType="slide">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text>✅ Attendance Submitted Successfully!</Text>
            <Button title="Close" onPress={() => setShowPopup(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={showWarningPopup} transparent animationType="slide">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text>⚠ Please select at least one class hour before submitting!</Text>
            <Button title="OK" onPress={() => setShowWarningPopup(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popupBox: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  fetchButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  submitButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  largeDateInput: {
    padding: 12,
    fontSize: 18,
    width: 250,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
});

export default MarkAttendance;
