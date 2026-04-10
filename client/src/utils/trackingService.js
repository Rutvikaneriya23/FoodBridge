import { ref, set, onValue, off, update } from 'firebase/database';
import { database } from '../config/firebase';

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Update volunteer location in Firebase
export const updateVolunteerLocation = async (deliveryId, location) => {
  try {
    const deliveryRef = ref(database, `deliveries/${deliveryId}`);
    await update(deliveryRef, {
      volunteer_location: {
        lat: location.latitude,
        lng: location.longitude,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error updating volunteer location:', error);
  }
};

// Auto-update delivery status based on proximity
export const autoUpdateStatus = async (deliveryId, volunteerLoc, donorLoc, receiverLoc, currentStatus) => {
  const PROXIMITY_THRESHOLD = 50; // 50 meters

  let newStatus = currentStatus;

  // Check distance from donor
  const distanceFromDonor = calculateDistance(
    volunteerLoc.lat,
    volunteerLoc.lng,
    donorLoc.lat,
    donorLoc.lng
  );

  // Check distance from receiver
  const distanceFromReceiver = calculateDistance(
    volunteerLoc.lat,
    volunteerLoc.lng,
    receiverLoc.lat,
    receiverLoc.lng
  );

  // Auto-update status logic
  if (distanceFromReceiver <= PROXIMITY_THRESHOLD && currentStatus !== 'DELIVERED') {
    newStatus = 'DELIVERED';
  } else if (distanceFromDonor > PROXIMITY_THRESHOLD && currentStatus === 'PICKED_UP') {
    newStatus = 'ON_THE_WAY';
  } else if (distanceFromDonor <= PROXIMITY_THRESHOLD && currentStatus === 'ASSIGNED') {
    newStatus = 'PICKED_UP';
  }

  // Update status if changed
  if (newStatus !== currentStatus) {
    const deliveryRef = ref(database, `deliveries/${deliveryId}`);
    await update(deliveryRef, {
      status: newStatus,
      lastUpdated: Date.now()
    });
  }

  return { newStatus, distanceFromDonor, distanceFromReceiver };
};

// Create delivery in Firebase
export const createDelivery = async (deliveryId, donorLocation, receiverLocation) => {
  try {
    const deliveryRef = ref(database, `deliveries/${deliveryId}`);
    await set(deliveryRef, {
      donor_location: donorLocation,
      receiver_location: receiverLocation,
      volunteer_location: null,
      status: 'ASSIGNED',
      createdAt: Date.now(),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
  }
};

// Listen to delivery updates
export const listenToDelivery = (deliveryId, callback) => {
  const deliveryRef = ref(database, `deliveries/${deliveryId}`);
  
  onValue(deliveryRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  // Return cleanup function
  return () => off(deliveryRef);
};

// Listen to all deliveries (Admin)
export const listenToAllDeliveries = (callback) => {
  const deliveriesRef = ref(database, 'deliveries');
  
  onValue(deliveriesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  return () => off(deliveriesRef);
};

// Calculate ETA (estimated time of arrival)
export const calculateETA = (distanceInMeters) => {
  const AVERAGE_SPEED_KMH = 15; // 15 km/h average speed
  const AVERAGE_SPEED_MS = AVERAGE_SPEED_KMH * 1000 / 3600; // Convert to m/s
  
  const timeInSeconds = distanceInMeters / AVERAGE_SPEED_MS;
  const minutes = Math.ceil(timeInSeconds / 60);
  
  if (minutes < 1) return 'Less than 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} mins`;
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

// Start tracking volunteer location (updates every 5 seconds)
export const startTracking = (deliveryId, onLocationUpdate) => {
  let watchId;

  const trackingInterval = setInterval(async () => {
    try {
      const location = await getCurrentLocation();
      await updateVolunteerLocation(deliveryId, location);
      
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }, 5000); // Update every 5 seconds

  // Also use native geolocation watching
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        await updateVolunteerLocation(deliveryId, location);
        
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (error) => console.error('Watch position error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  // Return cleanup function
  return () => {
    clearInterval(trackingInterval);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  };
};

// Stop tracking (clear location from Firebase)
export const stopTracking = async (deliveryId) => {
  try {
    const deliveryRef = ref(database, `deliveries/${deliveryId}`);
    await update(deliveryRef, {
      volunteer_location: null,
      status: 'DELIVERED',
      deliveredAt: Date.now()
    });
  } catch (error) {
    console.error('Error stopping tracking:', error);
  }
};
