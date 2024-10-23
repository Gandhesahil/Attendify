// Teacher_home.tsx 

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { FAB } from '@rneui/base';
import Snackbar from 'react-native-snackbar';
import { AppwriteContext } from '../appwrite/AppwriteContext';
import { Query } from 'appwrite';
import { databases } from '../appwrite/appwriteClient';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { format } from 'date-fns'; // For date formatting
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

type UserObj = {
  name: string;
  email: string;
};

export default function Teacher_home() {
  const [userData, setUserData] = useState<UserObj | null>(null);
  const {
    appwrite,
    setIsLoggedIn,
    setHideLogoutButton,
    code,
    setCode,
    classNo,
    setClassRoom,
    setSubjectName,
    subjectName,
  } = useContext(AppwriteContext);
  const [inputText, setInputText] = useState('');
  const [inputText2, setInputText2] = useState('');
  const [currentDate, setCurrentDate] = useState(getFormattedDate());
  const navigation = useNavigation<any>(); // Adjust the type as per your navigation setup

  function getFormattedDate() {
    return format(new Date(), 'yyyy-MM-dd'); // Format: YYYY-MM-DD
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(getFormattedDate());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  function generateCode() {
    let temp = '';
    let codi = '';

    temp += 'abcdefghijklmnopqrstuvwxyz';
    // temp += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    temp += '0123456789';
    // temp += '@#$&';

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * temp.length);
      codi += temp[randomIndex];
    }

    setCode(codi);
    setTimeout(() => {
      setCode('');
    },  300000); // 5min
  }

  const handleLogout = () => {
    appwrite.logout().then(() => {
      setIsLoggedIn(false);
      Snackbar.show({
        text: 'Logout successfully',
        duration: Snackbar.LENGTH_SHORT,
      });
    });
  };

  const hideStudentLogout = () => {
    setHideLogoutButton(true);
    Snackbar.show({
      text: 'Logout button will be hidden for 60 seconds',
      duration: Snackbar.LENGTH_SHORT,
    });

    setTimeout(() => {
      setHideLogoutButton(false);
    },  300000);
  };

  useEffect(() => {
    appwrite
      .getCurrentUser()
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

  const setClassroomNumber = () => {
    setClassRoom(inputText);
    console.log("classno=",classNo)
    Snackbar.show({
      text: `The current classroom is ${classNo}`,
      duration: Snackbar.LENGTH_SHORT,
    });
    setTimeout(() => {
      setClassRoom('');
    },  300000); // 5min
  };

  const setSubject = () => {
    setSubjectName(inputText2);
    Snackbar.show({
      text: `The current subject is ${inputText2}`,
      duration: Snackbar.LENGTH_SHORT,
    });
    setTimeout(() => {
      setSubjectName('');
    },  300000); // 120 seconds
  };

  const exportAttendance = async (subject: string) => {
    try {
      const DATABASE_ID = '67079e160013e88e7c23'; // Example Database ID
      const ATTENDANCE_COLLECTION_ID = 'attendance'; // Example Collection ID

      // Use Query.notEqual with the dynamic subject field
      const attendanceResponse = await databases.listDocuments(DATABASE_ID, ATTENDANCE_COLLECTION_ID, [
        Query.notEqual(subject, 0), // Fetch records where the subject attendance is not 0
      ]);

      if (attendanceResponse.documents.length === 0) {
        Alert.alert('No Data', `No attendance records found for subject: ${subject}`);
        return;
      }

      // Extract unique dates
      const uniqueDatesSet = new Set<string>();
      attendanceResponse.documents.forEach((doc) => {
        if (doc.date) {
          const dateOnly = doc.date.split('T')[0];
          uniqueDatesSet.add(dateOnly);
        }
      });
      const uniqueDates = Array.from(uniqueDatesSet).sort();

      // Extract unique students
      const uniqueStudentsSet = new Set<string>();
      attendanceResponse.documents.forEach((doc) => {
        if (doc.studentName) uniqueStudentsSet.add(doc.studentName);
      });
      const uniqueStudents = Array.from(uniqueStudentsSet).sort();

      const worksheetData: any[] = [];

      // Update header row to include "Total Attendance"
      const headerRow = ['Student Name', ...uniqueDates, 'Total Attendance'];
      worksheetData.push(headerRow);

      uniqueStudents.forEach((student) => {
        const row: any[] = [student];
        let totalAttendance = 0; // Initialize total attendance

        uniqueDates.forEach((date) => {
          const record = attendanceResponse.documents.find(
            (doc) => doc.studentName === student && doc.date.split('T')[0] === date
          );
          // Safely retrieve the attendance value for the subject
          const attendanceValue = record && record[subject] !== undefined ? Number(record[subject]) || 0 : 0;
          row.push(attendanceValue);
          totalAttendance += attendanceValue; // Accumulate total attendance
        });

        row.push(totalAttendance); // Append total attendance to the row
        worksheetData.push(row);
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, subject);

      const wbout = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' });
      const filePath = `${RNFS.DocumentDirectoryPath}/${subject}_Attendance_${currentDate}.xlsx`;

      await RNFS.writeFile(filePath, wbout, 'ascii');

      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${subject}_Attendance_${currentDate}.xlsx`,
      });

      Snackbar.show({
        text: `Attendance for ${subject} exported successfully!`,
        duration: Snackbar.LENGTH_SHORT,
      });
    } catch (error) {
      console.error('Error exporting attendance:', error);
      Alert.alert('Error', 'Failed to export attendance. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.inner}>
            <View style={styles.upperContainer}>
              <Image
                source={{
                  uri: 'https://appwrite.io/images-ee/blog/og-private-beta.png',
                  width: 400,
                  height: 300,
                  cache: 'default',
                }}
                resizeMode="contain"
              />
              <Text style={styles.message}>{code}</Text>
              <Button title="Generate Code" onPress={generateCode} color="#007AFF" />

              <TextInput
                style={styles.input}
                placeholder="Enter classroom number..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="#ccc"
              />
              <Button title="Set Classroom" onPress={setClassroomNumber} color="#4CAF50" />

              <TextInput
                style={styles.input}
                placeholder="Enter subject name..."
                value={inputText2}
                onChangeText={setInputText2}
                placeholderTextColor="#ccc"
              />
              <Button title="Set Subject" onPress={setSubject} color="#FF9800" />

              {userData && (
                <View style={styles.userContainer}>
                  <Text style={styles.userDetails}>Name: {userData.name}</Text>
                  <Text style={styles.userDetails}>Email: {userData.email}</Text>
                </View>
              )}

              <View style={styles.exportContainer}>
                <Text style={styles.exportTitle}>Export Attendance Sheets:</Text>
                <View style={styles.exportButtons}>
                  <Button
                    title="Export CD"
                    onPress={() => exportAttendance('CD')}
                    color="#4CAF50"
                  />
                  <Button
                    title="Export DAA"
                    onPress={() => exportAttendance('DAA')}
                    color="#2196F3"
                  />
                  <Button
                    title="Export AI"
                    onPress={() => exportAttendance('AI')}
                    color="#FF9800"
                  />
                </View>
              </View>

              <View style={styles.logoutContainer}>
                <FAB
                  title="Hide Student Logout"
                  color="#FF5722"
                  onPress={hideStudentLogout}
                  style={styles.fab}
                />
                <FAB
                  title="Logout"
                  color="#FF5722"
                  onPress={handleLogout}
                  style={styles.fab}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D32',
  },
  inner: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  upperContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
  },
  userContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  userDetails: {
    fontSize: 16,
    color: '#333',
  },
  exportContainer: {
    marginVertical: 20,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  fab: {
    marginHorizontal: 10,
  },
});
//BA3CB