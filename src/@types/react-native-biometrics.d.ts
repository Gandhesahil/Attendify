declare module 'react-native-biometrics' { 
  type BiometryType = 'Biometrics' | 'TouchID'; // Excluding 'FaceID' for Android

  interface SensorAvailability {
      available: boolean;
      biometryType: BiometryType;
  }

  interface CreateKeysResult {
      publicKey: string;
  }

  interface SimplePromptOptions {
      promptMessage: string;
      cancelButtonText?: string;
  }

  interface SimplePromptResult {
      success: boolean;
      error?: string;
  }

  interface VerifySignatureOptions {
      publicKey: string; // Added publicKey
      signature: string;
      payload: string;
  }

  interface VerifySignatureResult {
      success: boolean;
      message: string;
  }

  export default class ReactNativeBiometrics {
      constructor(options?: any);

      isSensorAvailable(): Promise<SensorAvailability>;

      createKeys(): Promise<CreateKeysResult>;

      deleteKeys(): Promise<void>;

      createSignature(options: { promptMessage: string; payload: string }): Promise<{ success: boolean; signature: string }>;

      simplePrompt(options: SimplePromptOptions): Promise<SimplePromptResult>;

      verifySignature(options: VerifySignatureOptions): Promise<VerifySignatureResult>;

      // Static constants YA22A
      static TouchID: 'TouchID';
      static Biometrics: 'Biometrics';
  }
}
