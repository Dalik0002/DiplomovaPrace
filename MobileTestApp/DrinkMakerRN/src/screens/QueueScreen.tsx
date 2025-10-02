// file: src/screens/QueueScreen.tsx
import { View, Text, FlatList } from 'react-native';
import { useQueueList } from '../hooks/useQueueData';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../theme/global';


export default function QueueScreen() {
const { data: queue, isLoading, refresh } = useQueueList();


return (
<View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16 }}>
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
<Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Fronta</Text>
<PrimaryButton title="Obnovit" onPress={refresh} />
</View>


<FlatList
data={queue}
keyExtractor={(item, idx) => `${item?.name ?? 'null'}-${idx}`}
renderItem={({ item }) => (
<View style={{ backgroundColor: '#4d2a5e', padding: 12, borderRadius: 16, marginBottom: 8 }}>
<Text style={{ color: '#fff', fontWeight: '700' }}>{item?.name ?? '—'}</Text>
<Text style={{ color: '#fff', opacity: 0.8 }}>Ingredience: {item?.ingredients?.filter(Boolean).join(', ') || '—'}</Text>
</View>
)}
ListEmptyComponent={<Text style={{ color: '#fff', opacity: 0.6 }}>{isLoading ? 'Načítám…' : 'Žádné položky'}</Text>}
/>
</View>
);
}