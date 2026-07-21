export class LocationPermissionDeniedError extends Error {
  constructor() {
    super('Location permission was denied');
    this.name = 'LocationPermissionDeniedError';
  }
}

export class LocationUnavailableError extends Error {
  constructor(message = 'Unable to determine your location') {
    super(message);
    this.name = 'LocationUnavailableError';
  }
}

const getCurrentCoordinates = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new LocationUnavailableError('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) reject(new LocationPermissionDeniedError());
        else reject(new LocationUnavailableError(error.message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });

// Reverse geocoding via OpenStreetMap's Nominatim — free and key-less, mirroring
// the mobile app's approach (src/services/locationService.js there) since the
// project has no Google Maps / Places API key configured anywhere.
const reverseGeocode = async ({ latitude, longitude }) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new LocationUnavailableError('Unable to resolve address for this location');
  }

  const data = await response.json();
  const address = data.address ?? {};

  const addressLine = [address.road, address.suburb || address.neighbourhood]
    .filter(Boolean)
    .join(', ') || data.display_name || '';

  return {
    addressLine,
    city: address.city || address.town || address.village || address.county || '',
    state: address.state || '',
    pincode: address.postcode || '',
  };
};

export const fetchCurrentAddress = async () => {
  const coordinates = await getCurrentCoordinates();
  const address = await reverseGeocode(coordinates);
  return { ...address, ...coordinates };
};
