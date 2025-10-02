// file: App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import QueueScreen from './src/screens/QueueScreen';
import ServiceLockScreen from './src/screens/ServiceLockScreen';
import BottleSetupScreen from './src/screens/BottleSetupScreen';
import UARTTestScreen from './src/screens/UARTTestScreen';
import { COLORS } from './src/theme/global';
import { StatusBar } from 'expo-status-bar';


const Stack = createNativeStackNavigator();


export default function App() {
return (
<SafeAreaProvider>
<StatusBar style="light" />
<NavigationContainer>
<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.bg }, headerTintColor: '#fff' }}>
<Stack.Screen name="Dashboard" component={DashboardScreen} />
<Stack.Screen name="Queue" component={QueueScreen} />
<Stack.Screen name="ServiceLock" component={ServiceLockScreen} options={{ title: 'Service Lock' }} />
<Stack.Screen name="BottleSetup" component={BottleSetupScreen} options={{ title: 'Bottle Setup' }} />
<Stack.Screen name="UARTTest" component={UARTTestScreen} options={{ title: 'UART Test' }} />
</Stack.Navigator>
</NavigationContainer>
</SafeAreaProvider>
);
}