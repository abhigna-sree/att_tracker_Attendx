// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import StuDashboard from './pages/StuDashboard';
// import Projects from './pages/Projects';
// import Profile from './pages/Profile';
// import AdminDashboard from './pages/AdminDashboard';
// import CreateProject from './pages/CreateProject';
// // import EditProject from './pages/EditProject';
// import UploadUsers from './pages/UploadFaculty';
// import FacultyDashboard from './pages/FacultyDashboard';
// import MarkAttendance from './pages/MarkAttendance';
// import StudentsRegistered from './pages/StudentsRegistered';
// import ApplyProject from './pages/ApplyProject';
// import CurrentProject from './pages/currProjects';
// import AdminAttendancePage from './pages/AdminAttendancePage';

// import NavBar from './components/navbar'; 
// // import ProtectedRoute from './components/ProtectedRoute';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
//         {/* Public Routes */}
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen name="Signup" component={Signup} />

//         {/* Student Protected Routes */}
//         <Stack.Screen name="stuDashboard" component={StuDashboard} />
//         <Stack.Screen name="Projects" component={Projects} />
//         <Stack.Screen name="Apply" component={ApplyProject} /> 
//         <Stack.Screen name="CurrentProject" component={CurrentProject} />

//         {/* Faculty Protected Routes */}
//         <Stack.Screen name="facultyDashboard" component={FacultyDashboard} />
//         <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
//         <Stack.Screen name="StudentsRegistered" component={StudentsRegistered} />  

//         {/* Admin Protected Routes */}
//         <Stack.Screen name="adminDashboard" component={AdminDashboard} />
//         <Stack.Screen name="CreateProject" component={CreateProject} />
//         {/* <Stack.Screen name="EditProject" component={EditProject} />  */}
//         <Stack.Screen name="UploadFaculty" component={UploadUsers} />
//         <Stack.Screen name="AdminAttendancePage" component={AdminAttendancePage} />

//         {/* Common */}
//         <Stack.Screen name="Profile" component={Profile} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// App.js (React Native version)
// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Buffer } from 'buffer';
// import { navigationRef } from './NavigationService';

// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import StuDashboard from './pages/StuDashboard';
// import Projects from './pages/Projects';
// import Profile from './pages/Profile';
// import AdminDashboard from './pages/AdminDashboard';
// import CreateProject from './pages/CreateProject';
// // import EditProject from './pages/EditProject';
// import UploadUsers from './pages/UploadFaculty';
// import FacultyDashboard from './pages/FacultyDashboard';
// import MarkAttendance from './pages/MarkAttendance';
// import StudentsRegistered from './pages/StudentsRegistered';
// import ApplyProject from './pages/ApplyProject';
// import CurrentProject from './pages/currProjects';
// import AdminAttendancePage from './pages/AdminAttendancePage';
// // import NavBar from './components/navbar';


// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentRoute, setCurrentRoute] = useState(null);
//   useEffect(() => {
//     const checkToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token) {
//           const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
//           setUserRole(decoded.role);
//         }
//       } catch (e) {
//         console.error('Error decoding token:', e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkToken();
//   }, []);

//   if (loading) return null;

//   const hideNavOnPages = ['Login', 'Signup'];
//   const shouldShowNav = currentRoute && !hideNavOnPages.includes(currentRoute);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* Public */}
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen name="Signup" component={Signup} />
//         <Stack.Screen name="Profile" component={Profile} />
//         {/* <Stack.Screen name="navbar" component={NavBar} /> */}

//         {/* Student Routes */}
//         {userRole === 'student' && (
//           <>
//             <Stack.Screen name="stuDashboard" component={StuDashboard} />
//             <Stack.Screen name="Projects" component={Projects} />
//             <Stack.Screen name="Apply" component={ApplyProject} />
//             <Stack.Screen name="CurrentProject" component={CurrentProject} />
//           </>
//         )}

//         {/* Faculty Routes */}
//         {userRole === 'faculty' && (
//           <>
//             <Stack.Screen name="facultyDashboard" component={FacultyDashboard} />
//             <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
//             <Stack.Screen name="StudentsRegistered" component={StudentsRegistered} />
//           </>
//         )}

//         {/* Admin Routes */}
//         {userRole === 'admin' && (
//           <>
//             <Stack.Screen name="adminDashboard" component={AdminDashboard} />
//             <Stack.Screen name="CreateProject" component={CreateProject} />
//             {/* <Stack.Screen name="EditProject" component={EditProject} /> */}
//             <Stack.Screen name="UploadFaculty" component={UploadUsers} />
//             <Stack.Screen name="AdminAttendancePage" component={AdminAttendancePage} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

import Login from './pages/Login';
import Signup from './pages/Signup';
import StuDashboard from './pages/StuDashboard';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CreateProject from './pages/CreateProject';
import UploadUsers from './pages/UploadFaculty';
import FacultyDashboard from './pages/FacultyDashboard';
import MarkAttendance from './pages/MarkAttendance';
import StudentsRegistered from './pages/StudentsRegistered';
import ApplyProject from './pages/ApplyProject';
import CurrentProject from './pages/currProjects';
import AdminAttendancePage from './pages/AdminAttendancePage';
// import NavBar from './components/navbar';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          setUserRole(decoded.role);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) return null; // or show a splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Public Routes */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Profile" component={Profile} />

        {/* Student Routes */}
        {userRole === 'student' && (
          <>
            <Stack.Screen name="stuDashboard" component={StuDashboard} />
            <Stack.Screen name="Projects" component={Projects} />
            <Stack.Screen name="Apply" component={ApplyProject} />
            <Stack.Screen name="CurrentProject" component={CurrentProject} />
          </>
        )}

        {/* Faculty Routes */}
        {userRole === 'faculty' && (
          <>
            <Stack.Screen name="facultyDashboard" component={FacultyDashboard} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
            <Stack.Screen name="StudentsRegistered" component={StudentsRegistered} />
          </>
        )}

        {/* Admin Routes */}
        {userRole === 'admin' && (
          <>
            <Stack.Screen name="adminDashboard" component={AdminDashboard} />
            <Stack.Screen name="CreateProject" component={CreateProject} />
            <Stack.Screen name="UploadFaculty" component={UploadUsers} />
            <Stack.Screen name="AdminAttendancePage" component={AdminAttendancePage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
