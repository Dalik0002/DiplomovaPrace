// file: src/screens/UARTTestScreen.tsx
import { View, Text } from 'react-native';
import { COLORS } from '../theme/global';
export default function UARTTestScreen() {
return (
<View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16 }}>
<Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>UART Test</Text>
<Text style={{ color: '#fff', opacity: 0.8, marginTop: 8 }}>Zde můžeš logovat vstupy ze zařízení (REST / WebSocket).</Text>
</View>
);
}