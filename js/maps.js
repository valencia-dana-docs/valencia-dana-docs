// Valencia DANA Graffiti Archive - Maps Functionality
// Google Maps integration and marker management

class MapsHandler {
  constructor() {
    this.map = null;
    this.markers = [];
    this.infoWindows = [];
    this.markerClusterer = null;
    this.currentInfoWindow = null;
    
    // Valencia city bounds for map restrictions
    this.valenciaBounds = {
      north: 39.5200,
      south: 39.4200,
      east: -0.3200,
      west: -0.4300
    };
  }
  
  // Initialize Google Map
  async initializeMap(imagesData = []) {
    try {
      // Validate CONFIG
      if (typeof CONFIG === 'undefined' || !CONFIG.googleMaps) {
        throw new Error('Configuración de Google Maps no encontrada');
      }
      
      // Get map container
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        throw new Error('Contenedor del mapa no encontrado');
      }
      
      // Map configuration
      const mapConfig = {
        center: CONFIG.googleMaps.center,
        zoom: CONFIG.googleMaps.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy',
        restriction: {
          latLngBounds: this.valenciaBounds,
          strictBounds: false,
        },
        styles: this.getMapStyles(),
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_LEFT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        fullscreenControl: false, // We handle this ourselves
      };
      
      // Create map
      this.map = new google.maps.Map(mapContainer, mapConfig);
      
      // Add custom controls
      this.addCustomControls();
      
      // Create markers for images
      if (imagesData && imagesData.length > 0) {
        await this.createMarkersFromImages(imagesData);
      }
      
      console.log(`✅ Map initialized with ${this.markers.length} markers`);
      return this.map;
      
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      throw error;
    }
  }
  
  // Get custom map styles
  getMapStyles() {
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'water',
        stylers: [{ color: '#4fc3f7' }]
      },
      {
        featureType: 'landscape',
        stylers: [{ color: '#f5f5f5' }]
      }
    ];
  }
  
  // Add custom controls to map
  addCustomControls() {
    // Info button
    const infoButton = document.createElement('button');
    infoButton.textContent = 'ℹ️';
    infoButton.className = 'custom-map-control';
    infoButton.title = 'Mostrar información';
    infoButton.style.cssText = `
      background: white;
      border: none;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      font-size: 16px;
      height: 40px;
      width: 40px;
      margin: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    infoButton.addEventListener('click', () => {
      const infoPanel = document.querySelector('.map-info-panel');
      if (infoPanel) {
        infoPanel.classList.toggle('hidden');
      }
    });
    
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoButton);
  }
  
  // Create markers from images data
  async createMarkersFromImages(imagesData) {
    try {
      console.log(`📍 Creating ${imagesData.length} markers...`);
      
      // Clear existing markers
      this.clearMarkers();
      
      // Create marker icon
      const markerIcon = this.createCustomMarkerIcon();
      
      // Create markers
      for (let i = 0; i < imagesData.length; i++) {
        const image = imagesData[i];
        
        // Validate coordinates
        if (!this.isValidCoordinate(image.lat, image.lng)) {
          console.warn(`Invalid coordinates for ${image.filename}: ${image.lat}, ${image.lng}`);
          continue;
        }
        
        // Create marker using AdvancedMarkerElement
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: image.lat, lng: image.lng },
          map: this.map,
          title: `Graffiti: ${image.filename}`,
          content: this.createCustomMarkerElement()
        });
        
        // Create info window
        const infoWindow = this.createInfoWindow(image);
        
        // Add click listener
        marker.addListener('click', () => {
          // Close current info window
          if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
          }
          
          // Open new info window
          infoWindow.open(this.map, marker);
          this.currentInfoWindow = infoWindow;
        });
        
        // Store references
        this.markers.push(marker);
        this.infoWindows.push(infoWindow);
      }
      
      console.log(`✅ Created ${this.markers.length} valid markers`);
      
      // Set up marker clustering if many markers
      if (this.markers.length > 20) {
        this.setupMarkerClustering();
      }
      
    } catch (error) {
      console.error('❌ Error creating markers:', error);
      throw error;
    }
  }
  
  // Validate coordinate values
  isValidCoordinate(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }
  
  // Create custom marker element for AdvancedMarkerElement
  createCustomMarkerElement() {
    const markerElement = document.createElement('div');
    markerElement.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #ff6b35;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    `;
    
    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.1)';
    });
    
    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
    });
    
    return markerElement;
  }
  
  // Legacy method for compatibility (kept for fallback)
  createCustomMarkerIcon() {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#ff6b35', // Valencia orange
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 12,
    };
  }
  
  // Create info window for image
  createInfoWindow(imageData) {
    // Format timestamp
    const date = new Date(imageData.timestamp);
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    }).format(date);
    
    // Create content
    const content = `
      <div class="info-window-content" style="max-width: 300px; padding: 10px;">
        <div class="image-container" style="margin-bottom: 10px; text-align: center;">
          <img 
            src="${imageData.url}" 
            alt="Graffiti: ${imageData.filename}"
            style="max-width: 280px; max-height: 200px; width: auto; height: auto; border-radius: 8px; cursor: pointer;"
            onclick="window.openImageModal('${imageData.url}', '${imageData.filename}', '${formattedDate}')"
            loading="lazy"
          />
        </div>
        <div class="info-details">
          <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">
            📷 ${imageData.filename}
          </p>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            📅 ${formattedDate}
          </p>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            📍 ${imageData.lat.toFixed(6)}, ${imageData.lng.toFixed(6)}
          </p>
          <button 
            onclick="window.openImageModal('${imageData.url}', '${imageData.filename}', '${formattedDate}')"
            style="
              background: #ff6b35;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              margin-top: 8px;
              transition: background-color 0.3s;
            "
            onmouseover="this.style.backgroundColor='#e55a2b'"
            onmouseout="this.style.backgroundColor='#ff6b35'"
          >
            🔍 Ver imagen completa
          </button>
        </div>
      </div>
    `;
    
    return new google.maps.InfoWindow({
      content: content,
      maxWidth: 320,
      pixelOffset: new google.maps.Size(0, -10)
    });
  }
  
  // Setup marker clustering for performance
  setupMarkerClustering() {
    try {
      // Check if MarkerClusterer is available
      if (typeof MarkerClusterer !== 'undefined') {
        this.markerClusterer = new MarkerClusterer({
          markers: this.markers,
          map: this.map,
          algorithm: new SuperClusterAlgorithm({}),
        });
        console.log('✅ Marker clustering enabled');
      } else {
        console.warn('⚠️ MarkerClusterer not available - using individual markers');
      }
    } catch (error) {
      console.warn('⚠️ Could not setup marker clustering:', error);
    }
  }
  
  // Clear all markers
  clearMarkers() {
    // Clear marker clusterer
    if (this.markerClusterer) {
      this.markerClusterer.clearMarkers();
      this.markerClusterer = null;
    }
    
    // Clear individual markers
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    
    // Clear info windows
    this.infoWindows.forEach(infoWindow => {
      infoWindow.close();
    });
    
    // Reset arrays
    this.markers = [];
    this.infoWindows = [];
    this.currentInfoWindow = null;
  }
  
  // Add new marker
  addMarker(imageData) {
    if (!this.isValidCoordinate(imageData.lat, imageData.lng)) {
      console.warn('Invalid coordinates for new marker');
      return null;
    }
    
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: imageData.lat, lng: imageData.lng },
      map: this.map,
      content: this.createCustomMarkerElement(),
      title: `Graffiti: ${imageData.filename}`
    });
    
    const infoWindow = this.createInfoWindow(imageData);
    
    marker.addListener('click', () => {
      if (this.currentInfoWindow) {
        this.currentInfoWindow.close();
      }
      infoWindow.open(this.map, marker);
      this.currentInfoWindow = infoWindow;
    });
    
    this.markers.push(marker);
    this.infoWindows.push(infoWindow);
    
    return marker;
  }
  
  // Center map on specific marker
  centerOnMarker(markerId) {
    const marker = this.markers[markerId];
    if (marker) {
      this.map.setCenter(marker.getPosition());
      this.map.setZoom(16);
    }
  }
  
  // Get map statistics
  getStats() {
    return {
      markersCount: this.markers.length,
      infoWindowsCount: this.infoWindows.length,
      hasClusterer: !!this.markerClusterer,
      currentZoom: this.map ? this.map.getZoom() : null,
      currentCenter: this.map ? this.map.getCenter() : null
    };
  }
}

// Global image modal function
window.openImageModal = function(imageUrl, filename, date) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'image-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
  `;
  
  // Create modal content
  const content = document.createElement('div');
  content.className = 'image-modal-content';
  content.style.cssText = `
    max-width: 90vw;
    max-height: 90vh;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    cursor: default;
  `;
  
  content.innerHTML = `
    <div style="position: relative;">
      <img 
        src="${imageUrl}" 
        alt="${filename}"
        style="width: 100%; height: auto; max-height: 80vh; object-fit: contain; display: block;"
      />
      <button 
        onclick="document.body.removeChild(this.closest('.image-modal-overlay'))"
        style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >×</button>
    </div>
    <div style="padding: 20px; border-top: 1px solid #eee;">
      <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${filename}</h3>
      <p style="margin: 0; color: #666; font-size: 14px;">${date}</p>
    </div>
  `;
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
  
  // Prevent content click from closing
  content.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Add ESC key listener
  const escListener = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', escListener);
    }
  };
  document.addEventListener('keydown', escListener);
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
};

// Create global instance
window.MapsHandler = new MapsHandler();

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapsHandler;
}