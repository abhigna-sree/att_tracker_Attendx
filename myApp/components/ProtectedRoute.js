import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProtectedRoute = ({ component: Component, allowedRoles, navigation, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          // Redirect to Login if no token
          navigation.replace('Login');
          return;
        }

        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        if (!allowedRoles.includes(userRole)) {
          // Redirect to Login if role not allowed
          navigation.replace('Login');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        navigation.replace('Login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    // Show loading indicator while checking token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!authorized) {
    return null; // Navigation replaced, no UI rendered
  }

  return <Component {...props} />;
};

export default ProtectedRoute;