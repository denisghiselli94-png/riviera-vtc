/**
 * Geolocation and reverse geocoding utility
 * Uses native navigator.geolocation with fallback to coordinates
 * and free OpenStreetMap Nominatim reverse geocode with a strict 3-second timeout.
 */

export interface GeoResult {
  address: string;
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  isCoordinatesOnly: boolean;
  error?: string;
}

export async function getCurrentLocation(): Promise<GeoResult> {
  if (!navigator.geolocation) {
    throw new Error('La géolocalisation n’est pas supportée par votre navigateur.');
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        let msg = 'Impossible d’accéder à votre position GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Autorisation de géolocalisation refusée. Veuillez autoriser l’accès dans vos réglages.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Délai d’attente GPS dépassé.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 15000,
      }
    );
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const fallbackAddress = `Position GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`;

  // Attempt reverse geocoding with OpenStreetMap Nominatim (timeout 3000ms)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr&zoom=18`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const streetNumber = addr.house_number || '';
        const road = addr.road || addr.pedestrian || addr.street || '';
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        const postcode = addr.postcode || '';

        const parts: string[] = [];
        const street = [streetNumber, road].filter(Boolean).join(' ');
        if (street) parts.push(street);
        const cityPart = [postcode, city].filter(Boolean).join(' ');
        if (cityPart) parts.push(cityPart);

        if (parts.length > 0) {
          return {
            address: parts.join(', '),
            coords: { latitude: lat, longitude: lng, accuracy: position.coords.accuracy },
            isCoordinatesOnly: false,
          };
        } else if (data.display_name) {
          // Truncate long display name to something short and readable
          const clean = data.display_name.split(',').slice(0, 3).join(',').trim();
          return {
            address: clean || fallbackAddress,
            coords: { latitude: lat, longitude: lng, accuracy: position.coords.accuracy },
            isCoordinatesOnly: false,
          };
        }
      }
    }
  } catch {
    // Network failure, offline, or timeout: gracefully fallback to GPS coordinates
  }

  return {
    address: fallbackAddress,
    coords: { latitude: lat, longitude: lng, accuracy: position.coords.accuracy },
    isCoordinatesOnly: true,
  };
}
