import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Enhanced custom marker icons with modern design
const createMarkerIcon = (color, iconClass, role) => {
  const pulseClass = role === 'volunteer' ? 'marker-pulse-active' : '';
  
  return L.divIcon({
    className: 'custom-marker-container',
    html: `
      <div class="marker-wrapper">
        <div class="marker-pin-modern ${pulseClass}" style="background: ${color};">
          <div class="marker-icon-inner">
            <i class="${iconClass}"></i>
          </div>
          <div class="marker-pointer" style="border-top-color: ${color};"></div>
        </div>
        ${role === 'volunteer' ? `
          <div class="marker-pulse-ring" style="border-color: ${color};"></div>
          <div class="marker-pulse-ring-2" style="border-color: ${color};"></div>
        ` : ''}
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
};

// Marker configurations
const MARKER_CONFIG = {
  donor: {
    color: '#10b981',
    icon: 'fas fa-home',
    label: 'Pickup Point'
  },
  volunteer: {
    color: '#3b82f6',
    icon: 'fas fa-bicycle',
    label: 'Volunteer'
  },
  receiver: {
    color: '#8b5cf6',
    icon: 'fas fa-map-marker-alt',
    label: 'Delivery Point'
  },
  admin: {
    color: '#ef4444',
    icon: 'fas fa-shield-alt',
    label: 'Admin'
  }
};

// Map controller to auto-fit bounds
const MapController = ({ markers, autoFit }) => {
  const map = useMap();
  
  useEffect(() => {
    if (autoFit && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, autoFit, map]);

  return null;
};

const LiveMap = ({
  center = [19.0760, 72.8777],
  zoom = 13,
  markers = [],
  showRoute = false,
  routePositions = [],
  autoFit = false,
  onMarkerClick
}) => {
  const mapRef = useRef(null);

  return (
    <div className="live-map-container-modern">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
        zoomControl={false}
      >
        {/* Modern dark map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {/* Custom zoom control */}
        <div className="custom-map-controls">
          <button 
            className="zoom-btn zoom-in"
            onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            className="zoom-btn zoom-out"
            onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>

        {/* Render markers */}
        {markers.map((marker) => {
          const config = MARKER_CONFIG[marker.role] || MARKER_CONFIG.volunteer;
          
          return (
            <React.Fragment key={marker.id}>
              {/* Marker */}
              <Marker
                position={marker.position}
                icon={createMarkerIcon(config.color, config.icon, marker.role)}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(marker)
                }}
              >
                <Popup className="modern-popup">
                  <div className="popup-content-modern">
                    <div className="popup-header" style={{ backgroundColor: config.color }}>
                      <i className={config.icon}></i>
                      <span>{config.label}</span>
                    </div>
                    <div className="popup-body">
                      <h4>{marker.name}</h4>
                      {marker.status && (
                        <div className="popup-status">
                          <span className="status-badge" style={{ backgroundColor: config.color }}>
                            {marker.status}
                          </span>
                        </div>
                      )}
                      {marker.phone && (
                        <p className="popup-info">
                          <i className="fas fa-phone"></i> {marker.phone}
                        </p>
                      )}
                      {marker.distance && (
                        <p className="popup-info">
                          <i className="fas fa-map-marker-alt"></i> {marker.distance}
                        </p>
                      )}
                      {marker.eta && (
                        <p className="popup-info highlight">
                          <i className="fas fa-clock"></i> ETA: <strong>{marker.eta}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Accuracy circle for volunteer */}
              {marker.role === 'volunteer' && marker.accuracy && (
                <Circle
                  center={marker.position}
                  radius={marker.accuracy}
                  pathOptions={{
                    fillColor: config.color,
                    fillOpacity: 0.1,
                    color: config.color,
                    weight: 1,
                    opacity: 0.3
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Route line */}
        {showRoute && routePositions.length > 1 && (
          <>
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#3b82f6',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 15',
                lineCap: 'round'
              }}
            />
            {/* Shadow line for depth */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#1e40af',
                weight: 6,
                opacity: 0.2
              }}
            />
          </>
        )}

        {/* Auto-fit bounds controller */}
        <MapController markers={markers} autoFit={autoFit} />
      </MapContainer>

      {/* Map legend */}
      <div className="map-legend">
        {Object.entries(MARKER_CONFIG).map(([key, config]) => (
          <div key={key} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: config.color }}></div>
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveMap;
