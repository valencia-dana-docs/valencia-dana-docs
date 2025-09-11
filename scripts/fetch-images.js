const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GraffitiFetcher {
  constructor() {
    this.drive = null;
    this.dataPath = path.join(__dirname, '../data/images.json');
  }

  async authenticateServiceAccount() {
    try {
      const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Successfully authenticated with Google Drive API');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async listDriveImages() {
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      console.log(`📁 Fetching images from folder: ${folderId}`);

      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields: 'files(id,name,createdTime,modifiedTime,size,webContentLink,webViewLink)',
        orderBy: 'createdTime desc',
        pageSize: 1000
      });

      const files = response.data.files || [];
      console.log(`📷 Found ${files.length} images in Google Drive`);
      return files;
    } catch (error) {
      console.error('❌ Error listing images:', error.message);
      return [];
    }
  }

  async extractImageMetadata(file) {
    try {
      // Get file metadata including EXIF data
      const metadata = await this.drive.files.get({
        fileId: file.id,
        fields: 'imageMediaMetadata,name,createdTime'
      });

      const imageData = metadata.data.imageMediaMetadata || {};
      
      // Extract GPS coordinates if available
      let coordinates = null;
      if (imageData.location) {
        coordinates = {
          lat: parseFloat(imageData.location.latitude),
          lng: parseFloat(imageData.location.longitude)
        };
      }

      // Create public viewable URL
      const imageUrl = `https://drive.google.com/uc?id=${file.id}&export=view`;
      
      return {
        id: file.id,
        url: imageUrl,
        filename: file.name,
        timestamp: file.createdTime,
        modifiedTime: file.modifiedTime,
        coordinates: coordinates,
        size: file.size,
        hasGPS: coordinates !== null
      };
    } catch (error) {
      console.warn(`⚠️  Could not extract metadata for ${file.name}:`, error.message);
      
      // Return basic data even if EXIF extraction fails
      return {
        id: file.id,
        url: `https://drive.google.com/uc?id=${file.id}&export=view`,
        filename: file.name,
        timestamp: file.createdTime,
        modifiedTime: file.modifiedTime,
        coordinates: null,
        size: file.size,
        hasGPS: false
      };
    }
  }

  async generateImageUrls(files) {
    console.log('🔍 Processing image metadata...');
    const processedImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing ${i + 1}/${files.length}: ${file.name}`);
      
      const imageData = await this.extractImageMetadata(file);
      processedImages.push(imageData);
      
      // Add small delay to avoid API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return processedImages;
  }

  async loadExistingData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('📝 No existing data found, starting fresh');
      return {
        lastUpdated: null,
        totalImages: 0,
        images: []
      };
    }
  }

  async updateImagesJSON(newImages) {
    const existingData = await this.loadExistingData();
    
    // Filter images with valid coordinates (for mapping)
    const mappableImages = newImages.filter(img => img.coordinates !== null);
    
    // Prepare new data structure
    const newData = {
      lastUpdated: new Date().toISOString(),
      totalImages: newImages.length,
      mappableImages: mappableImages.length,
      images: mappableImages.map(img => ({
        id: img.id,
        url: img.url,
        lat: img.coordinates.lat,
        lng: img.coordinates.lng,
        timestamp: img.timestamp,
        filename: img.filename
      })),
      allImages: newImages.map(img => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        timestamp: img.timestamp,
        hasGPS: img.hasGPS,
        coordinates: img.coordinates
      }))
    };

    // Write to file
    await fs.writeFile(this.dataPath, JSON.stringify(newData, null, 2));
    console.log(`✅ Updated images.json with ${newData.totalImages} total images (${newData.mappableImages} with GPS coordinates)`);
    
    return newData;
  }

  async compareWithExisting(newData) {
    try {
      const existing = await this.loadExistingData();
      
      // Compare based on image count and last modified times
      const hasChanges = (
        existing.totalImages !== newData.totalImages ||
        JSON.stringify(existing.images) !== JSON.stringify(newData.images)
      );
      
      if (hasChanges) {
        console.log('🔄 Changes detected - updating data');
        return true;
      } else {
        console.log('✨ No changes detected - data is up to date');
        return false;
      }
    } catch (error) {
      console.log('📝 Unable to compare with existing data, assuming changes exist');
      return true;
    }
  }

  async run() {
    console.log('🚀 Starting Valencia DANA Graffiti Fetcher...\n');
    
    // Step 1: Authenticate
    const authenticated = await this.authenticateServiceAccount();
    if (!authenticated) {
      process.exit(1);
    }
    
    // Step 2: List images from Drive
    const files = await this.listDriveImages();
    if (files.length === 0) {
      console.log('⚠️  No images found in the specified folder');
      process.exit(0);
    }
    
    // Step 3: Process metadata
    const processedImages = await this.generateImageUrls(files);
    
    // Step 4: Update JSON file
    const newData = await this.updateImagesJSON(processedImages);
    
    // Step 5: Summary
    console.log('\n📊 Processing Summary:');
    console.log(`   • Total images: ${newData.totalImages}`);
    console.log(`   • Images with GPS: ${newData.mappableImages}`);
    console.log(`   • Last updated: ${newData.lastUpdated}`);
    console.log('\n✅ Fetch process completed successfully!');
  }
}

// Run the fetcher
async function main() {
  // Validate required environment variables
  const requiredEnvVars = [
    'GOOGLE_DRIVE_FOLDER_ID',
    'GOOGLE_SERVICE_ACCOUNT'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  const fetcher = new GraffitiFetcher();
  await fetcher.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GraffitiFetcher;