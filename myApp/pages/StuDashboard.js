import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';
import jwtDecode from 'jwt-decode';

const StuDashboard = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("No token found, redirecting to login.");
        navigation.navigate("Login");
        return;
      }

      try {
        // const decodedToken = jwtDecode(token);
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        // console.log("Decoded Token:", decodedToken);

        const userId = decodedToken.id;
        const response = await fetch(`http://192.168.230.46:4000/userdetails/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigation]);

  const Card = ({ image, title, description, onPress }) => (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text>{description}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>View →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container1}>
        <Text style={styles.welcomeText}>Welcome, {user ? `${user.name} (${user.role})` : "User"}</Text>
        <Text style={styles.subheading}>Explore projects & opportunities!</Text>
        <View style={styles.cardContainer}>
          <Card
            image={require('../assets/ap.webp')}
            title="Available Projects"
            description="Browse and pick projects. First come, first served!"
            onPress={() => navigation.navigate("Projects")}
          />
          <Card
            image={require('../assets/rp.jpg')}
            title="Registered Projects"
            description="Check and modify your registered projects."
            onPress={() => navigation.navigate("CurrentProject")}
          />
          <Card
            image={require('../assets/sp1.png')}
            title="Student Profile"
            description="View and update your details."
            onPress={() => navigation.navigate("Profile")}
          />
        </View>
      </View>

      <View style={styles.recommendedSection}>
        <Text style={styles.recommendHeading}>Recommended Projects</Text>
        {[
          {
            img: require('../assets/p1.jpg'),
            title: "Jewelry Design Generation",
            text: "Upload a basic sketch and generate realistic jewelry designs using AI."
          },
          {
            img: require('../assets/p2.jpg'),
            title: "Machine Learning for Healthcare",
            text: "Develop AI models to predict diseases and improve diagnostics."
          },
          {
            img: require('../assets/p3.jpg'),
            title: "Interactive Web Development",
            text: "Build responsive and dynamic web applications using MERN stack."
          }
        ].map((item, index) => (
          <View key={index} style={styles.recommendCard}>
            <Image source={item.img} style={styles.recommendImage} />
            <View style={styles.recommendTextBox}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text>{item.text}</Text>
              <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Apply Now clicked")}>
                <Text style={styles.buttonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
  },
  container1: {
    backgroundColor: '#EDE8F5',
    padding: 20,
    alignItems: 'center'
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 15,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#ADBBDA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  cardImage: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3D52A0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  recommendedSection: {
    backgroundColor: '#000',
    padding: 20,
  },
  recommendHeading: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  recommendCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  recommendImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  recommendTextBox: {
    paddingTop: 10,
  },
});

export default StuDashboard;
