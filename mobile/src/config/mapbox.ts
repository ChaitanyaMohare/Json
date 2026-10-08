const decodeFallback = (b64: string): string => {
  if (typeof atob === 'function') {
    try {
      return atob(b64);
    } catch {
      // fallback to manual decode
    }
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = '';
  for (let i = 0; i < b64.length; i += 4) {
    const enc1 = chars.indexOf(b64.charAt(i));
    const enc2 = chars.indexOf(b64.charAt(i + 1));
    const enc3 = chars.indexOf(b64.charAt(i + 2));
    const enc4 = chars.indexOf(b64.charAt(i + 3));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    str += String.fromCharCode(chr1);
    if (enc3 !== 64 && enc3 !== -1) str += String.fromCharCode(chr2);
    if (enc4 !== 64 && enc4 !== -1) str += String.fromCharCode(chr3);
  }
  return str;
};

const DEFAULT_MAPBOX_B64 =
  'cGsuZXlKMUlqb2lkMkY1YzNWeVpUQXhJaXdpWVNJNkltTnRkWGh3Tm5Kblp6QmhkWFF5ZDNOa1kycHdiV1pxWVhvaWZRLkFhaHVraXhoaF9KQ19yMGdrcUw5MEE=';

export const MAPBOX_ACCESS_TOKEN: string =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || decodeFallback(DEFAULT_MAPBOX_B64);

export const MAPBOX_CONFIG = {
  token: MAPBOX_ACCESS_TOKEN,
  defaultCenter: {
    latitude: 28.6139,
    longitude: 77.209,
    name: 'New Delhi',
    state: 'Central',
  },
  geocodingEndpoint: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  directionsEndpoint: 'https://api.mapbox.com/directions/v5/mapbox',
  styleUrl: 'mapbox://styles/mapbox/streets-v12',
  hasValidToken: () => {
    return (
      typeof MAPBOX_ACCESS_TOKEN === 'string' &&
      MAPBOX_ACCESS_TOKEN.length > 20 &&
      !MAPBOX_ACCESS_TOKEN.includes('demo')
    );
  },
};
