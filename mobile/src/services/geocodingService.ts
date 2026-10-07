import { MAPBOX_CONFIG } from '../config/mapbox';
import { DestinationItem, Coordinates } from '../types';

export const POPULAR_DESTINATIONS: DestinationItem[] = [
  // Maharashtra & Mumbai Region
  {
    id: 'loc-mum',
    name: 'Mumbai',
    state: 'Maharashtra',
    address: 'Mumbai, Maharashtra',
    coordinates: { latitude: 19.076, longitude: 72.8777 },
  },
  {
    id: 'loc-bkc',
    name: 'Bandra Kurla Complex (BKC)',
    state: 'Mumbai, Maharashtra',
    address: 'BKC, Bandra East, Mumbai, Maharashtra',
    coordinates: { latitude: 19.0657, longitude: 72.8687 },
  },
  {
    id: 'loc-and',
    name: 'Andheri West',
    state: 'Mumbai, Maharashtra',
    address: 'Lokhandwala, Andheri West, Mumbai, Maharashtra',
    coordinates: { latitude: 19.1363, longitude: 72.8277 },
  },
  {
    id: 'loc-pow',
    name: 'Powai (Hiranandani)',
    state: 'Mumbai, Maharashtra',
    address: 'Hiranandani Gardens, Powai, Mumbai',
    coordinates: { latitude: 19.1197, longitude: 72.9056 },
  },
  {
    id: 'loc-mdr',
    name: 'Marine Drive',
    state: 'Mumbai, Maharashtra',
    address: 'Netaji Subhash Chandra Bose Road, Mumbai',
    coordinates: { latitude: 18.9432, longitude: 72.823 },
  },
  {
    id: 'loc-csm',
    name: 'CSMT Railway Terminus',
    state: 'Mumbai, Maharashtra',
    address: 'Chhatrapati Shivaji Maharaj Terminus, Fort, Mumbai',
    coordinates: { latitude: 18.9401, longitude: 72.8354 },
  },
  {
    id: 'loc-pun',
    name: 'Pune',
    state: 'Maharashtra',
    address: 'Pune, Maharashtra',
    coordinates: { latitude: 18.5204, longitude: 73.8567 },
  },
  {
    id: 'loc-koth',
    name: 'Kothrud',
    state: 'Pune, Maharashtra',
    address: 'Kothrud, Pune, Maharashtra',
    coordinates: { latitude: 18.5074, longitude: 73.8077 },
  },
  {
    id: 'loc-hinj',
    name: 'Hinjawadi IT Park',
    state: 'Pune, Maharashtra',
    address: 'Phase 1, Hinjawadi Rajiv Gandhi Infotech Park, Pune',
    coordinates: { latitude: 18.5913, longitude: 73.7389 },
  },
  {
    id: 'loc-vim',
    name: 'Viman Nagar',
    state: 'Pune, Maharashtra',
    address: 'Viman Nagar, Pune, Maharashtra',
    coordinates: { latitude: 18.5679, longitude: 73.9143 },
  },
  {
    id: 'loc-ban',
    name: 'Baner',
    state: 'Pune, Maharashtra',
    address: 'Baner High Street, Pune, Maharashtra',
    coordinates: { latitude: 18.559, longitude: 73.7868 },
  },
  {
    id: 'loc-wak',
    name: 'Wakad',
    state: 'Pune, Maharashtra',
    address: 'Dange Chowk Road, Wakad, Pune',
    coordinates: { latitude: 18.5987, longitude: 73.7661 },
  },
  {
    id: 'loc-shiv',
    name: 'Shivajinagar',
    state: 'Pune, Maharashtra',
    address: 'Shivajinagar, Pune, Maharashtra',
    coordinates: { latitude: 18.5314, longitude: 73.8446 },
  },
  {
    id: 'loc-nag',
    name: 'Nagpur',
    state: 'Maharashtra',
    address: 'Nagpur, Maharashtra',
    coordinates: { latitude: 21.1458, longitude: 79.0882 },
  },
  {
    id: 'loc-nas',
    name: 'Nashik',
    state: 'Maharashtra',
    address: 'Nashik, Maharashtra',
    coordinates: { latitude: 19.9975, longitude: 73.7898 },
  },
  {
    id: 'loc-tha',
    name: 'Thane',
    state: 'Maharashtra',
    address: 'Thane West, Maharashtra',
    coordinates: { latitude: 19.2183, longitude: 72.9781 },
  },
  {
    id: 'loc-nav',
    name: 'Navi Mumbai (Vashi)',
    state: 'Maharashtra',
    address: 'Sector 17, Vashi, Navi Mumbai',
    coordinates: { latitude: 19.0771, longitude: 72.9986 },
  },
  {
    id: 'loc-aur',
    name: 'Chhatrapati Sambhajinagar (Aurangabad)',
    state: 'Maharashtra',
    address: 'Aurangabad, Maharashtra',
    coordinates: { latitude: 19.8762, longitude: 75.3433 },
  },
  {
    id: 'loc-lon',
    name: 'Lonavala',
    state: 'Maharashtra',
    address: 'Lonavala, Maharashtra',
    coordinates: { latitude: 18.7557, longitude: 73.4091 },
  },

  // Delhi NCR
  {
    id: 'loc-del',
    name: 'New Delhi',
    state: 'Delhi NCR',
    address: 'Connaught Place, New Delhi',
    coordinates: { latitude: 28.6139, longitude: 77.209 },
  },
  {
    id: 'loc-cp',
    name: 'Connaught Place',
    state: 'New Delhi',
    address: 'Central Secretariat, Connaught Place, New Delhi',
    coordinates: { latitude: 28.6315, longitude: 77.2167 },
  },
  {
    id: 'loc-igi',
    name: 'Indira Gandhi International Airport (IGI T3)',
    state: 'New Delhi',
    address: 'Terminal 3, IGI Airport, New Delhi',
    coordinates: { latitude: 28.5562, longitude: 77.1000 },
  },
  {
    id: 'loc-noi',
    name: 'Noida Sector 18',
    state: 'Uttar Pradesh',
    address: 'Sector 18, Noida, Uttar Pradesh',
    coordinates: { latitude: 28.5708, longitude: 77.326 },
  },
  {
    id: 'loc-noi62',
    name: 'Noida Sector 62',
    state: 'Uttar Pradesh',
    address: 'Sector 62 IT Hub, Noida, Uttar Pradesh',
    coordinates: { latitude: 28.6258, longitude: 77.3653 },
  },
  {
    id: 'loc-gur',
    name: 'Gurugram Cyber Hub',
    state: 'Haryana',
    address: 'DLF Cyber City, Gurugram, Haryana',
    coordinates: { latitude: 28.4952, longitude: 77.0891 },
  },
  {
    id: 'loc-dwk',
    name: 'Dwarka',
    state: 'New Delhi',
    address: 'Sector 10, Dwarka, New Delhi',
    coordinates: { latitude: 28.5823, longitude: 77.0504 },
  },
  {
    id: 'loc-hauz',
    name: 'Hauz Khas Village',
    state: 'New Delhi',
    address: 'Deer Park, Hauz Khas, New Delhi',
    coordinates: { latitude: 28.5534, longitude: 77.1945 },
  },
  {
    id: 'loc-saket',
    name: 'Saket (Select Citywalk)',
    state: 'New Delhi',
    address: 'District Centre, Saket, New Delhi',
    coordinates: { latitude: 28.5283, longitude: 77.2191 },
  },

  // Karnataka & Bengaluru Region
  {
    id: 'loc-blr',
    name: 'Bengaluru (Bangalore)',
    state: 'Karnataka',
    address: 'MG Road, Bengaluru, Karnataka',
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
  },
  {
    id: 'loc-ind',
    name: 'Indiranagar',
    state: 'Bengaluru, Karnataka',
    address: '100 Feet Road, Indiranagar, Bengaluru',
    coordinates: { latitude: 12.9784, longitude: 77.6408 },
  },
  {
    id: 'loc-kor',
    name: 'Koramangala',
    state: 'Bengaluru, Karnataka',
    address: 'Koramangala 4th Block, Bengaluru',
    coordinates: { latitude: 12.9352, longitude: 77.6245 },
  },
  {
    id: 'loc-whi',
    name: 'Whitefield',
    state: 'Bengaluru, Karnataka',
    address: 'ITPL Main Road, Whitefield, Bengaluru',
    coordinates: { latitude: 12.9698, longitude: 77.75 },
  },
  {
    id: 'loc-ele',
    name: 'Electronic City',
    state: 'Bengaluru, Karnataka',
    address: 'Phase 1, Electronic City, Bengaluru',
    coordinates: { latitude: 12.8452, longitude: 77.6602 },
  },
  {
    id: 'loc-hsr',
    name: 'HSR Layout',
    state: 'Bengaluru, Karnataka',
    address: 'Sector 1, HSR Layout, Bengaluru',
    coordinates: { latitude: 12.9116, longitude: 77.6389 },
  },
  {
    id: 'loc-kia',
    name: 'Kempegowda International Airport (BLR)',
    state: 'Bengaluru, Karnataka',
    address: 'Devanahalli, Bengaluru, Karnataka',
    coordinates: { latitude: 13.1986, longitude: 77.7066 },
  },
  {
    id: 'loc-mys',
    name: 'Mysuru (Mysore)',
    state: 'Karnataka',
    address: 'Mysuru Palace, Mysuru, Karnataka',
    coordinates: { latitude: 12.2958, longitude: 76.6394 },
  },

  // Telangana & Hyderabad Region
  {
    id: 'loc-hyd',
    name: 'Hyderabad',
    state: 'Telangana',
    address: 'Hyderabad, Telangana',
    coordinates: { latitude: 17.385, longitude: 78.4867 },
  },
  {
    id: 'loc-hit',
    name: 'HITEC City',
    state: 'Hyderabad, Telangana',
    address: 'Madhapur, HITEC City, Hyderabad',
    coordinates: { latitude: 17.4435, longitude: 78.3772 },
  },
  {
    id: 'loc-banj',
    name: 'Banjara Hills',
    state: 'Hyderabad, Telangana',
    address: 'Road No. 1, Banjara Hills, Hyderabad',
    coordinates: { latitude: 17.4156, longitude: 78.4357 },
  },
  {
    id: 'loc-gac',
    name: 'Gachibowli',
    state: 'Hyderabad, Telangana',
    address: 'Financial District, Gachibowli, Hyderabad',
    coordinates: { latitude: 17.4401, longitude: 78.3489 },
  },
  {
    id: 'loc-rgia',
    name: 'Rajiv Gandhi International Airport (HYD)',
    state: 'Hyderabad, Telangana',
    address: 'Shamshabad, Hyderabad, Telangana',
    coordinates: { latitude: 17.2403, longitude: 78.4294 },
  },

  // Tamil Nadu
  {
    id: 'loc-maa',
    name: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Marina Beach, Chennai, Tamil Nadu',
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    id: 'loc-tna',
    name: 'T. Nagar',
    state: 'Chennai, Tamil Nadu',
    address: 'Pondy Bazaar, T. Nagar, Chennai',
    coordinates: { latitude: 13.0418, longitude: 80.2341 },
  },
  {
    id: 'loc-vel',
    name: 'Velachery',
    state: 'Chennai, Tamil Nadu',
    address: 'Phoenix Marketcity, Velachery, Chennai',
    coordinates: { latitude: 12.9801, longitude: 80.2228 },
  },
  {
    id: 'loc-omr',
    name: 'OMR IT Corridor',
    state: 'Chennai, Tamil Nadu',
    address: 'Old Mahabalipuram Road, Chennai',
    coordinates: { latitude: 12.9165, longitude: 80.2285 },
  },
  {
    id: 'loc-cbe',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    address: 'Coimbatore, Tamil Nadu',
    coordinates: { latitude: 11.0168, longitude: 76.9558 },
  },

  // West Bengal
  {
    id: 'loc-ccu',
    name: 'Kolkata',
    state: 'West Bengal',
    address: 'Park Street, Kolkata, West Bengal',
    coordinates: { latitude: 22.5726, longitude: 88.3639 },
  },
  {
    id: 'loc-sal',
    name: 'Salt Lake (Sector V)',
    state: 'Kolkata, West Bengal',
    address: 'Sector V IT Centre, Bidhannagar, Kolkata',
    coordinates: { latitude: 22.5802, longitude: 88.4326 },
  },
  {
    id: 'loc-how',
    name: 'Howrah Railway Station',
    state: 'West Bengal',
    address: 'Howrah, West Bengal',
    coordinates: { latitude: 22.584, longitude: 88.3426 },
  },

  // Gujarat
  {
    id: 'loc-amd',
    name: 'Ahmedabad',
    state: 'Gujarat',
    address: 'SG Highway, Ahmedabad, Gujarat',
    coordinates: { latitude: 23.0225, longitude: 72.5714 },
  },
  {
    id: 'loc-sur',
    name: 'Surat',
    state: 'Gujarat',
    address: 'Surat, Gujarat',
    coordinates: { latitude: 21.1702, longitude: 72.8311 },
  },
  {
    id: 'loc-vad',
    name: 'Vadodara',
    state: 'Gujarat',
    address: 'Sayajigunj, Vadodara, Gujarat',
    coordinates: { latitude: 22.3072, longitude: 73.1812 },
  },

  // Rajasthan
  {
    id: 'loc-jai',
    name: 'Jaipur',
    state: 'Rajasthan',
    address: 'Hawa Mahal, Jaipur, Rajasthan',
    coordinates: { latitude: 26.9124, longitude: 75.7873 },
  },
  {
    id: 'loc-uda',
    name: 'Udaipur',
    state: 'Rajasthan',
    address: 'City Palace, Udaipur, Rajasthan',
    coordinates: { latitude: 24.5854, longitude: 73.7125 },
  },
  {
    id: 'loc-jod',
    name: 'Jodhpur',
    state: 'Rajasthan',
    address: 'Mehrangarh Fort, Jodhpur, Rajasthan',
    coordinates: { latitude: 26.2389, longitude: 73.0243 },
  },

  // Uttar Pradesh
  {
    id: 'loc-lko',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'Hazratganj, Lucknow, Uttar Pradesh',
    coordinates: { latitude: 26.8467, longitude: 80.9462 },
  },
  {
    id: 'loc-vns',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    address: 'Kashi Vishwanath, Varanasi, Uttar Pradesh',
    coordinates: { latitude: 25.3176, longitude: 82.9739 },
  },
  {
    id: 'loc-agr',
    name: 'Agra',
    state: 'Uttar Pradesh',
    address: 'Taj Mahal, Agra, Uttar Pradesh',
    coordinates: { latitude: 27.1767, longitude: 78.0081 },
  },

  // Punjab, Chandigarh, Uttarakhand, Goa & Kerala
  {
    id: 'loc-ixc',
    name: 'Chandigarh',
    state: 'Punjab / Haryana',
    address: 'Sector 17, Chandigarh',
    coordinates: { latitude: 30.7333, longitude: 76.7794 },
  },
  {
    id: 'loc-atq',
    name: 'Amritsar',
    state: 'Punjab',
    address: 'Golden Temple, Amritsar, Punjab',
    coordinates: { latitude: 31.634, longitude: 74.8723 },
  },
  {
    id: 'loc-ddn',
    name: 'Dehradun',
    state: 'Uttarakhand',
    address: 'Rajpur Road, Dehradun, Uttarakhand',
    coordinates: { latitude: 30.3165, longitude: 78.0322 },
  },
  {
    id: 'loc-goa',
    name: 'Goa (Panaji)',
    state: 'Goa',
    address: 'Panaji, North Goa',
    coordinates: { latitude: 15.4909, longitude: 73.8278 },
  },
  {
    id: 'loc-cok',
    name: 'Kochi (Cochin)',
    state: 'Kerala',
    address: 'Marine Drive, Kochi, Kerala',
    coordinates: { latitude: 9.9312, longitude: 76.2673 },
  },
  {
    id: 'loc-idr',
    name: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Vijay Nagar, Indore, Madhya Pradesh',
    coordinates: { latitude: 22.7196, longitude: 75.8577 },
  },
  {
    id: 'loc-bho',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'MP Nagar, Bhopal, Madhya Pradesh',
    coordinates: { latitude: 23.2599, longitude: 77.4126 },
  },
  {
    id: 'loc-pat',
    name: 'Patna',
    state: 'Bihar',
    address: 'Dak Bungalow Crossing, Patna, Bihar',
    coordinates: { latitude: 25.5941, longitude: 85.1376 },
  },
  {
    id: 'loc-bhu',
    name: 'Bhubaneswar',
    state: 'Odisha',
    address: 'Janpath, Bhubaneswar, Odisha',
    coordinates: { latitude: 20.2961, longitude: 85.8245 },
  },
  {
    id: 'loc-guw',
    name: 'Guwahati',
    state: 'Assam',
    address: 'GS Road, Guwahati, Assam',
    coordinates: { latitude: 26.1445, longitude: 91.7362 },
  },
];

export const ALL_POPULAR_DESTINATIONS = POPULAR_DESTINATIONS;

export class GeocodingService {
  // Strip country name from returned strings to keep display clean and compliant
  private static sanitizeAddress(text: string): string {
    if (!text) return '';
    return text
      .replace(/,\s*India$/i, '')
      .replace(/\s*India$/i, '')
      .replace(/,\s*IN$/i, '')
      .trim();
  }

  public static async searchDestinations(
    query: string,
    userCoords?: Coordinates
  ): Promise<DestinationItem[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return POPULAR_DESTINATIONS.slice(0, 10);
    }

    const collectedResults: DestinationItem[] = [];
    const seenNames = new Set<string>();

    const addUniqueItem = (item: DestinationItem) => {
      const lat = item.coordinates?.latitude ? Math.round(item.coordinates.latitude * 100) : 0;
      const lng = item.coordinates?.longitude ? Math.round(item.coordinates.longitude * 100) : 0;
      const key = `${item.name.toLowerCase()}||${lat}||${lng}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        collectedResults.push(item);
      }
    };

    // 1. Mapbox Geocoding with proximity boost (searches ALL places without restriction)
    if (MAPBOX_CONFIG.hasValidToken()) {
      try {
        const proximity = userCoords
          ? `&proximity=${userCoords.longitude},${userCoords.latitude}`
          : '';
        const url = `${MAPBOX_CONFIG.geocodingEndpoint}/${encodeURIComponent(
          cleanQuery
        )}.json?access_token=${MAPBOX_CONFIG.token}${proximity}&limit=12&autocomplete=true`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.features) && data.features.length > 0) {
            for (let index = 0; index < data.features.length; index++) {
              const feature = data.features[index];
              const context = feature.context || [];
              const region =
                context.find((c: any) => c.id.startsWith('region'))?.text ||
                context.find((c: any) => c.id.startsWith('place'))?.text ||
                '';
              const sanitizedName = feature.text || feature.place_name.split(',')[0];
              const sanitizedAddr = GeocodingService.sanitizeAddress(feature.place_name);

              addUniqueItem({
                id: feature.id || `mb-dest-${index}`,
                name: sanitizedName,
                state: GeocodingService.sanitizeAddress(region),
                address: sanitizedAddr,
                coordinates: {
                  latitude: feature.center[1],
                  longitude: feature.center[0],
                },
              });
            }
          }
        }
      } catch (error) {
        console.warn('Mapbox Geocoding network error, falling back to Nominatim:', error);
      }
    }

    // 2. OpenStreetMap Nominatim Fallback (searches EVERY street, neighborhood, shop, colony)
    if (collectedResults.length < 5) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          cleanQuery
        )}&format=json&addressdetails=1&limit=10`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const osmResponse = await fetch(osmUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'WaySureApp/1.0' },
        });
        clearTimeout(timeoutId);

        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          if (Array.isArray(osmData) && osmData.length > 0) {
            for (let idx = 0; idx < osmData.length; idx++) {
              const item = osmData[idx];
              const addr = item.address || {};
              const localPart =
                addr.road || addr.suburb || addr.neighbourhood || addr.residential || item.name;
              const city =
                addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
              const state = addr.state || '';

              addUniqueItem({
                id: `osm-${item.place_id || idx}`,
                name: item.name || localPart || city,
                state: state,
                address: GeocodingService.sanitizeAddress(item.display_name),
                coordinates: {
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lon),
                },
              });
            }
          }
        }
      } catch {
        // Fall through to pre-indexed list
      }
    }

    // 3. Fast Pre-indexed Database Filter (covers major landmarks and metros immediately)
    const matched = POPULAR_DESTINATIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(item.name.toLowerCase()) ||
        item.state.toLowerCase().includes(cleanQuery) ||
        (item.address && item.address.toLowerCase().includes(cleanQuery))
    );

    matched.forEach((m) => addUniqueItem(m));

    if (collectedResults.length > 0) {
      return collectedResults;
    }

    // 4. Coordinate Pair Direct Parsing (e.g. "19.07, 72.87")
    const coordMatch = cleanQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const parsedLat = parseFloat(coordMatch[1]);
      const parsedLng = parseFloat(coordMatch[3]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng) && Math.abs(parsedLat) <= 90 && Math.abs(parsedLng) <= 180) {
        return [
          {
            id: `coord-${Date.now()}`,
            name: `${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}`,
            state: 'Custom Coordinates',
            address: `Latitude: ${parsedLat.toFixed(5)}, Longitude: ${parsedLng.toFixed(5)}`,
            coordinates: { latitude: parsedLat, longitude: parsedLng },
          },
        ];
      }
    }

    // 5. Clean default fallback: Anchored to destination center or default metro
    const baseCoords = userCoords || { latitude: 28.6139, longitude: 77.209 };
    return [
      {
        id: `dest-${Date.now()}`,
        name: query.trim(),
        state: 'Selected Destination',
        address: query.trim(),
        coordinates: {
          latitude: baseCoords.latitude,
          longitude: baseCoords.longitude,
        },
      },
    ];
  }

  // Geocode a single destination by name with zero-crash guarantee
  public static async geocodePlaceName(
    name: string,
    userCoords?: Coordinates
  ): Promise<DestinationItem> {
    const results = await this.searchDestinations(name, userCoords);
    if (results.length > 0) {
      return results[0];
    }
    const baseCoords = userCoords || { latitude: 28.6139, longitude: 77.209 };
    return {
      id: `place-${Date.now()}`,
      name: name.trim(),
      state: 'Selected Destination',
      address: name.trim(),
      coordinates: {
        latitude: baseCoords.latitude,
        longitude: baseCoords.longitude,
      },
    };
  }
}
