// Valencia DANA Graffiti Archive - Main JavaScript
// Main application logic and UI management

class GraffitiApp {
  constructor() {
    this.imagesData = null;
    this.map = null;
    this.markers = [];
    this.infoWindows = [];
    this.loadingProgress = 0;
    this.isLoading = false;
    
    // DOM elements
    this.loadingScreen = null;
    this.loadingProgress = null;
    this.loadingText = null;
    this.imageCounter = null;
    this.mappableCounter = null;
    this.lastUpdateTime = null;
    this.instagramLink = null;
    this.footerInstagramLink = null;
    this.mapInfoPanel = null;
    
    // Bind methods
    this.initializeApplication = this.initializeApplication.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.showError = this.showError.bind(this);
    
    // Make globally available for Google Maps callback
    window.initializeApplication = this.initializeApplication;
    window.showError = this.showError;
  }
  
  // Initialize DOM references
  initializeDOMReferences() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingProgressBar = document.getElementById('loading-progress');
    this.loadingText = document.getElementById('loading-text');
    this.imageCounter = document.getElementById('image-counter');
    this.mappableCounter = document.getElementById('mappable-counter');
    this.lastUpdateTime = document.getElementById('last-update-time');
    this.instagramLink = document.getElementById('instagram-link');
    this.footerInstagramLink = document.getElementById('footer-instagram-link');
    this.mapInfoPanel = document.querySelector('.map-info-panel');
    
    this.updateLoadingProgress(10, 'Referencias DOM inicializadas');
  }
  
  // Update loading progress
  updateLoadingProgress(percentage, message) {
    if (this.loadingProgressBar) {
      this.loadingProgressBar.style.width = `${percentage}%`;
    }
    if (this.loadingText) {
      this.loadingText.textContent = message;
    }
    this.loadingProgress = percentage;
  }
  
  // Hide loading screen with animation
  hideLoading() {
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.classList.add('hidden');
      }
    }, 500);
  }
  
  // Show error message
  showError(message) {
    console.error('Error:', message);
    this.updateLoadingProgress(0, `Error: ${message}`);
    
    // Check if it's a Google Maps API key issue
    if (message.includes('InvalidKey') || message.includes('API key')) {
      message = 'Clave de API de Google Maps inválida. Configura tu API key en data/config.js';
    }
    
    // Show error in loading screen
    if (this.loadingText) {
      this.loadingText.innerHTML = `
        ❌ Error: ${message}<br>
        <small>Revisa la consola para más detalles</small>
      `;
    }
  }
  
  // Load images data from JSON
  async loadImagesData() {
    try {
      this.updateLoadingProgress(20, 'Cargando datos de graffitis...');
      
      const response = await fetch('data/images.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.images)) {
        throw new Error('Formato de datos inválido');
      }
      
      this.imagesData = data;
      this.updateLoadingProgress(40, `Cargados ${data.images.length} graffitis con GPS`);
      
      return data;
    } catch (error) {
      console.error('Error loading images data:', error);
      throw new Error(`No se pudieron cargar los datos: ${error.message}`);
    }
  }
  
  // Update UI elements with loaded data
  updateUI() {
    if (!this.imagesData) return;
    
    try {
      // Update counters
      if (this.imageCounter) {
        this.imageCounter.textContent = this.imagesData.totalImages || this.imagesData.images.length;
      }
      
      if (this.mappableCounter) {
        this.mappableCounter.textContent = this.imagesData.mappableImages || this.imagesData.images.length;
      }
      
      // Update last update time
      if (this.lastUpdateTime && this.imagesData.lastUpdated) {
        const updateDate = new Date(this.imagesData.lastUpdated);
        const formatter = new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Madrid'
        });
        this.lastUpdateTime.textContent = formatter.format(updateDate);
      }
      
      // Update Instagram links
      if (typeof CONFIG !== 'undefined' && CONFIG.instagram) {
        const instagramUrl = CONFIG.instagram.url || `https://instagram.com/${CONFIG.instagram.username}`;
        
        if (this.instagramLink) {
          this.instagramLink.href = instagramUrl;
        }
        
        if (this.footerInstagramLink) {
          this.footerInstagramLink.href = instagramUrl;
        }
      }
      
      this.updateLoadingProgress(60, 'Interfaz actualizada');
    } catch (error) {
      console.warn('Error updating UI:', error);
    }
  }
  
  // Setup event listeners
  setupEventListeners() {
    try {
      // Recenter button
      const recenterBtn = document.getElementById('recenter-btn');
      if (recenterBtn) {
        recenterBtn.addEventListener('click', () => {
          if (this.map && typeof CONFIG !== 'undefined' && CONFIG.googleMaps) {
            this.map.setCenter(CONFIG.googleMaps.center);
            this.map.setZoom(CONFIG.googleMaps.zoom);
          }
        });
      }
      
      // Fullscreen button
      const fullscreenBtn = document.getElementById('fullscreen-btn');
      if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
      }
      
      // Close info panel
      const closeInfoBtn = document.getElementById('close-info');
      if (closeInfoBtn && this.mapInfoPanel) {
        closeInfoBtn.addEventListener('click', () => {
          this.mapInfoPanel.classList.add('hidden');
        });
      }
      
      // Modal functionality
      this.setupModalListeners();
      
      // Keyboard shortcuts
      document.addEventListener('keydown', this.handleKeyboard.bind(this));
      
      this.updateLoadingProgress(70, 'Eventos configurados');
    } catch (error) {
      console.warn('Error setting up event listeners:', error);
    }
  }
  
  // Setup modal event listeners
  setupModalListeners() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => this.hideModal());
    }
    
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.hideModal();
        }
      });
    }
  }
  
  // Handle keyboard shortcuts
  handleKeyboard(event) {
    switch (event.key) {
      case 'Escape':
        this.hideModal();
        break;
      case 'f':
      case 'F':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleFullscreen();
        }
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          // Recenter map
          if (this.map && typeof CONFIG !== 'undefined' && CONFIG.googleMaps) {
            this.map.setCenter(CONFIG.googleMaps.center);
            this.map.setZoom(CONFIG.googleMaps.zoom);
          }
        }
        break;
    }
  }
  
  // Toggle fullscreen mode
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Could not enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  }
  
  // Show modal with content
  showModal(title, content) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalText) modalText.innerHTML = content;
    if (modalOverlay) modalOverlay.classList.add('active');
  }
  
  // Hide modal
  hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }
  
  // Initialize maps functionality
  async initializeMaps() {
    try {
      this.updateLoadingProgress(80, 'Inicializando mapa...');
      
      // Detect which map handler is available
      let mapHandler = null;
      let mapType = '';
      
      if (typeof window.LeafletMapsHandler !== 'undefined') {
        mapHandler = window.LeafletMapsHandler;
        mapType = 'OpenStreetMap con Leaflet';
        console.log('🗺️ Using OpenStreetMap with Leaflet');
      } else if (typeof window.MapsHandler !== 'undefined') {
        mapHandler = window.MapsHandler;
        mapType = 'Google Maps';
        console.log('🗺️ Using Google Maps');
      } else {
        throw new Error('No hay ningún manejador de mapas disponible (Google Maps o Leaflet)');
      }
      
      // Initialize map with loaded images
      this.map = await mapHandler.initializeMap(this.imagesData.images);
      
      if (!this.map) {
        throw new Error(`No se pudo inicializar ${mapType}`);
      }
      
      this.updateLoadingProgress(90, `${mapType} inicializado correctamente`);
      console.log(`✅ Map initialized using ${mapType}`);
      
    } catch (error) {
      console.error('Error initializing maps:', error);
      throw new Error(`Error del mapa: ${error.message}`);
    }
  }
  
  // Main initialization function (called by Google Maps)
  async initializeApplication() {
    try {
      this.isLoading = true;
      
      // Step 1: Initialize DOM references
      this.initializeDOMReferences();
      
      // Step 2: Load images data
      await this.loadImagesData();
      
      // Step 3: Update UI
      this.updateUI();
      
      // Step 4: Setup event listeners
      this.setupEventListeners();
      
      // Step 5: Initialize maps
      await this.initializeMaps();
      
      // Step 6: Finalization
      this.updateLoadingProgress(100, 'Aplicación lista');
      
      // Show success and hide loading
      setTimeout(() => {
        this.isLoading = false;
        this.hideLoading();
        console.log('✅ Valencia DANA Graffiti Archive loaded successfully');
      }, 500);
      
    } catch (error) {
      this.isLoading = false;
      console.error('❌ Failed to initialize application:', error);
      this.showError(error.message);
    }
  }
  
  // Get application status
  getStatus() {
    return {
      isLoading: this.isLoading,
      hasData: !!this.imagesData,
      totalImages: this.imagesData?.totalImages || 0,
      mappableImages: this.imagesData?.mappableImages || 0,
      markersCount: this.markers.length,
      lastUpdated: this.imagesData?.lastUpdated
    };
  }
}

// Global modal functions (called by HTML)
window.showAboutModal = function() {
  const content = `
    <p><strong>Archivo Graffitis DANA Valencia</strong> es un proyecto de documentación histórica ciudadana que preserva la memoria visual de las expresiones callejeras surgidas tras la DANA del 29 de octubre de 2024.</p>
    
    <h3>Objetivos del Proyecto</h3>
    <ul>
      <li>Documentar la expresión artística callejera post-DANA</li>
      <li>Preservar la memoria colectiva valenciana</li>
      <li>Crear un archivo histórico accesible y geolocalizado</li>
      <li>Facilitar la investigación académica y social</li>
    </ul>
    
    <h3>Metodología</h3>
    <p>Las imágenes son recopiladas por la ciudadanía y se actualizan automáticamente cada 12 horas. Solo se muestran fotografías que contienen metadatos de geolocalización para preservar el contexto histórico.</p>
    
    <p><strong>Este es un proyecto sin ánimo de lucro</strong> dedicado a la preservación de la memoria histórica valenciana.</p>
  `;
  
  if (window.graffitiApp) {
    window.graffitiApp.showModal('Sobre el Proyecto', content);
  }
};

window.showContributeModal = function() {
  const content = `
    <p>¿Quieres contribuir al archivo histórico? ¡Tu participación es fundamental!</p>
    
    <h3>Cómo colaborar</h3>
    <ul>
      <li><strong>Documenta graffitis:</strong> Toma fotos con tu móvil (GPS activado)</li>
      <li><strong>Comparte:</strong> Envía las imágenes a través de nuestro Instagram</li>
      <li><strong>Respeta:</strong> Solo documenta, no alteres las obras</li>
      <li><strong>Contexto:</strong> Incluye fecha y ubicación si es posible</li>
    </ul>
    
    <h3>Criterios de Inclusión</h3>
    <ul>
      <li>Graffitis relacionados con la DANA del 29O</li>
      <li>Fotografías con metadatos de ubicación</li>
      <li>Imágenes de calidad documental</li>
      <li>Respeto a la privacidad y propiedad</li>
    </ul>
    
    <p>🔗 <strong>Contacta con nosotros:</strong><br>
    📸 <a href="${CONFIG?.instagram?.url || '#'}" target="_blank">Instagram</a><br>
    📧 Email: contact@valencia-dana-docs.org</p>
  `;
  
  if (window.graffitiApp) {
    window.graffitiApp.showModal('Cómo Colaborar', content);
  }
};

window.showMethodologyModal = function() {
  const content = `
    <h3>Proceso de Documentación</h3>
    <p>Nuestro sistema de documentación está diseñado para preservar la integridad histórica y el contexto geográfico de cada obra.</p>
    
    <h3>Recolección de Datos</h3>
    <ul>
      <li><strong>Origen:</strong> Fotografías ciudadanas con GPS</li>
      <li><strong>Frecuencia:</strong> Actualización automática cada 12 horas</li>
      <li><strong>Validación:</strong> Solo imágenes con metadatos de ubicación</li>
      <li><strong>Archivo:</strong> Almacenamiento en Google Drive público</li>
    </ul>
    
    <h3>Tecnología</h3>
    <ul>
      <li><strong>Automatización:</strong> GitHub Actions para actualizaciones</li>
      <li><strong>Geolocalización:</strong> Extracción automática de coordenadas GPS</li>
      <li><strong>Visualización:</strong> Mapa interactivo con Google Maps</li>
      <li><strong>Accesibilidad:</strong> Diseño responsive y accesible</li>
    </ul>
    
    <h3>Ética del Proyecto</h3>
    <p>Respetamos la propiedad intelectual, la privacidad y el espacio público. Este archivo tiene fines exclusivamente históricos y documentales.</p>
  `;
  
  if (window.graffitiApp) {
    window.graffitiApp.showModal('Metodología', content);
  }
};

window.showLicenseModal = function() {
  const content = `
    <h3>Licencia MIT</h3>
    <p>Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo LICENSE para más detalles.</p>
    
    <h3>Términos de Uso</h3>
    <ul>
      <li><strong>Uso permitido:</strong> Investigación, educación, archivo histórico</li>
      <li><strong>Atribución:</strong> Se requiere citar el proyecto en usos académicos</li>
      <li><strong>Modificaciones:</strong> Permitidas bajo la misma licencia</li>
      <li><strong>Garantías:</strong> El software se proporciona "tal como está"</li>
    </ul>
    
    <h3>Derechos de las Imágenes</h3>
    <p>Las fotografías documentadas son consideradas de dominio público ciudadano para fines de archivo histórico. Si eres autor de alguna obra y deseas su exclusión, contacta con nosotros.</p>
    
    <h3>Política de Privacidad</h3>
    <p>No recopilamos datos personales de los usuarios. Las ubicaciones mostradas corresponden únicamente a los metadatos GPS de las fotografías.</p>
    
    <p><small>© 2024 Valencia DANA Documentation Project<br>
    <a href="https://github.com/your-username/valencia-dana-docs" target="_blank">Ver código fuente en GitHub</a></small></p>
  `;
  
  if (window.graffitiApp) {
    window.graffitiApp.showModal('Licencia y Términos', content);
  }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create global app instance
  window.graffitiApp = new GraffitiApp();
  
  // Start loading process
  console.log('🚀 Initializing Valencia DANA Graffiti Archive...');
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GraffitiApp;
}
