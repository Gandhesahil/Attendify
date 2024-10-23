export const haversineDistance = (coords1, coords2) => {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = (coords1.lat * Math.PI) / 180;
    const lat2 = (coords2.lat * Math.PI) / 180;
    const deltaLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
    const deltaLon = ((coords2.lon - coords1.lon) * Math.PI) / 180;
  
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c; // Distance in meters
    return distance;
  };
  