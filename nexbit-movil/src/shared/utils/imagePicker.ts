import * as ImagePicker from 'expo-image-picker';

export type PickedImage = {
  uri: string;
  base64: string;
  mimeType: string;
  fileSize: number;
};

const OPCIONES: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.5,
  base64: true,
};

export async function pickImage(source: 'camera' | 'library'): Promise<PickedImage | null> {
  if (source === 'camera') {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      throw new Error('Se requiere permiso de cámara para tomar la foto.');
    }
  } else {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      throw new Error('Se requiere permiso para acceder a las fotos.');
    }
  }

  const resultado =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(OPCIONES)
      : await ImagePicker.launchImageLibraryAsync(OPCIONES);

  if (resultado.canceled || !resultado.assets?.[0]) {
    return null;
  }

  const asset = resultado.assets[0];
  if (!asset.base64) {
    throw new Error('No se pudo procesar la imagen seleccionada.');
  }

  return {
    uri: asset.uri,
    base64: asset.base64,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSize: asset.fileSize ?? Math.round((asset.base64.length * 3) / 4),
  };
}