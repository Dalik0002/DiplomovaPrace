import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const RAD2DEG = 57.2958;

export default function App() {
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [angleZ, setAngleZ] = useState(0); // v ° (integrace z-ové úhlové rychlosti)
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    Gyroscope.setUpdateInterval(50); // 20 Hz
    const sub = Gyroscope.addListener(({ x, y, z }) => {
      setGyro({ x, y, z });
      const now = Date.now();
      const dt = lastT.current ? (now - lastT.current) / 1000 : 0;
      lastT.current = now;

      // integrace úhlové rychlosti kolem Z → úhel ve stupních
      const zDegPerSec = z * RAD2DEG;
      setAngleZ(prev => prev + zDegPerSec * dt);
    });

    return () => sub.remove();
  }, []);

  const reset = () => {
    setAngleZ(0);
    lastT.current = Date.now();
  };

  const turned90 = Math.abs(angleZ) >= 90;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Gyroskop nigga (živé hodnoty)</Text>

      <Text>ωx: {gyro.x.toFixed(2)} rad/s ({(gyro.x * RAD2DEG).toFixed(0)} °/s)</Text>
      <Text>ωy: {gyro.y.toFixed(2)} rad/s ({(gyro.y * RAD2DEG).toFixed(0)} °/s)</Text>
      <Text>ωz: {gyro.z.toFixed(2)} rad/s ({(gyro.z * RAD2DEG).toFixed(0)} °/s)</Text>

      <Text style={{ marginTop: 8 }}>Odhadnutý úhel kolem Z: {angleZ.toFixed(0)}°</Text>
      <Text style={{ color: turned90 ? 'green' : 'gray', fontWeight: '600' }}>
        {turned90 ? '▶ Otočeno ~90°!' : 'Otoč telefonem ~90° kolem svislé osy'}
      </Text>

      <Pressable onPress={reset} style={{ marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: '#6d28d9' }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Reset úhlu</Text>
      </Pressable>
    </View>
  );
}
