// file: src/screens/ServiceLockScreen.tsx
import { View, Text, Alert } from 'react-native';
import { apiGet, apiPost } from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../theme/global';


export default function ServiceLockScreen() {
const acquire = async () => {
try {
const res = await apiPost('/service/acquire', { owner_id: 'mobile-app' });
Alert.alert('Acquire', JSON.stringify(res));
} catch (e: any) {
Alert.alert('Error', e.message);
}
};


const status = async () => {
try {
const res = await apiGet('/service/status');
Alert.alert('Status', JSON.stringify(res));
} catch (e: any) {
Alert.alert('Error', e.message);
}
};


return (
<View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16, gap: 12 }}>
<Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Service Lock</Text>
<PrimaryButton title="Status" onPress={status} />
<PrimaryButton title="Acquire" onPress={acquire} />
</View>
);
}