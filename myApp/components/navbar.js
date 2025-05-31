// components/navbar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // install: react-native-vector-icons
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NavBar() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleProfile = () => {
    setModalVisible(false);
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AttendX</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
        <Icon name="person-circle-outline" size={30} color="#000" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity onPress={handleProfile} style={styles.menuItem}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  iconButton: {
    padding: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: 50,
    paddingRight: 10,
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    width: 150,
    elevation: 5,
  },
  menuItem: {
    padding: 10,
  },
  menuText: {
    fontSize: 16,
  },
});
