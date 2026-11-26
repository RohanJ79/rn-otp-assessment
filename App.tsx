import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OtpVerificationScreen } from './src/features/otp/screens/OtpVerificationScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <OtpVerificationScreen
        contact="example@gmail.com"
        onVerified={() =>
          Alert.alert('Verified', 'Your code was verified successfully.')
        }
      />
    </SafeAreaProvider>
  );
}
