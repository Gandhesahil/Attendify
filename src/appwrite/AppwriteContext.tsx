import { StyleSheet, Text, View } from 'react-native';
import React, { createContext, FC, PropsWithChildren, useState, useMemo } from 'react';
import AppwriteService from './service';

type AppContextType = {
    appwrite: AppwriteService;
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    hideLogoutButton: boolean;
    setHideLogoutButton: (hide: boolean) => void;
    code: string;   // Add code state to the context type
    setCode: (code: string) => void; // Add setCode function to the context type
    classNo:string;
    setClassRoom:(classNo:string)=>void;
    subjectName:string;
    setSubjectName:(subjectName:string)=>void;
};

export const AppwriteContext = createContext<AppContextType>({
    appwrite: new AppwriteService(),
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    hideLogoutButton: false,
    setHideLogoutButton: () => {},
    code: '',  // Initialize code state
    setCode: () => {},
    classNo:'',
    setClassRoom:()=>{},
    subjectName:'',
    setSubjectName:()=>{}
});

export const AppwriteProvider: FC<PropsWithChildren> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hideLogoutButton, setHideLogoutButton] = useState(false);
    const [code, setCode] = useState(''); // New code state
    const [classNo,setClassRoom]=useState('');
    const [subjectName,setSubjectName]=useState('');

    const contextValue = useMemo(() => ({
        appwrite: new AppwriteService(),
        isLoggedIn,
        setIsLoggedIn,
        hideLogoutButton,
        setHideLogoutButton,
        code,       // Provide code in context
        setCode,    // Provide setCode in context
        classNo,
        setClassRoom,
        subjectName,
        setSubjectName

    }), [isLoggedIn, hideLogoutButton, code,classNo,subjectName]);

    return (
        <AppwriteContext.Provider value={contextValue}>
            {children}
        </AppwriteContext.Provider>
    );
};

const styles = StyleSheet.create({});