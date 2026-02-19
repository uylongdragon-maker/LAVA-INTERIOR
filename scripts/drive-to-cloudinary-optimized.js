import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import { google } from 'googleapis';
import pLimit from 'p-limit';
import sharp from 'sharp';
import { GoogleGenAI } from '@google/genai';
import os from 'os'; // Added os

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
const CONCURRENT_LIMIT = 2; // Reduced from 5 to prevent timeouts on large files
// MAX_SIZE_BYTES removed as we now compress all images
const FORCE_UPLOAD = process.argv.includes('--force');

// CLI Arguments for Manual Override
const args = process.argv.slice(2);
const manualMaterialArg = args.find(arg => arg.startsWith('--material='));
const MANUAL_MATERIAL = manualMaterialArg ? manualMaterialArg.split('=')[1] : null;

const manualCategoryArg = args.find(arg => arg.startsWith('--category='));
const MANUAL_CATEGORY = manualCategoryArg ? manualCategoryArg.split('=')[1] : null;

// Validate Manual Material
if (MANUAL_MATERIAL && !['Xi măng - Cement', 'Composite'].includes(MANUAL_MATERIAL)) {
    console.error(`❌ ERROR: Invalid material '${MANUAL_MATERIAL}'. Valid options: 'Xi măng - Cement', 'Composite'`);
    process.exit(1);
}

// 4. INIT GEMINI AI
const geminiApiKey = process.env.VITE_GEMINI_API_KEY;
let genAI = null;
if (geminiApiKey && geminiApiKey !== 'PLACEHOLDER_API_KEY') {
    genAI = new GoogleGenAI({ apiKey: geminiApiKey });
} else {
    console.warn('⚠️  VITE_GEMINI_API_KEY not found or invalid. AI categorization will be disabled.');
}



// VALIDATION
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: serviceAccountKey.json not found in scripts/ directory.');
    process.exit(1);
}

if (!driveFolderId) {
    console.error('❌ ERROR: GOOGLE_DRIVE_FOLDER_ID not found in .env file.');
    process.exit(1);
}

// 1. INIT FIREBASE
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// 2. INIT CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. INIT GOOGLE DRIVE
const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

async function getDriveFiles(folderId) {
    let allFiles = [];

    // 1. Get images in current folder
    try {
        let pageToken = null;
        do {
            const res = await drive.files.list({
                q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
                fields: 'nextPageToken, files(id, name, mimeType, size, parents)', // Added size
                pageSize: 1000,
                pageToken: pageToken,
            });
            allFiles = allFiles.concat(res.data.files);
            pageToken = res.data.nextPageToken;
        } while (pageToken);
    } catch (error) {
        console.error(`❌ Error scanning images in folder ${folderId}:`, error.message);
    }

    // 2. Get sub-folders
    try {
        let pageToken = null;
        let subFolders = [];
        do {
            const res = await drive.files.list({
                q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'nextPageToken, files(id, name)',
                pageSize: 1000,
                pageToken: pageToken,
            });
            subFolders = subFolders.concat(res.data.files);
            pageToken = res.data.nextPageToken;
        } while (pageToken);

        // Recursively scan sub-folders
        for (const folder of subFolders) {
            console.log(`📂 Found sub-folder: ${folder.name}. Scanning...`);
            const subFiles = await getDriveFiles(folder.id);
            allFiles = allFiles.concat(subFiles);
        }

    } catch (error) {
        console.error(`❌ Error scanning subfolders in ${folderId}:`, error.message);
    }

    return allFiles;
}



async function uploadStreamToCloudinary(driveFile, needsCompression = false) {
    // If NO compression needed, use the efficient stream method
    if (!needsCompression) {
        return new Promise(async (resolve, reject) => {
            try {
                const driveResponse = await drive.files.get(
                    { fileId: driveFile.id, alt: 'media' },
                    { responseType: 'stream' }
                );
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'lava_products',
                        public_id: path.parse(driveFile.name).name,
                        resource_type: 'image',
                        transformation: [{ quality: "auto", fetch_format: "auto" }]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                driveResponse.data.on('error', reject).pipe(uploadStream);
            } catch (error) {
                reject(error);
            }
        });
    }

    // If compression NEEDED: Database -> Temp File -> Sharp -> Temp File -> Cloudinary -> Cleanup
    return new Promise(async (resolve, reject) => {
        // Use only ID for temp filename to avoid encoding issues with Vietnamese characters
        const tempInput = path.join(os.tmpdir(), `input_${driveFile.id}`);
        const tempOutput = path.join(os.tmpdir(), `output_${driveFile.id}.jpg`);

        try {
            // 1. Download to Temp File
            console.log(`⬇️  Downloading ${driveFile.name} to temp...`);
            const dest = fs.createWriteStream(tempInput);
            const driveResponse = await drive.files.get(
                { fileId: driveFile.id, alt: 'media' },
                { responseType: 'stream' }
            );

            await new Promise((res, rej) => {
                driveResponse.data
                    .on('error', rej)
                    .pipe(dest)
                    .on('error', rej)
                    .on('finish', res);
            });
            console.log(`✅ Downloaded ${driveFile.name}`);

            // 2. Compress with Sharp
            console.log(`⚙️  Compressing ${driveFile.name}...`);
            await sharp(tempInput)
                .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }) // Resized to 2000px for web optimization
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(tempOutput);
            console.log(`✅ Compressed ${driveFile.name}`);

            // 3. Upload to Cloudinary
            console.log(`☁️  Uploading ${driveFile.name}...`);
            const result = await cloudinary.uploader.upload(tempOutput, {
                folder: 'lava_products',
                public_id: path.parse(driveFile.name).name,
                resource_type: 'image'
            });
            console.log(`✅ Uploaded ${driveFile.name}`);

            // 4. Cleanup

            // 4. Cleanup
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);

            resolve(result);

        } catch (error) {
            // Cleanup on error
            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
            reject(error);
        }
    });
}

async function categorizeProduct(name) {
    // 1. Check for Manual Overrides first
    let material = MANUAL_MATERIAL;
    let category = MANUAL_CATEGORY;

    // If both are manually set, return immediately
    if (material && category) {
        return { material, category };
    }

    // 2. Try AI Categorization if API key is available
    if (genAI) {
        try {
            const prompt = `
            Analyze the furniture product name: "${name}".
            
            1. Determine the Material:
               - If it implies cement, concrete, or stone-like -> "Xi măng - Cement"
               - If it implies composite, fiber, or resin -> "Composite"
               - Default to "Composite" if unsure.

            2. Determine the Category:
               - "Bộ Bàn Ghế" (Table/Chair sets, Stools)
               - "Chậu Cây" (Planters, Pots)
               - "Trang Trí" (Decor, Lamps, Accessories)
               - "Khác" (Others)

            Return ONLY a JSON object: { "material": "...", "category": "..." }
            `;

            const result = await genAI.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: { parts: [{ text: prompt }] },
                config: { responseMimeType: 'application/json' }
            });

            const responseText = result.candidates[0].content.parts[0].text;
            const aiData = JSON.parse(responseText);

            // Apply AI results only if manual override is NOT set
            if (!material) material = aiData.material;
            if (!category) category = aiData.category;

        } catch (error) {
            console.warn(`⚠️  AI Categorization failed for "${name}": ${error.message}. Using defaults.`);
        }
    }

    // 3. Fallbacks
    return {
        material: material || 'Composite',
        category: category || 'Khác'
    };
}

async function saveToFirestore(name, imageUrl) {
    try {
        // Construct a slug/sku from name
        const sku = name.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');

        // GET CATEGORY & MATERIAL
        const { material, category } = await categorizeProduct(name);

        const productData = {
            name: name,
            imageUrl: imageUrl, // FIXED: matched frontend expectation
            category: category,
            material: material,
            price: 0,
            status: 'Còn hàng', // ProductStatus.InStock
            description: `Imported from Drive: ${name}. Material: ${material}`,
            stock: 10,
            sku: `IMP-${sku}-${Date.now()}`,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Check for existing product by name to prevent duplicates
        const snapshot = await db.collection('products').where('name', '==', name).get();

        if (!snapshot.empty) {
            // Update existing
            const docId = snapshot.docs[0].id;
            await db.collection('products').doc(docId).update(productData);
            console.log(`🔄 Updated: ${name} [${material} | ${category}]`);
        } else {
            // Create new
            await db.collection('products').add({
                ...productData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`✨ Created: ${name} [${material} | ${category}]`);
        }
        return true;
    } catch (error) {
        console.error(`🔥 Firestore Error for ${name}:`, error.message);
        return false;
    }
}

async function main() {
    console.log(`🔍 Root Folder ID: ${driveFolderId}`);

    const files = await getDriveFiles(driveFolderId);
    if (!files.length) {
        console.log('⚠️ No images found in the specified Drive folder.');
        return;
    }

    console.log(`found ${files.length} images. Processing with limit=${CONCURRENT_LIMIT}...`);

    const limit = pLimit(CONCURRENT_LIMIT);
    let successCount = 0;
    let failCount = 0;

    const tasks = files.map((file, index) => {
        return limit(async () => {
            const progress = `[${index + 1}/${files.length}]`;
            try {
                // Check if product already exists with imageUrl
                const name = path.parse(file.name).name;
                const snapshot = await db.collection('products').where('name', '==', name).get();

                if (!snapshot.empty && !FORCE_UPLOAD) {
                    const product = snapshot.docs[0].data();
                    if (product.imageUrl) {
                        console.log(`${progress} ⏭️  Skipping ${file.name} (Already exists)`);
                        successCount++;
                        return;
                    }
                }

                // Calculate file size for logging
                const fileSizeMB = file.size ? (parseInt(file.size) / (1024 * 1024)).toFixed(2) : '?';

                console.log(`${progress} Streaming: ${file.name} (${fileSizeMB} MB) [COMPRESSING]...`);

                // 1. Drive -> Cloudinary (always compress/resize)
                const result = await uploadStreamToCloudinary(file, true);

                // 2. Cloudinary -> Firestore
                await saveToFirestore(path.parse(file.name).name, result.secure_url);

                console.log(`✅ Success: ${file.name} (Optimized)`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed: ${file.name} - ${error.message}`);
                failCount++;
            }
        });
    });

    await Promise.all(tasks);

    console.log('\n🎉 Migration Completed!');
    console.log(`Summary: ${successCount} Successful, ${failCount} Failed.`);
    process.exit(0);
}

main();
