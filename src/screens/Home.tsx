import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    TextInput,
    Button,
    Platform,
    PermissionsAndroid,
    Alert,
} from 'react-native';
// import { haversineDistance } from '/haversine'; // Custom haversine function for distance calculation
import { haversineDistance } from './haversine';
import Geolocation from '@react-native-community/geolocation';
import React, { useContext, useEffect, useState } from 'react';
import { FAB } from '@rneui/base';
import Snackbar from 'react-native-snackbar';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppwriteContext } from '../appwrite/AppwriteContext';
import { AppStackParamList } from '../routes/AppStack';
import GetLocation from 'react-native-get-location';
import classroomsData from './classrooms.json'; // Adjust the path if necessary
import ReactNativeBiometrics from 'react-native-biometrics';
import { Query } from 'appwrite';
import { databases } from '../appwrite/appwriteClient';
import { format } from 'date-fns'; // For advanced formatting

interface Coordinate {
    latitude: number;
    longitude: number;
}

type UserObj = {
    name: string;
    email: string;
    department?: string;
};

export default function Home() {
    const [userData, setUserData] = useState<UserObj | null>(null);
    const { appwrite, setIsLoggedIn, hideLogoutButton, code, classNo, subjectName } = useContext(AppwriteContext);
    const [inputText, setInputText] = useState('');
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(true); // State to track location services
    const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
    const [currentDate, setCurrentDate] = useState(getFormattedDate());
    const [doneAtendee, setDoneAtendee] = useState(0);
    const navigation = useNavigation<NavigationProp<AppStackParamList>>();
    const classrooms = classroomsData.classrooms;

    /**
     * Function to get the formatted current date
     */
    function getFormattedDate() {
        // Using date-fns for better formatting and time zone handling
        return format(new Date(), 'yyyy-MM-dd'); // Adjust format as needed
        // Or using toLocaleDateString for simplicity
        // return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    }

    /**
     * Updates the current date every minute to ensure accuracy
     */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(getFormattedDate());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    /**
     * Function to determine if a point is inside a polygon using the ray-casting algorithm.
     */
    const checkProximity = (userLocation, polygon, thresholdInMeters) => {
        // console.log("userlocation=>",userLocation)
        // console.log("polygon=>",polygon)


        for (let i = 0; i < polygon.length; i++) {
          const distance = haversineDistance(userLocation, polygon[i]);
          if (distance <= thresholdInMeters) {
            return true;
          }
        }
        console.log("userlocation=>",userLocation)
        console.log("polygon=>",polygon)
        return false;
      };
    function isPointInPolygon(point: Coordinate, polygon: Coordinate[]) {
        let x = point.longitude, y = point.latitude;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let xi = polygon[i].longitude, yi = polygon[i].latitude;
            let xj = polygon[j].longitude, yj = polygon[j].latitude;

            let intersect = ((yi > y) != (yj > y)) &&
                (x <= (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Handles user logout by calling the Appwrite logout method and updating the context.
     */
    const handleLogout = async () => {
        try {
            console.log('Logging out...');
            await appwrite.logout();
            setIsLoggedIn(false);
            Snackbar.show({
                text: 'Logged out successfully',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error) {
            console.error('Error during logout:', error);
            Snackbar.show({
                text: 'Error during logout. Please try again.',
                duration: Snackbar.LENGTH_LONG,
            });
        }
    };

    /**
     * Fetches the current user's data from Appwrite and sets it in the state.
     */
    useEffect(() => {
        appwrite.getCurrentUser()
            .then((response) => {
                if (response) {
                    const user: UserObj = {
                        name: response.name,
                        email: response.email,
                    };
                    setUserData(user);
                }
            })
            .catch((error) => {
                console.log('Error fetching user data:', error);
                Snackbar.show({
                    text: 'Error fetching user data.',
                    duration: Snackbar.LENGTH_LONG,
                });
            });
    }, [appwrite]);

    /**
     * Updates the input text state as the user types.
     */
    function handleInputChange(text: string) {
        setInputText(text);
    }

    /**
     * Marks attendance for a student based on their name.
     * If the student is not found, adds a new entry and then marks attendance.
     * @param studentName - The name of the student.
     * @param subjects - Array of subjects to update attendance for.
     */
    async function markAttendance(studentName: string, subjects: string[]) {
        try {
            // Replace with your actual Database ID and Collection IDs
            const DATABASE_ID = '67079e160013e88e7c23'; // Example Database ID
            const STUDENTS_COLLECTION_ID = 'students'; // Example Collection ID
            const ATTENDANCE_COLLECTION_ID = 'attendance'; // Example Collection ID

            // Fetch the student from the 'Students' collection using the studentName
            let studentResponse = await databases.listDocuments(DATABASE_ID, STUDENTS_COLLECTION_ID, [
                Query.equal('studentName', studentName) // Ensure 'studentName' exists in 'Students' collection
            ]);

            let student: any;

            if (studentResponse.documents.length === 0) {
                // Student not found, create a new student entry
                if (!userData) {
                    throw new Error('User data is not available to create a new student.');
                }

                const newStudentData = {
                    studentName: userData.name,
                    email: userData.email,
                    // Add other required fields here if necessary, e.g., department
                    // department: userData.department || 'Default Department',
                };

                const newStudent = await databases.createDocument(DATABASE_ID, STUDENTS_COLLECTION_ID, 'unique()', newStudentData);
                student = newStudent;
                console.log('New student created:', newStudent);
            } else {
                // Student found
                student = studentResponse.documents[0];
            }

            // Get today's date in YYYY-MM-DD format
            const today = currentDate; // Use the state variable

            // Check if an attendance record already exists for today for this student
            const attendanceResponse = await databases.listDocuments(DATABASE_ID, ATTENDANCE_COLLECTION_ID, [
                Query.equal('studentName', studentName),
                Query.equal('date', today)
            ]);

            let attendanceId: string;

            if (attendanceResponse.documents.length === 0) {
                // If no record exists for today, create a new attendance record
                const attendanceData: Record<string, any> = {
                    studentName: studentName,
                    date: today,
                };

                // Initialize attendance counts for each subject
                // subjects.forEach(subject => {
                    if (subjectName !== '') {
                        attendanceData[subjectName] = 1; // Set initial attendance count to 1
                    }
                // });

                // Create the attendance document
                const newAttendance = await databases.createDocument(DATABASE_ID, ATTENDANCE_COLLECTION_ID, 'unique()', attendanceData);
                attendanceId = newAttendance.$id;
                console.log('New attendance record created:', newAttendance);
            } else {
                // If a record exists, update the attendance counts
                attendanceId = attendanceResponse.documents[0].$id;
                const existingAttendance = attendanceResponse.documents[0];

                const updatedAttendance: Record<string, any> = {};

                // subjects.forEach(subject => {
                    if (subjectName !== '') {
                        if (existingAttendance[subjectName] !== undefined) {
                            updatedAttendance[subjectName] = existingAttendance[subjectName] + 1; // Increment count
                        } else {
                            updatedAttendance[subjectName] = 1; // Initialize count if subject not present
                        }
                    }
                // });

                // Update the attendance document with new counts
                await databases.updateDocument(DATABASE_ID, ATTENDANCE_COLLECTION_ID, attendanceId, updatedAttendance);
                console.log('Attendance record updated:', updatedAttendance);
            }

            // Notify the user of successful attendance marking
            Snackbar.show({
                text: 'Attendance marked successfully!',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            Snackbar.show({
                text: 'Error marking attendance. Please try again.',
                duration: Snackbar.LENGTH_LONG,
            });
        }
    }

    /**
     * Handles the verification process:
     * 1. Validates the entered code.
     * 2. Checks if the user is inside the specified classroom based on location.
     * 3. Prompts for biometric authentication.
     * 4. Marks attendance upon successful authentication.
     */
    async function handleVerifyCode() {
        if (inputText === code && code !== '') {
            if (classNo !== '') {
                const parsedClassNo = Number(classNo); // Convert to number

                if (parsedClassNo >= 1 && parsedClassNo <= 21) {
                    const classroom = classrooms[parsedClassNo - 1];
                    if (!classroom || !classroom.coordinates) {
                        Snackbar.show({
                            text: 'Invalid classroom data.',
                            duration: Snackbar.LENGTH_SHORT,
                        });
                        return;
                    }

                    const classroomCoordinates = [
                        classroom.coordinates.top_left,
                        classroom.coordinates.top_right,
                        classroom.coordinates.bottom_right,
                        classroom.coordinates.bottom_left,
                    ];

                    if (currentLocation && (isPointInPolygon(currentLocation, classroomCoordinates) || checkProximity(currentLocation, classroomCoordinates, 15)) ) {
                        console.log("User is inside the classroom.");
                        // Optionally, handle specific logic for being inside the classroom
                        const rnBiometrics = new ReactNativeBiometrics();

                        try {
                            const challenge = `Challenge-${Date.now()}`;

                            const signResult = await rnBiometrics.createSignature({
                                promptMessage: 'Authenticate to verify your identity',
                                payload: challenge,
                            });

                            const { success, signature } = signResult;

                            if (success && signature) {
                                Snackbar.show({ 
                                    text: 'Biometric authentication successful.',
                                    duration: Snackbar.LENGTH_SHORT,
                                });

                                // Define the subjects to update
                                const subjects = ['CD', 'DAA', 'AI'];

                                // Prevent multiple attendance marks within a minute
                                if (doneAtendee === 0) {
                                    setDoneAtendee(1);
                                    setTimeout(() => {
                                        setDoneAtendee(0);
                                    },  300000); // Reset after 60 seconds
                                    
                                    // Extract studentName from email
                                    const emailToBreak = userData?.email;
                                    if(emailToBreak){
                                        const newStudentName = emailToBreak.split('@')[0];
                                        console.log('Derived studentName:', newStudentName); // Correctly logs the updated name

                                        // Mark attendance using the derived studentName
                                        await markAttendance(newStudentName, subjects);
                                    } else {
                                        Snackbar.show({
                                            text: 'User email not available.',
                                            duration: Snackbar.LENGTH_LONG,
                                        });
                                    }
                                } else {
                                    Alert.alert('Attendance Already Marked', 'Your attendance has already been marked recently.');
                                }

                                // Optionally, navigate to another screen after marking attendance
                                // navigation.navigate('AttendanceSuccess');
                            } else {
                                Alert.alert('Biometric Authentication Failed', 'Please try again.');
                            }
                        } catch (error) {
                            console.log('Biometric authentication error:', error);
                            Alert.alert('Biometric Authentication Error', 'An error occurred during biometric authentication.');
                        }
                       
                    } else if (currentLocation) {
                        console.log("User is outside the classroom.");
                        Alert.alert('Unable to mark attendance', 'You are not in the classroom.');
                        // Proceed with biometric authentication 

                        
                    } else {
                        console.log("Current location is not available.");
                        Snackbar.show({
                            text: 'Unable to determine location',
                            duration: Snackbar.LENGTH_SHORT,
                        });
                    }
                } else {
                    Snackbar.show({
                        text: 'Invalid class number',
                        duration: Snackbar.LENGTH_SHORT,
                    });
                }
            } else {
                Snackbar.show({
                    text: 'Class number is missing',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } else {
            Snackbar.show({
                text: 'Please enter a valid code',
                duration: Snackbar.LENGTH_SHORT,
            });
        }
    }

    /**
     * Requests location permissions from the user.
     */
    useEffect(() => {
        requestLocationPermission();
    }, []);

    async function requestLocationPermission() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'Please allow location permission to use this feature.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setPermissionGranted(true);
                    getCurrentLocation();
                } else {
                    console.log('Location permission denied');
                    setPermissionGranted(false);
                    notifyLocationDisabled();
                }
            } catch (err) {
                console.warn(err);
                setPermissionGranted(false);
                notifyLocationDisabled();
            }
        } else {
            // For iOS or other platforms, handle permissions accordingly
            setPermissionGranted(true);
            getCurrentLocation();
        }
    }

    /**
     * Notifies the user that location services are disabled and prompts them to enable it.
     */
    function notifyLocationDisabled() {
        setLocationEnabled(false);
        Alert.alert(
            'Location Services Disabled',
            'Please turn on your device\'s location services to use this feature.',
            [
                {
                    text: 'OK',
                    onPress: () => {},
                },
            ],
            { cancelable: true },
        );
    }

    /**
     * Retrieves the current location of the user.
     */
    function getCurrentLocation() {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                console.log('My current Location is =>', location);
                setCurrentLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                });
                setLocationEnabled(true); // Location is enabled
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
                if (code === 'UNAVAILABLE') {
                    // Location services are likely disabled
                    notifyLocationDisabled();
                } else {
                    Snackbar.show({
                        text: 'Unable to get location. Please try again.',
                        duration: Snackbar.LENGTH_SHORT,
                    });
                }
            });
    }

    // If location services are disabled, inform the user
    if (!locationEnabled) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Please turn on your device's location services to continue.</Text>
                <Button title="Retry" onPress={() => {
                    requestLocationPermission();
                }} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.welcomeContainer}>
                <Image
                    source={{
                        uri: 'https://appwrite.io/images-ee/blog/og-private-beta.png',
                        width: 400,
                        height: 300,
                        cache: 'default',
                    }}
                    resizeMode="contain"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter code here..."
                    placeholderTextColor="#ccc"
                    value={inputText}
                    onChangeText={handleInputChange}
                />
                <Button title="Verify Code" onPress={handleVerifyCode} />
                {userData && (
                    <View style={styles.userContainer}>
                        <Text style={styles.userDetails}>Name: {userData.name}</Text>
                        <Text style={styles.userDetails}>Email: {userData.email}</Text>
                    </View>
                )}
            </View>
            {!hideLogoutButton && (
                <FAB
                    placement="right"
                    color="#f02e65"
                    size="large"
                    title="Logout"
                    icon={{ name: 'logout', color: '#FFFFFF' }}
                    onPress={handleLogout}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0D32',
    }  ,
    welcomeContainer: {
        padding: 12,
        flex: 1,
        alignItems: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        color: '#fff',
        width: '80%',
        borderRadius: 5,
    },
    userContainer: {
        marginTop: 24,
    },
    userDetails: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    permissionText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0B0D32',
        padding: 20,
    },
});
