// service.ts
import { Client, Account, Databases } from 'appwrite';
import { Query } from 'appwrite';
const client = new Client();
const account = new Account(client);
const databases = new Databases(client);

client.setEndpoint('https://cloud.appwrite.io/v1').setProject('66e57bf0001e54fb8a20');

export const checkUserNameExists = async (name: string): Promise<boolean> => {
  try {
    const response = await databases.listDocuments('67079e160013e88e7c23', 'DoesNameExist', [
      Query.equal('name', name),
    ]);
    return response.total > 0; // Returns true if user exists
  } catch (error) {
    console.error('Error checking username:', error);
    return false; // Return false if there is an error
  }
};
