// file: src/components/Card.tsx
import { View, ViewProps } from 'react-native';
import { COLORS } from '../theme/global';
export default function Card({ children, style, ...rest }: ViewProps) {
return (
<View {...rest} style={[{ backgroundColor: COLORS.card, padding: 12, borderRadius: 16 }, style]}>
{children}
</View>
);
}