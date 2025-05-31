import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';

const FacultyDashboard = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      const facid = decodedToken.rollno;

      axios
        .get(`http://192.168.230.46:4000/vendor/getFacProjects/${facid}`)
        .then((response) => {
          const currentDate = new Date();
          const filteredProjects = response.data.filter(
            (proj) => new Date(proj.executionEndDate) >= currentDate
          );
          setProjects(filteredProjects);
        })
        .catch((error) => {
          console.error('Error fetching projects:', error);
          Alert.alert('Error', 'Failed to fetch projects');
        });
    };
    fetchUserData();
  }, [navigation]);

  const getstudents = (pid) => {
    navigation.navigate('StudentsRegistered', { pid });
  };

  const markAttendance = (pid) => {
    navigation.navigate('MarkAttendance', { pid });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Available Projects</Text>
      {projects.length > 0 ? (
        projects.map((proj, index) => {
          const currentDate = new Date();
          const startDate = new Date(proj.executionStartDate);
          const endDate = new Date(proj.executionEndDate);

          return (
            <View key={index} style={styles.card}>
              <Text style={styles.title}>{proj.title}</Text>
              <Text style={styles.description}>{proj.description}</Text>
              <Text>Execution Start Date: {startDate.toISOString().split('T')[0]}</Text>
              <Text>Execution End Date: {endDate.toISOString().split('T')[0]}</Text>
              <Text style={styles.slots}>Slots left: {proj.slots}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => getstudents(proj.pid)}>
                  <Text style={styles.btnText}>Get Registered Students</Text>
                </TouchableOpacity>
                {currentDate >= startDate && (
                  <TouchableOpacity style={styles.successBtn} onPress={() => markAttendance(proj.pid)}>
                    <Text style={styles.btnText}>Mark Attendance</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.noProjects}>No projects found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    marginBottom: 8,
  },
  slots: {
    color: 'red',
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  successBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  noProjects: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
});

export default FacultyDashboard;
