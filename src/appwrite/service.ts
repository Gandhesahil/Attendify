import { ID, Account, Client } from 'appwrite';
import Config from 'react-native-config';
import Snackbar from 'react-native-snackbar';

const appwriteClient = new Client();
const APPWRITE_ENDPOINT: string = Config.APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID: string = Config.APPWRITE_PROJECT_ID!;

export type CreateUserAccount = {
    email: string;
    password: string;
    confirmPassword: string; // Ensure the password is confirmed.
    name: string;
    role: 'Teacher' | 'Student';
    // prn?: string; // For students only
    yearOfStudy?: '1st' | '2nd' | '3rd' | '4th'; // For students only
    department?: 'cse' | 'IT' | 'tronics' | 'Ele' | 'mech' | 'Civil'; // For students only
}

type LoginUserAccount = {
    email: string;
    password: string;
}

class AppwriteService {
    account;

    constructor() {
        appwriteClient
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)

        this.account = new Account(appwriteClient);
    }

    // Create a new user account
    async createAccount({
        email,
        password,
        confirmPassword,
        name,
        role,
        yearOfStudy,
        department
    }: CreateUserAccount) {
        if (password !== confirmPassword) {

            Snackbar.show({
                text: "Passwords do not match",
                duration: Snackbar.LENGTH_LONG
            });
            return;
        }
    
        try {
            // Create the user account, but omit the name field if role is 'Teacher'
            const userAccount = await this.account.create(
                ID.unique(),
                email,
                password,
               
                role === 'Student' ? name : undefined // Omit 'name' for Teacher
            );
    
            if (userAccount) {
                // Save additional data for student role
                if (role === 'Student') {
                    await this.account.updatePrefs({
                        yearOfStudy,
                        
                    });
                }
                if (role === 'Teacher') {
                    await this.account.updatePrefs({
                      department,
                    });
                  }
                return this.login({ email, password });
            } else {
                return userAccount;
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User (role: guests) missing scope (account)') {
                    return this.login({ email, password });
                } else {
                    Snackbar.show({
                        text: error.message,
                        duration: Snackbar.LENGTH_LONG
                    });
                }
            } else {
                // Fallback if the error is not an instance of Error
                Snackbar.show({
                    text: "An unexpected error occurred",
                    duration: Snackbar.LENGTH_LONG
                });
            }
            
            // console.log("Appwrite service :: createAccount() :: " + error);
        }
    }
    

    // Log in user
    async login({ email, password }: LoginUserAccount) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            Snackbar.show({
                text: String(error),
                duration: Snackbar.LENGTH_LONG
            });
            console.log("Appwrite service :: login() :: " + error);
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite service :: getCurrentUser() :: " + error);
        }
    }

    async logout() {
        try {
            const activeSessions = await this.account.listSessions();
    if (activeSessions.total > 0) {
      await this.account.deleteSession("current")    
    }
            console.log("User successfully logged out.");
            Snackbar.show({
                text: "User successfully logged out.",
                duration: Snackbar.LENGTH_SHORT
            });
        } catch (error) {
            Snackbar.show({
                text: String(error),
                duration: Snackbar.LENGTH_LONG
            });
            console.log("Appwrite service :: logout() :: " + error);
        }
    }



    async saveUserPublicKey(publicKey: string) {
        try {
            const user = await this.account.get(); // Get current user
            if (user) {
                // Assuming you're using Appwrite's database or preferences to store additional data
                await this.account.updatePrefs({
                    publicKey, // Store the public key in user preferences
                });
                Snackbar.show({
                    text: 'Public key saved successfully.',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } catch (error) {
            Snackbar.show({
                text: 'Failed to save public key.',
                duration: Snackbar.LENGTH_LONG,
            });
            console.log("AppwriteService :: saveUserPublicKey() :: " + error);
        }
    }

}

export default AppwriteService;