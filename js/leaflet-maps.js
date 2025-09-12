// Valencia DANA Graffiti Archive - OpenStreetMap with Leaflet
// Alternative mapping solution using OpenStreetMap and Leaflet

class LeafletMapsHandler {
  constructor() {
    this.map = null;
    this.markers = [];
    this.currentPopup = null;
    
    // Valencia city center coordinates
    this.valenciaCenter = [39.4699, -0.3763];
    this.defaultZoom = 12;
  }
  
  // Initialize Leaflet Map with OpenStreetMap
  async initializeMap(imagesData = []) {
    try {
      console.log('🗺️ Initializing OpenStreetMap with Leaflet...');
      
      // Get map container
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        throw new Error('Map container not found');
      }
      
      // Clear any existing map
      if (this.map) {
        this.map.remove();
      }
      
      // Create Leaflet map
      this.map = L.map('map', {
        center: this.valenciaCenter,
        zoom: this.defaultZoom,
        zoomControl: true,
        attributionControl: true
      });
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10
      }).addTo(this.map);
      
      // Add scale control
      L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
      }).addTo(this.map);
      
      // Create markers for images
      if (imagesData && imagesData.length > 0) {
        await this.createMarkersFromImages(imagesData);
      }
      
      console.log(`✅ OpenStreetMap initialized with ${this.markers.length} markers`);
      return this.map;
      
    } catch (error) {
      console.error('❌ Error initializing OpenStreetMap:', error);
      throw error;
    }
  }
  
  // Create markers from images data
  async createMarkersFromImages(imagesData) {
    try {
      console.log(`📍 Creating ${imagesData.length} markers on OpenStreetMap...`);
      
      // Clear existing markers
      this.clearMarkers();
      
      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      
      // Create markers
      for (let i = 0; i < imagesData.length; i++) {
        const image = imagesData[i];
        
        // Validate coordinates
        if (!this.isValidCoordinate(image.lat, image.lng)) {
          console.warn(`Invalid coordinates for ${image.filename}: ${image.lat}, ${image.lng}`);
          continue;
        }
        
        // Create marker
        const marker = L.marker([image.lat, image.lng], {
          icon: customIcon,
          title: `Graffiti: ${image.filename}`
        }).addTo(this.map);
        
        // Create popup content
        const popupContent = this.createPopupContent(image);
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-popup'
        });
        
        // Add click event
        marker.on('click', () => {
          console.log(`📌 Clicked marker for ${image.filename}`);
        });
        
        this.markers.push(marker);
        console.log(`✓ Created marker at ${image.lat}, ${image.lng} for ${image.filename}`);
      }
      
      // Fit map to show all markers
      if (this.markers.length > 0) {
        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      }
      
      console.log(`✅ Created ${this.markers.length} markers on OpenStreetMap`);
      
    } catch (error) {
      console.error('❌ Error creating markers on OpenStreetMap:', error);
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
  
  // Create popup content for image
  createPopupContent(imageData) {
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
    
    return `
      <div class="popup-content" style="max-width: 280px; text-align: center;">
        <div class="image-container" style="margin-bottom: 10px;">
          <img 
            src="${imageData.url}" 
            alt="Graffiti: ${imageData.filename}"
            style="max-width: 260px; max-height: 180px; width: auto; height: auto; border-radius: 8px; cursor: pointer;"
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
  }
  
  // Clear all markers
  clearMarkers() {
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers = [];
    this.currentPopup = null;
  }
  
  // Add new marker
  addMarker(imageData) {
    if (!this.isValidCoordinate(imageData.lat, imageData.lng)) {
      console.warn('Invalid coordinates for new marker');
      return null;
    }
    
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    
    const marker = L.marker([imageData.lat, imageData.lng], {
      icon: customIcon,
      title: `Graffiti: ${imageData.filename}`
    }).addTo(this.map);
    
    const popupContent = this.createPopupContent(imageData);
    marker.bindPopup(popupContent, {
      maxWidth: 320,
      className: 'custom-popup'
    });
    
    this.markers.push(marker);
    return marker;
  }
  
  // Center map on specific coordinates
  centerOn(lat, lng, zoom = 16) {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
    }
  }
  
  // Get map statistics
  getStats() {
    return {
      markersCount: this.markers.length,
      currentZoom: this.map ? this.map.getZoom() : null,
      currentCenter: this.map ? this.map.getCenter() : null,
      mapType: 'OpenStreetMap with Leaflet'
    };
  }
}

// Create global instance
window.LeafletMapsHandler = new LeafletMapsHandler();

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeafletMapsHandler;
}