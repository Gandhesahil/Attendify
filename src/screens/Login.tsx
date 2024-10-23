import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Pressable, Platform, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { AppwriteContext } from '../appwrite/AppwriteContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';
import Icon from 'react-native-vector-icons/Feather'; // You can use any icon library

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function Login({ navigation }: LoginScreenProps) {
    const { appwrite, setIsLoggedIn } = useContext(AppwriteContext);
    const [error, setError] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const handleLogin = () => {
        if (email.length < 1 || password.length < 1) {
            setError('All fields are required');
        } else {
            const user = {
                email,
                password
            };
            appwrite
                .login(user)
                .then((response) => {
                    if (response) {
                        setIsLoggedIn(true);
                        Snackbar.show({
                            text: 'Login Success',
                            duration: Snackbar.LENGTH_SHORT
                        });
                        // Navigate to appropriate screen after login
                    }
                })
                .catch(e => {
                    console.log(e);
                    setError('Incorrect email or password');
                });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.appName}>Wce Attendance</Text>

                {/* Email */}
                <TextInput
                    keyboardType="email-address"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    placeholderTextColor={'#AEAEAE'}
                    placeholder="Email"
                    style={styles.input}
                />

                {/* Password */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        value={password}
                        onChangeText={text => setPassword(text)}
                        placeholderTextColor={'#AEAEAE'}
                        placeholder="Password"
                        secureTextEntry={!passwordVisible}
                        style={styles.passwordInput}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconContainer}>
                        <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#484848" />
                    </TouchableOpacity>
                </View>

                {/* Validation error */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Login button */}
                <Pressable
                    onPress={handleLogin}
                    style={[styles.btn, { marginTop: error ? 10 : 20 }]}>
                    <Text style={styles.btnText}>Login</Text>
                </Pressable>

                {/* Sign up navigation */}
                <Pressable
                    onPress={() => navigation.navigate('Signup')}
                    style={styles.signUpContainer}>
                    <Text style={styles.noAccountLabel}>
                        Don't have an account?{'  '}
                        <Text style={styles.signUpLabel}>Create an account</Text>
                    </Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    formContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 20,
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
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 1,
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
        marginTop: 10,
    },
    passwordInput: {
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
    iconContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
        height: 20,
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '80%',
        marginTop: 20,
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
    signUpContainer: {
        marginTop: 80,
    },
    noAccountLabel: {
        color: '#484848',
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 15,
    },
    signUpLabel: {
        color: '#1d9bf0',
    },
});
