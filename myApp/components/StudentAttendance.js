import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const StudentAttendance = ({
  students,
  setStudents,
  resetTrigger,
  fetchAttendance,
  selectedClasses,
  setSelectedClasses
}) => {
  useEffect(() => {
    setSelectedClasses([]);
  }, [resetTrigger]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (selectedClasses.length === 0) return;

      const fetchedData = await fetchAttendance(selectedClasses);
      if (fetchedData?.length > 0) {
        setStudents((prev) =>
          prev.map((student) => {
            const match = fetchedData.find((rec) => rec.rollNo === student.rollNo);
            return match
              ? {
                  ...student,
                  attendanceStatus: match.attendanceStatus,
                  selectedClasses: match.selectedClasses || [],
                }
              : student;
          })
        );
      }
    };

    loadAttendance();
  }, [selectedClasses]);

  const toggleClassHour = (hour) => {
    setSelectedClasses((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    );
  };

  const toggleStudentAttendance = (rollNo) => {
    setStudents((prev) =>
      prev.map((s) => (s.rollNo === rollNo ? { ...s, attendanceStatus: !s.attendanceStatus } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendanceStatus: status })));
  };

  return (
    <ScrollView>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5, 6, 7].map((hour) => (
          <TouchableOpacity
            key={hour}
            onPress={() => toggleClassHour(hour)}
            style={[
              styles.circleButton,
              {
                backgroundColor: selectedClasses.includes(hour) ? "blue" : "white",
              },
            ]}
          >
            <Text style={{ color: selectedClasses.includes(hour) ? "white" : "black" }}>{hour}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Mark Attendance</Text>

      <ScrollView contentContainerStyle={styles.row}>
        {students.map((s) => (
          <TouchableOpacity
            key={s.rollNo}
            onPress={() => toggleStudentAttendance(s.rollNo)}
            style={[
              styles.circleButton,
              { backgroundColor: s.attendanceStatus ? "green" : "red" },
            ]}
          >
            <Text style={{ color: "white" }}>{s.rollNo.slice(-3)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <TouchableOpacity onPress={() => markAll(true)} style={styles.greenButton}>
          <Text style={{ color: "white" }}>Mark All Present</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => markAll(false)} style={styles.redButton}>
          <Text style={{ color: "white" }}>Mark All Absent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={[styles.countBox, { backgroundColor: "green" }]}>
          <Text style={{ color: "white" }}>✔ {students.filter((s) => s.attendanceStatus).length}</Text>
        </View>
        <View style={[styles.countBox, { backgroundColor: "red" }]}>
          <Text style={{ color: "white" }}>✘ {students.filter((s) => !s.attendanceStatus).length}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
  flexDirection: "row",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 15,
  rowGap: 10, // optional via workaround or margin
},
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  greenButton: {
    padding: 8,
    backgroundColor: "green",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  redButton: {
    padding: 8,
    backgroundColor: "red",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  countBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
});

export default StudentAttendance;
