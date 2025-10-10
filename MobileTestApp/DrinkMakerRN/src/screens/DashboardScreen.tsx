// file: src/screens/DashboardScreen.tsx
import { View, Text } from 'react-native';
import { useNumberOfDrinks } from '../hooks/useQueueData';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../theme/global';


export default function DashboardScreen({ navigation }: any) {
const { drinkCount, isLoading, refresh } = useNumberOfDrinks();


return (
<View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16, gap: 16 }}>
<Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>Dashboard</Text>
<CardRow label="Počet drinků ve frontě" value={isLoading ? '…' : String(drinkCount)} onRefresh={refresh} />


<PrimaryButton title="Fronta" onPress={() => navigation.navigate('Queue')} />
<PrimaryButton title="Service Lock" onPress={() => navigation.navigate('ServiceLock')} />
<PrimaryButton title="Bottle Setup" onPress={() => navigation.navigate('BottleSetup')} />
<PrimaryButton title="UART Test" onPress={() => navigation.navigate('UARTTest')} />
</View>
);
}


function CardRow({ label, value, onRefresh }: { label: string; value: string; onRefresh: () => void }) {
return (
<View style={{ backgroundColor: '#4d2a5e', padding: 12, borderRadius: 16 }}>
<Text style={{ color: '#fff', opacity: 0.8 }}>{label}</Text>
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
<Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{value}</Text>
<PrimaryButton title="Obnovit" onPress={onRefresh} />
</View>
</View>
);
}