// file: src/components/PrimaryButton.tsx
import { Pressable, Text, ViewStyle } from 'react-native';
import { COLORS } from '../theme/global';


type Props = { title: string; onPress: () => void; style?: ViewStyle };
export default function PrimaryButton({ title, onPress, style }: Props) {
return (
<Pressable onPress={onPress} style={[{ padding: 12, borderRadius: 16, backgroundColor: COLORS.accent }, style]}>
<Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>{title}</Text>
</Pressable>
);
}