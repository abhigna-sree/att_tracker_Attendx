import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const StudentsRegistered = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { pid } = route.params;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.navigate("Login");
          return;
        }

        const decodedToken = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        const response = await axios.get(
          `http://192.168.230.46:4000/vendor/studentsRegistered/${pid}`
        );

        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [pid, navigation]);

  const handleSort = (column) => {
    const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(order);
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortColumn) return 0;
    // To handle undefined or null values safely
    const aVal = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
    const bVal = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredStudents = sortedStudents.filter((student) =>
    Object.values(student).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {[
        { label: "Roll No", key: "rollno" },
        { label: "Name", key: "name" },
        { label: "Department", key: "department" },
      ].map(({ label, key }) => (
        <TouchableOpacity
          key={key}
          style={styles.headerCell}
          onPress={() => handleSort(key)}
        >
          <Text style={styles.headerText}>{label}</Text>
          <Ionicons size={16} color="gray" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.rollno}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.department}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students Registered for Project {pid}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search students"
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0d6efd" />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#EDE8F5",
    minHeight: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
    color: "#000",
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#3D52A0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#ADBBDA",
    borderRadius: 10,
    marginBottom: 5,
    elevation: 3,
  },
  headerCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 5,
    paddingVertical: 12,
    elevation: 2,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 8,
    color: "#000",
  },
});

export default StudentsRegistered;
