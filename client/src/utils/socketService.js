import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a delivery room
  joinDelivery(deliveryId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-delivery', deliveryId);
      console.log(`📦 Joined delivery room: ${deliveryId}`);
    }
  }

  // Leave a delivery room
  leaveDelivery(deliveryId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-delivery', deliveryId);
      console.log(`📦 Left delivery room: ${deliveryId}`);
    }
  }

  // Update volunteer location
  updateLocation(deliveryId, location, status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-location', {
        deliveryId,
        location: {
          lat: location.latitude || location.lat,
          lng: location.longitude || location.lng,
          accuracy: location.accuracy
        },
        status
      });
    }
  }

  // Update delivery status
  updateStatus(deliveryId, status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-status', {
        deliveryId,
        status
      });
    }
  }

  // Listen for location updates
  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('location-updated', callback);
    }
  }

  // Listen for status updates
  onStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('status-updated', callback);
    }
  }

  // Remove location update listener
  offLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('location-updated', callback);
    }
  }

  // Remove status update listener
  offStatusUpdate(callback) {
    if (this.socket) {
      this.socket.off('status-updated', callback);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
