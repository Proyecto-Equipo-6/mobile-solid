import Constants from 'expo-constants';

let cachedBaseUrl: string | null = null;

function getApiBaseUrl(): string {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    cachedBaseUrl = envUrl.replace('/api/v1', '');
    return cachedBaseUrl;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    cachedBaseUrl = `http://${host}:3000`;
    return cachedBaseUrl;
  }
  cachedBaseUrl = 'http://localhost:3000';
  return cachedBaseUrl;
}

export function resolveImageUrl(imageUrl: string | undefined | null): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${getApiBaseUrl()}${imageUrl}`;
  }

  if (imageUrl.includes('cloudinary.com')) {
    return `https://${imageUrl}`;
  }

  return `${getApiBaseUrl()}/uploads/${imageUrl}`;
}