import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useNavigation } from "@react-navigation/native";

const Projects = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login.");
          navigation.navigate("Login");
          return;
        }

        const [projectsRes, mentorsRes] = await Promise.all([
          fetch("http://192.168.230.46:4000/vendor/projects"),
          fetch("http://192.168.230.46:4000/vendor/mentors"),
        ]);

        const projectsData = await projectsRes.json();
        const mentorsData = await mentorsRes.json();

        setProjects(projectsData);
        setMentors(mentorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigation]);

  const applyForProject = (projectId) => {
    navigation.navigate("Apply", { projectId });
  };

  const findMentorName = (mentorId) => {
    const mentor = mentors.find((m) => String(m._id) === String(mentorId));
    return mentor ? mentor.name : "Unknown";
  };

  const filteredProjects = projects.filter(
    (proj) =>
      proj.title.toLowerCase().includes(search.toLowerCase()) &&
      proj.slots > 0 &&
      new Date(proj.deadline) >= new Date()
  );

  const renderProject = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `http://192.168.230.46:4000/uploads/${item.image}` }}
        style={styles.image}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardText}>{item.description}</Text>
        <Text style={styles.cardText}>
          Registration Deadline: {item.deadline}
        </Text>
        <Text style={styles.cardText}>
          Execution Start Date: {item.executionStartDate}
        </Text>
        <Text style={styles.cardText}>
          Execution End Date: {item.executionEndDate}
        </Text>
        <Text style={styles.cardText}>Slots left: {item.slots}</Text>
        <Text style={styles.cardText}>
          Mentor: {findMentorName(item.mentor)}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => applyForProject(item.pid)}
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={filteredProjects}
      keyExtractor={(item) => item.pid.toString()}
      renderItem={renderProject}
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>Available Projects</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
        </>
      }
      ListEmptyComponent={
        <Text style={styles.noProjectsText}>No projects found.</Text>
      }
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#EDE8F5",
    minHeight: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#000",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#3D52A0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#ADBBDA",
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  cardText: {
    marginBottom: 4,
    color: "#000",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#3D52A0",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noProjectsText: {
    textAlign: "center",
    marginTop: 16,
    color: "#000",
  },
});

export default Projects;
