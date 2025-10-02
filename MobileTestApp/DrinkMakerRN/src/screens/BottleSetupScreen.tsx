

// file: src/screens/BottleSetupScreen.tsx
import { View, Text } from 'react-native';
import { COLORS } from '../theme/global';
export default function BottleSetupScreen() {
return (
<View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16 }}>
<Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Bottle Setup</Text>
<Text style={{ color: '#fff', opacity: 0.8, marginTop: 8 }}>TODO: výběr ingrediencí pro 6 pozic</Text>
</View>
);
}