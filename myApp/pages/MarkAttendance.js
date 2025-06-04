import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";
import StudentAttendance from "../components/StudentAttendance";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const MarkAttendance = () => {
  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [showPopup, setShowPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isProjectFetched, setIsProjectFetched] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const route = useRoute();
  const { pid } = route.params;

  const fetchStudents = async () => {
    try {
      const { data: studentsList } = await axios.get(
        `http://192.168.230.46:4000/students/${pid}`
      );
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
        `http://192.168.230.46:4000/attendance?pid=${pid}&date=${attendanceDate}&classHours=${selectedClassHours.join(
          ","
        )}`
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

      await axios.post("http://192.168.230.46:4000/api/attendance", {
        attendanceData,
      });

      setShowPopup(true);
      setSelectedClasses([]);
      setResetTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        "❌ Error submitting attendance:",
        error.response?.data || error.message
      );
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAttendanceDate(selectedDate.toISOString().split("T")[0]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Student Attendance Management</Text>

      <TouchableOpacity onPress={fetchStudents} style={styles.fetchButton}>
        <Text style={styles.buttonText}>Fetch Students</Text>
      </TouchableOpacity>

      {isProjectFetched && (
        <>
          <Text style={styles.label}>Select Attendance Date:</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              value={attendanceDate}
              onChangeText={(text) => setAttendanceDate(text)}
              placeholder="YYYY-MM-DD"
              editable={false}
            />
            <TouchableOpacity
              style={styles.calendarIcon}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={24} color="#3D52A0" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={attendanceDate ? new Date(attendanceDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}

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
            <Text style={styles.buttonText}>Submit</Text>
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
            <Text>
              ⚠ Please select at least one class hour before submitting!
            </Text>
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
    backgroundColor: "#EDE8F5",
    minHeight: "100%",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 250,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#3D52A0",
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  calendarIcon: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#3D52A0",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#000",
    width: "100%",
  },
  fetchButton: {
    padding: 12,
    backgroundColor: "#3D52A0",
    borderRadius: 5,
    marginBottom: 20,
    minWidth: 150,
    alignItems: "center",
  },
  submitButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#3D52A0",
    borderRadius: 5,
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
});

export default MarkAttendance;
