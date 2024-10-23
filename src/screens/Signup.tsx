import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Pressable, Platform, ScrollView, TouchableOpacity ,Alert} from 'react-native';  
import React, { useContext, useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { AppwriteContext } from '../appwrite/AppwriteContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';
import { CreateUserAccount } from '../appwrite/service';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather'; // You can use any icon library
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function Signup({ navigation }: SignupScreenProps) {
    const { appwrite, setIsLoggedIn } = useContext(AppwriteContext);
    const [error, setError] = useState<string>('');
    const [name, setName] = useState<string>(''); // Only needed if role is 'Student'
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [repeatPassword, setRepeatPassword] = useState<string>('');
    const [role, setRole] = useState<'Teacher' | 'Student'>('Student'); // Default role
    const [yearOfStudy, setYearOfStudy] = useState<'1st' | '2nd' | '3rd' | '4th'>('1st'); // Default year
    const [department, setDepartment] = useState<'cse' | 'IT' | 'tronics' | 'Ele' | 'mech' | 'Civil'>('cse'); // Default department
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [repeatPasswordVisible, setRepeatPasswordVisible] = useState<boolean>(false);
    const [biometricKeyCreated, setBiometricKeyCreated] = useState(false);
    const handleSignup = async () => {
        // Input Validation
        if (
            email.length < 1 ||
            password.length < 1 ||
            repeatPassword.length < 1
        ) {
            setError('All fields are required for students');
            return;
        }
    
        if (password !== repeatPassword) {
            setError('Passwords do not match');
            return;
        }
    
        // Initialize React Native Biometrics
        const rnBiometrics = new ReactNativeBiometrics();
    
        try {
            // Step 1: Prompt for Biometric Authentication
            const biometricResult = await rnBiometrics.simplePrompt({ promptMessage: 'Confirm biometric to proceed with signup' });
    
            const { success } = biometricResult;
    
            if (success) {
                // Step 2: Generate and Store Cryptographic Key
                const keyResult = await rnBiometrics.createKeys();
    
                if (keyResult) {
                    const { publicKey } = keyResult;
    
                    // Note: We are NOT sending the publicKey to Appwrite as per your requirement
    
                    // Step 3: Create User Object
                    const user: CreateUserAccount = {
                        email,
                        password,
                        confirmPassword: repeatPassword,
                        name: role === 'Student' ? name : '', // Send name only if role is Student
                        role,
                        yearOfStudy: role === 'Student' ? yearOfStudy : undefined,
                        department: role === 'Student' ? department : undefined,
                    };
    
                    // Step 4: Create Account in Appwrite
                    const response = await appwrite.createAccount(user);
    
                    if (response) {
                        Snackbar.show({
                            text: 'Signup successful with biometrics',
                            duration: Snackbar.LENGTH_SHORT,
                        });
                        setIsLoggedIn(true);
                        navigation.navigate(role === 'Student' ? 'Home' : 'Teacher_home');
                    }
                } else {
                    Alert.alert('Key Generation Failed', 'Unable to generate cryptographic keys.');
                }
            } else {
                Alert.alert('Biometric Authentication Failed', 'Signup process was canceled.');
            }
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                if (error.name === 'UserCancel') {
                    Alert.alert('Signup Canceled', 'You canceled the biometric prompt.');
                } else {
                    setError(error.message);
                }
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <ScrollView>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.formContainer}>
                        <Text style={styles.appName}>Wce Attendance</Text>

                        {/* Role Picker */}
                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Role</Text>
                            <Picker
                                selectedValue={role}
                                onValueChange={(itemValue) => {
                                    setError('');
                                    setRole(itemValue as 'Teacher' | 'Student');
                                }}
                                style={styles.picker}>
                                <Picker.Item label="Teacher" value="Teacher" />
                                <Picker.Item label="Student" value="Student" />
                            </Picker>
                        </View>

                        {/* Name (for students only) */}
                        {role === 'Student' && (
                            <TextInput
                                value={name}
                                onChangeText={(text) => {
                                    setError('');
                                    setName(text);
                                }}
                                placeholderTextColor={'#AEAEAE'}
                                placeholder="Name"
                                style={styles.input}
                            />
                        )}

                        {/* Email */}
                        <TextInput
                            value={email}
                            keyboardType="email-address"
                            onChangeText={(text) => {
                                setError('');
                                setEmail(text);
                            }}
                            placeholderTextColor={'#AEAEAE'}
                            placeholder="Email e.g.PRN@gmail.com"
                            style={styles.input}
                        />

                        {/* Password */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                value={password}
                                onChangeText={(text) => {
                                    setError('');
                                    setPassword(text);
                                }}
                                placeholderTextColor={'#AEAEAE'}
                                placeholder="Password"
                                secureTextEntry={!passwordVisible}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconContainer}>
                                <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#484848" />
                            </TouchableOpacity>
                        </View>

                        {/* Repeat password */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                value={repeatPassword}
                                onChangeText={(text) => {
                                    setError('');
                                    setRepeatPassword(text);
                                }}
                                placeholderTextColor={'#AEAEAE'}
                                placeholder="Repeat Password"
                                secureTextEntry={!repeatPasswordVisible}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setRepeatPasswordVisible(!repeatPasswordVisible)} style={styles.iconContainer}>
                                <Icon name={repeatPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#484848" />
                            </TouchableOpacity>
                        </View>

                        {/* Year of Study (for students only) */}
                        {role === 'Student' && (
                            <View style={styles.pickerContainer}>
                                <Text style={styles.label}>Year of Study</Text>
                                <Picker
                                    selectedValue={yearOfStudy}
                                    onValueChange={(itemValue) => {
                                        setError('');
                                        setYearOfStudy(itemValue as '1st' | '2nd' | '3rd' | '4th');
                                    }}
                                    style={styles.picker}>
                                    <Picker.Item label="1st Year" value="1st" />
                                    <Picker.Item label="2nd Year" value="2nd" />
                                    <Picker.Item label="3rd Year" value="3rd" />
                                    <Picker.Item label="4th Year" value="4th" />
                                </Picker>
                            </View>
                        )}

                        {/* Department (for students only) */}
                        {/* {role === 'Student' && ( */}
                            <View style={styles.pickerContainer}>
                                <Text style={styles.label}>Department</Text>
                                <Picker
                                    selectedValue={department}
                                    onValueChange={(itemValue) => {
                                        setError('');
                                        setDepartment(itemValue as 'cse' | 'IT' | 'tronics' | 'Ele' | 'mech' | 'Civil');
                                    }}
                                    style={styles.picker}>
                                    <Picker.Item label="CSE" value="cse" />
                                    <Picker.Item label="IT" value="IT" />
                                    <Picker.Item label="Tronics" value="tronics" />
                                    <Picker.Item label="Electrical" value="Ele" />
                                    <Picker.Item label="Mechanical" value="mech" />
                                    <Picker.Item label="Civil" value="Civil" />
                                </Picker>
                            </View>
                        {/* )} */}

                        {/* Validation error */}
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {/* Signup button */}
                        <Pressable
                            onPress={handleSignup}
                            style={[styles.btn, { marginTop: error ? 10 : 20 }]}>
                            <Text style={styles.btnText}>Sign Up</Text>
                        </Pressable>

                        {/* Login navigation */}
                        <Pressable
                            onPress={() => navigation.navigate('Login')}
                            style={styles.loginContainer}>
                            <Text style={styles.haveAccountLabel}>
                                Already have an account?{'  '}
                                <Text style={styles.loginLabel}>Login</Text>
                            </Text>
                        </Pressable>
                    
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        padding: 20,
    },
    appName: {
        color: '#f02e65',
        fontSize: 40,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fef8fa',
        padding: 10,
        height: 40,
        width: '100%',
        borderRadius: 5,
        color: '#000000',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 1,
    },
    pickerContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10, // Ensure equal gap below the picker
    },
    picker: {
        height: 40,
        width: '100%',
        backgroundColor: '#fef8fa',
        borderRadius: 5,
        color: '#000000',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#484848',
        marginBottom: 5,
    },
    errorText: {
        color: 'red',
        alignSelf: 'center',
        marginTop: 10,
    },
    btn: {
        backgroundColor: '#ffffff',
        padding: 10,
        height: 45,
        alignSelf: 'center',
        borderRadius: 5,
        width: '100%',
        marginTop: 20, // Increased margin to create space between the button and other elements
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 3,
    },
    btnText: {
        color: '#484848',
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    loginContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    haveAccountLabel: {
        color: '#484848',
        fontWeight: 'bold',
        fontSize: 15,
    },
    loginLabel: {
        color: '#1d9bf0',
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
        marginTop: 10,
    },
    iconContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
        height: 20,
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});     