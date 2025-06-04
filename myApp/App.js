import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { Alert, View } from "react-native";
import Navbar from "./components/navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StuDashboard from "./pages/StuDashboard";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProject from "./pages/CreateProject";
import UploadUsers from "./pages/UploadFaculty";
import FacultyDashboard from "./pages/FacultyDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import StudentsRegistered from "./pages/StudentsRegistered";
import ApplyProject from "./pages/ApplyProject";
import CurrentProject from "./pages/currProjects";
import AdminAttendancePage from "./pages/AdminAttendancePage";
// import NavBar from './components/navbar';

const Stack = createNativeStackNavigator();

// Define which screens should not show navbar
const hideNavbarScreens = ["Login", "Signup"];

// Custom wrapper component to handle navbar visibility
const ScreenWrapper = ({ children, route }) => {
  const shouldShowNavbar = !hideNavbarScreens.includes(route.name);

  return (
    <View style={{ flex: 1 }}>
      {shouldShowNavbar && <Navbar />}
      {children}
    </View>
  );
};

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
          );
          setUserRole(decoded.role);

          // Set initial route based on role
          switch (decoded.role) {
            case "student":
              setInitialRoute("stuDashboard");
              break;
            case "faculty":
              setInitialRoute("facultyDashboard");
              break;
            case "admin":
              setInitialRoute("adminDashboard");
              break;
            default:
              setInitialRoute("Login");
          }
        }
      } catch (e) {
        console.error("Error initializing app:", e);
        setUserRole(null);
        setInitialRoute("Login");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return null;
  }

  const handleNavigationError = (error) => {
    console.error("Navigation error:", error);
    Alert.alert(
      "Navigation Error",
      "There was an error navigating to the screen. Please try again.",
      [{ text: "OK" }]
    );
  };

  // Define all routes regardless of user role
  const allRoutes = [
    // Public Routes
    { name: "Login", component: Login },
    { name: "Signup", component: Signup },
    { name: "Profile", component: Profile },

    // Student Routes
    { name: "stuDashboard", component: StuDashboard },
    { name: "Projects", component: Projects },
    { name: "Apply", component: ApplyProject },
    { name: "CurrentProject", component: CurrentProject },

    // Faculty Routes
    { name: "facultyDashboard", component: FacultyDashboard },
    { name: "MarkAttendance", component: MarkAttendance },
    { name: "StudentsRegistered", component: StudentsRegistered },
    { name: "CreateProject", component: CreateProject },

    // Admin Routes
    { name: "adminDashboard", component: AdminDashboard },
    // { name: "CreateProject", component: CreateProject },
    { name: "UploadFaculty", component: UploadUsers },
    { name: "AdminAttendancePage", component: AdminAttendancePage },
  ];

  return (
    <NavigationContainer
      onStateChange={(state) => {
        if (state) {
          AsyncStorage.setItem("navigationState", JSON.stringify(state)).catch(
            (error) => console.error("Error saving navigation state:", error)
          );
        }
      }}
      onError={handleNavigationError}
    >
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animationEnabled: true,
          presentation: "card",
        }}
      >
        {allRoutes.map(({ name, component: Component }) => (
          <Stack.Screen key={name} name={name}>
            {(props) => (
              <ScreenWrapper route={props.route}>
                <Component {...props} />
              </ScreenWrapper>
            )}
          </Stack.Screen>
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
