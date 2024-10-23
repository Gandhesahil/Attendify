// appwriteClient.ts
import { Client, Databases } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
    .setProject('66e57bf0001e54fb8a20'); // Replace with your project ID

// Initialize the Database service
const databases = new Databases(client);

export { client, databases };
