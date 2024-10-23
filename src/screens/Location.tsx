// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, PermissionsAndroid, Platform, Alert } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';

// // Helper function to calculate the area of a triangle using its corner points (latitude/longitude)
// const calculateArea = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
//   return Math.abs((x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2)) / 2.0);
// };

// // Function to check if point is inside a quadrilateral
// const isInsideQuadrilateral = (latitude: number, longitude: number, corners: any) => {
//   const [A, B, C, D] = corners; // Corners of the quadrilateral

//   // Calculate the total area of the quadrilateral
//   const quadrilateralArea = calculateArea(A.lat, A.lon, B.lat, B.lon, C.lat, C.lon) +
//                             calculateArea(A.lat, A.lon, C.lat, C.lon, D.lat, D.lon);

//   // Calculate the areas of the triangles formed by the point and the quadrilateral's corners
//   const area1 = calculateArea(latitude, longitude, A.lat, A.lon, B.lat, B.lon);
//   const area2 = calculateArea(latitude, longitude, B.lat, B.lon, C.lat, C.lon);
//   const area3 = calculateArea(latitude, longitude, C.lat, C.lon, D.lat, D.lon);
//   const area4 = calculateArea(latitude, longitude, D.lat, D.lon, A.lat, A.lon);

//   // Sum of triangle areas should match the quadrilateral's area if the point is inside
//   const totalArea = area1 + area2 + area3 + area4;

//   // A tolerance is used to account for floating point inaccuracies
//   return Math.abs(quadrilateralArea - totalArea) < 1e-5;
// };

// const LocationChecker = () => {
//   const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//       ).then(granted => {
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           getCurrentLocation();
//         } else {
//           Alert.alert('Location permission denied');
//         }
//       });
//     } else {
//       getCurrentLocation();
//     }
//   }, []);

//   const getCurrentLocation = () => {
//     Geolocation.getCurrentPosition(
//       position => {
//         const { latitude, longitude } = position.coords;
//         setLocation({ latitude, longitude });
//         console.log("hejgnbiygllo")
//         console.log(location)
//       },
//       error => {
//         Alert.alert('Error getting location', error.message);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 10000,
//       }
//     );
//   };

//   const checkLocation = () => {
//     if (location) {
//       // Define the four corner coordinates of the quadrilateral (latitude/longitude pairs)
//       const corners = [
//         { lat: 16.845622, lon: 74.600914 },  // First corner (A)
//         { lat: 16.845551, lon: 74.601020 },  // Second corner (B)
//         { lat: 16.845638, lon: 74.601012 },  // Third corner (C)
//         { lat: 16.845672, lon: 74.600933 },  // Fourth corner (D)
//       ];

//       const inside = isInsideQuadrilateral(location.latitude, location.longitude, corners);
      
//       Alert.alert(
//         'Location Check',
//         inside ? 'You are inside the quadrilateral!' : 'You are outside the quadrilateral.'
//       );
//     } else {
//       Alert.alert('Location not available');
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Text>Location Checker</Text>
//       <Button title="Check if Inside Quadrilateral" onPress={checkLocation} />
//     </View>
//   );
// };

// export default LocationChecker;
