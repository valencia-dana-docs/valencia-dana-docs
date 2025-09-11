# 🎨 Archivo Graffitis DANA Valencia

> **Documentación histórica automatizada de graffitis post-DANA Valencia del 29 de octubre 2024**

Un mapa interactivo que preserva la memoria visual de las expresiones callejeras surgidas tras la DANA, con actualización automática cada 12 horas mediante GitHub Actions.

[![Deploy Status](https://github.com/your-username/valencia-dana-docs/workflows/Update%20Images%20from%20Google%20Drive/badge.svg)](https://github.com/your-username/valencia-dana-docs/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue.svg)](https://your-username.github.io/valencia-dana-docs)

## 🌟 Características

- 🗺️ **Mapa Interactivo**: Visualización geolocalizada de graffitis en Valencia
- 🔄 **Actualización Automática**: Sincronización cada 12 horas vía GitHub Actions
- 📱 **Responsive Design**: Optimizado para móviles, tablets y desktop
- 🎯 **GPS Precision**: Solo muestra imágenes con coordenadas exactas
- 📸 **Popups de Imagen**: Vista ampliada al hacer clic en los marcadores
- 🏃‍♀️ **Performance**: Clustering de marcadores para cargas rápidas
- ♿ **Accesibilidad**: Diseño inclusivo y navegación por teclado

## 🚀 Demo en Vivo

**🌐 [Ver Mapa en Vivo](https://your-username.github.io/valencia-dana-docs)**

## 📁 Estructura del Proyecto

```
valencia-dana-docs/
├── 📄 index.html                 # Página principal
├── 🎨 css/
│   ├── styles.css               # Estilos principales
│   └── responsive.css           # Diseño responsivo
├── ⚡ js/
│   ├── main.js                  # Lógica principal
│   └── maps.js                  # Funcionalidad del mapa
├── 📊 data/
│   ├── config.js                # Configuración
│   └── images.json              # Datos (auto-generado)
├── 🔧 scripts/
│   └── fetch-images.js          # Script de GitHub Actions
├── 🤖 .github/workflows/
│   └── update-images.yml        # Automatización (cada 12h)
└── 📋 package.json              # Dependencias Node.js
```

## ⚡ Inicio Rápido

### 1. Configuración Inicial

```bash
# Clonar el repositorio
git clone https://github.com/your-username/valencia-dana-docs.git
cd valencia-dana-docs

# Instalar dependencias
npm install
```

### 2. Configurar APIs

#### Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita la **Maps JavaScript API**
4. Crea credenciales (API Key)
5. Restringe la clave a tu dominio
6. Edita `data/config.js`:

```javascript
const CONFIG = {
  googleMaps: {
    apiKey: 'TU_API_KEY_AQUI', // ← Reemplaza esto
    center: { lat: 39.4699, lng: -0.3763 },
    zoom: 12
  }
  // ...
};
```

#### Google Drive API (Para GitHub Actions)

1. En Google Cloud Console, habilita **Google Drive API**
2. Crea una **cuenta de servicio**
3. Descarga el archivo JSON de credenciales
4. Crea una carpeta pública en Google Drive
5. Comparte la carpeta con el email de la cuenta de servicio

### 3. Configurar GitHub Secrets

En tu repositorio de GitHub, ve a **Settings → Secrets and variables → Actions** y añade:

```
GOOGLE_DRIVE_API_KEY=tu_api_key
GOOGLE_DRIVE_FOLDER_ID=id_de_tu_carpeta_google_drive
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...} // JSON completo
```

### 4. Servidor Local

```bash
# Opción 1: Python
npm run serve

# Opción 2: Node.js
npm run serve:node

# La aplicación estará disponible en http://localhost:8000
```

## 🔄 Cómo Funciona la Automatización

### Flujo de Trabajo

1. **📸 Ciudadanos**: Suben fotos con GPS a Google Drive
2. **⏰ GitHub Actions**: Se ejecuta cada 12 horas automáticamente
3. **🔍 Script**: Escanea Google Drive, extrae coordenadas GPS
4. **💾 Actualización**: Genera nuevo `data/images.json`
5. **🚀 Deploy**: GitHub Pages se actualiza automáticamente
6. **🗺️ Mapa**: Muestra nuevos graffitis instantáneamente

### Schedule de Ejecución

- **Automático**: Cada 12 horas (00:00 y 12:00 UTC)
- **Manual**: Botón "Run workflow" en GitHub Actions
- **Push**: También se ejecuta al hacer push a `main` (para testing)

## 🎯 Uso del Mapa

### Navegación

- **🖱️ Click**: Hacer clic en puntos naranjas para ver graffitis
- **🔍 Zoom**: Rueda del ratón o controles del mapa
- **📱 Móvil**: Gestos táctiles estándar
- **⌨️ Teclado**: 
  - `F` = Pantalla completa
  - `R` = Re-centrar en Valencia
  - `Esc` = Cerrar modales

### Funcionalidades

- **📍 Marcadores**: Cada punto representa un graffiti geolocalizado
- **🖼️ Popups**: Click para ver imagen, fecha y ubicación
- **📱 Responsive**: Se adapta a cualquier tamaño de pantalla
- **🎯 Controles**: Recenterado y pantalla completa
- **ℹ️ Info Panel**: Instrucciones de uso (se oculta automáticamente)

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia servidor local
npm run fetch-images   # Ejecuta script de Google Drive (requiere .env)
npm run validate-config # Valida configuración

# Mantenimiento  
npm run lint          # Verifica formato de código
npm run format        # Formatea código automáticamente
npm run check         # Ejecuta todas las validaciones
```

### Variables de Entorno (Desarrollo Local)

Crea un archivo `.env` para desarrollo local:

```env
GOOGLE_DRIVE_API_KEY=tu_api_key_aqui
GOOGLE_DRIVE_FOLDER_ID=id_de_carpeta_drive
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Estructura de Datos

El archivo `data/images.json` generado tiene esta estructura:

```json
{
  "lastUpdated": "2024-12-09T10:30:00Z",
  "totalImages": 45,
  "mappableImages": 32,
  "images": [
    {
      "id": "1a2b3c4d5e",
      "url": "https://drive.google.com/uc?id=1a2b3c4d5e",
      "lat": 39.4701,
      "lng": -0.3768,
      "timestamp": "2024-11-15T14:22:33Z",
      "filename": "graffiti_001.jpg"
    }
  ]
}
```

## 🤝 Contribuir

### Para Documentar Graffitis

1. **📸 Toma fotos** con GPS activado en tu móvil
2. **📧 Compártelas** a través de nuestro Instagram: [@valencia_dana_docs](https://instagram.com/valencia_dana_docs)
3. **✅ Incluye contexto**: fecha y ubicación si es posible
4. **⏰ Espera**: Aparecerán en el mapa en la próxima actualización (máximo 12h)

### Para Desarrollar

1. **🍴 Fork** el proyecto
2. **🌿 Crea** una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** tus cambios (`git commit -m 'Add amazing feature'`)
4. **📤 Push** a la rama (`git push origin feature/amazing-feature`)
5. **🔀 Abre** un Pull Request

### Criterios de Contribución

- 🎯 **Enfoque**: Solo graffitis relacionados con DANA del 29O
- 📍 **Geolocalización**: Las fotos deben tener metadatos GPS
- 📐 **Calidad**: Imágenes nítidas y documentalmente útiles
- 🏛️ **Respeto**: No alteramos las obras, solo documentamos
- 🔒 **Privacidad**: Respetamos la propiedad privada

## 🔧 Configuración Avanzada

### Personalizar el Mapa

Edita `data/config.js` para personalizar:

```javascript
const CONFIG = {
  googleMaps: {
    center: { lat: 39.4699, lng: -0.3763 }, // Centro del mapa
    zoom: 12,                               // Nivel de zoom inicial
    styles: [/* estilos personalizados */] // Tema del mapa
  },
  data: {
    maxMarkers: 1000,        // Máximo marcadores a mostrar
    enableClustering: true,  // Agrupar marcadores cercanos
    clusterThreshold: 20     // Umbral para clustering
  }
  // ...más opciones
};
```

### GitHub Pages Setup

1. Ve a **Settings → Pages** en tu repositorio
2. Selecciona **Source: Deploy from a branch**
3. Elige **Branch: main** y **Folder: / (root)**
4. Tu sitio estará disponible en: `https://tu-username.github.io/valencia-dana-docs`

### Dominios Personalizados

Para usar un dominio propio:

1. Crea un archivo `CNAME` en la raíz con tu dominio
2. Configura DNS de tu dominio apuntando a GitHub Pages
3. Habilita HTTPS en configuración de GitHub Pages

## 📊 Analytics y Monitorización

### Métricas Disponibles

- ✅ **Estado del workflow**: Badge en el README
- 📈 **GitHub Actions logs**: Historial de actualizaciones
- 🗺️ **Estadísticas del mapa**: Contador de graffitis en vivo
- 📱 **Performance**: Tiempo de carga optimizado

### Debugging

```bash
# Ver logs de GitHub Actions
# GitHub → Actions → Update Images from Google Drive → View logs

# Validar configuración local
npm run validate-config

# Test manual del script
npm run test:fetch
```

## ❓ FAQ

### ¿Cada cuánto se actualiza el mapa?
Cada 12 horas automáticamente. También puedes triggerar una actualización manual desde GitHub Actions.

### ¿Qué pasa si una foto no tiene GPS?
Solo se muestran fotos con coordenadas GPS válidas. Las fotos sin GPS se almacenan pero no aparecen en el mapa.

### ¿Puedo añadir imágenes directamente?
Las imágenes se añaden automáticamente desde Google Drive. Para contribuir, comparte tus fotos a través de nuestro Instagram.

### ¿El proyecto es gratuito?
Sí, completamente gratuito y open source. Los únicos costos son del API de Google Maps si excedes el tier gratuito.

### ¿Cómo reporto un problema?
Abre un [issue en GitHub](https://github.com/your-username/valencia-dana-docs/issues) con detalles del problema.

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Uso libre para proyectos educativos, investigación y documentación histórica
```

## 🙏 Agradecimientos

- **Ciudadanía Valenciana**: Por documentar y preservar la memoria histórica
- **Comunidad Open Source**: Por las herramientas que hacen posible este proyecto
- **GitHub**: Por Actions y Pages gratuitos para proyectos públicos
- **Google**: Por APIs accesibles de Maps y Drive

## 📞 Contacto

- **📧 Email**: [contact@valencia-dana-docs.org](mailto:contact@valencia-dana-docs.org)
- **📸 Instagram**: [@valencia_dana_docs](https://instagram.com/valencia_dana_docs)
- **💻 GitHub**: [valencia-dana-docs](https://github.com/your-username/valencia-dana-docs)

---

**🏛️ Valencia DANA Documentation Project** • *Preservando la memoria histórica ciudadana*

*Este proyecto tiene fines exclusivamente históricos y documentales. Respetamos la propiedad intelectual y el espacio público.*