import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export type PickedFile = {
  name: string;
  mimeType?: string;
  contentBase64: string;
};

function stripDataUrlPrefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

function readBlobAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      resolve(stripDataUrlPrefix(reader.result));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
}

async function readUriAsBase64Web(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Failed to read selected file');
  }
  return readBlobAsBase64(await response.blob());
}

async function readAssetAsBase64(asset: DocumentPicker.DocumentPickerAsset): Promise<string> {
  const webFile = (asset as DocumentPicker.DocumentPickerAsset & { file?: File }).file;
  if (Platform.OS === 'web') {
    if (webFile) {
      return readBlobAsBase64(webFile);
    }
    return readUriAsBase64Web(asset.uri);
  }

  return FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/** Pick a document and return base64 content (works on web + native). */
export async function pickDocumentBase64(
  types: string[] = ['application/pdf', 'image/*'],
): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: Platform.OS !== 'web',
    multiple: false,
    type: types,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const contentBase64 = await readAssetAsBase64(asset);

  return {
    name: asset.name,
    mimeType: asset.mimeType ?? undefined,
    contentBase64,
  };
}
