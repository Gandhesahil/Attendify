import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppwriteContext } from '../appwrite/AppwriteContext';
import React, { useContext, useEffect, useState } from 'react';
import Home from '../screens/Home';
import Teacher_home from '../screens/Teacher_home';

export type AppStackParamList = {
  Home: undefined;
  Teacher_home: undefined;
  Temp:undefined;
};

// Create a stack navigator instance
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
  const { appwrite } = useContext(AppwriteContext);
  const [initialScreen, setInitialScreen] = useState<keyof AppStackParamList | null>(null);

  useEffect(() => {
    const fetchInitialScreen = async () => {
      try {
        const currentUser = await appwrite.getCurrentUser();
        if (currentUser && !currentUser.name) { // Adjust the condition based on your needs
          setInitialScreen('Teacher_home');
        } else {
          setInitialScreen('Home');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setInitialScreen('Home'); // Default to Home screen in case of errors
      }
    };

    fetchInitialScreen();
  }, [appwrite]);

  if (!initialScreen) {
    // You can return a loading screen here if needed
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name={initialScreen} // Set the initial screen dynamically
        component={initialScreen === 'Home' ? Home : Teacher_home}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
