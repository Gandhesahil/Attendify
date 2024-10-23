
import { NavigationContainer } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppwriteContext } from '../appwrite/AppwriteContext';
import React, { useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';

// Routes
import AppStack from './AppStack';
import AuthStack from './AuthStack';
// import Temp from '../screens/Temp';

export default function Router() {
  const [isLoading, setIsLoading] = useState(true);
  const { appwrite, isLoggedIn, setIsLoggedIn } = useContext(AppwriteContext);

  useEffect(() => {
    appwrite
      .getCurrentUser()
      .then((response) => {
        setIsLoading(false);
        if (response) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        setIsLoading(false);
        setIsLoggedIn( 
false);
      });
  }, [appwrite, setIsLoggedIn]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
      
    </NavigationContainer> 

  ); 
}