import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPerm, requestMediaPerm] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scanned, setScanned] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    if (!mediaPerm?.granted) requestMediaPerm();
  }, []);

  if (!permission?.granted) {
    return <Text>Potřebuji povolení ke kameře…</Text>;
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) {
      setPhotoUri(photo.uri);
      if (mediaPerm?.granted) await MediaLibrary.saveToLibraryAsync(photo.uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        onBarcodeScanned={({ data, type }) => {
          setScanned(`${type}: ${data}`);
          // případně vypnout scan na chvíli, ať netriggeruje víckrát
        }}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8'] }}
      />

      <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          style={{ padding: 12, borderRadius: 12, backgroundColor: '#6d28d9' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Přepnout kameru</Text>
        </Pressable>

        <Pressable onPress={takePhoto}
          style={{ padding: 12, borderRadius: 12, backgroundColor: '#6d28d9' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Vyfotit</Text>
        </Pressable>

        {scanned && <Text style={{ backgroundColor: '#0008', color: '#fff', padding: 6, borderRadius: 8 }}>
          Naskenováno: {scanned}
        </Text>}
        {photoUri && <Image source={{ uri: photoUri }} style={{ width: 120, height: 120, borderRadius: 12 }} />}
      </View>
    </View>
  );
}
