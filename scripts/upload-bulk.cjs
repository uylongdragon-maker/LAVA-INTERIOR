require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const admin = require('firebase-admin');

// CONFIGURATION
// Create a serviceAccountKey.json file in the same directory as this script
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const imagesDir = path.join(__dirname, '..', 'local_images');

// Initialize Firebase Admin
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: serviceAccountKey.json not found in scripts/ directory.');
    console.error('👉 Please download it from Firebase Console > Project Settings > Service Accounts.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Initialize Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ ERROR: Cloudinary environment variables are missing.');
    console.error('👉 Please create a .env file with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage(filePath) {
    try {
        const fileName = path.basename(filePath, path.extname(filePath)); // e.g. "Chair" from "Chair.jpg"

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'lava_products',
            public_id: fileName,
            resource_type: 'image'
        });

        return {
            success: true,
            url: result.secure_url,
            name: fileName
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function saveToFirestore(productData) {
    try {
        // Add to Firestore collection 'products'
        // We use .add() to auto-generate an ID, or .doc(name).set() if we want specific IDs.
        // Requirement says: Save name, image, createdAt, price: 0
        await db.collection('products').add({
            name: productData.name,
            image: productData.image,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            price: 0
        });
        return true;
    } catch (error) {
        console.error('Firestore Error:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Bulk Upload Process...');
    console.log(`📂 Scanning directory: ${imagesDir}`);

    if (!fs.existsSync(imagesDir)) {
        console.error(`❌ ERROR: Directory ${imagesDir} does not exist.`);
        return;
    }

    const files = fs.readdirSync(imagesDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (files.length === 0) {
        console.log('⚠️ No image files found in local_images.');
        return;
    }

    console.log(`Found ${files.length} images. Processing...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(imagesDir, file);
        const progress = `[${i + 1}/${files.length}]`;

        console.log(`${progress} Uploading: ${file}...`);

        try {
            // 1. Upload to Cloudinary
            const uploadResult = await uploadImage(filePath);

            if (uploadResult.success) {
                // 2. Save to Firestore
                const saved = await saveToFirestore({
                    name: uploadResult.name,
                    image: uploadResult.url
                });

                if (saved) {
                    console.log(`✅ Success: ${file} -> Firebase Saved.`);
                    successCount++;
                } else {
                    console.log(`⚠️ Partial Success: ${file} uploaded but Firestore save failed.`);
                    failCount++;
                }
            } else {
                console.error(`❌ Failed to upload ${file}: ${uploadResult.error}`);
                failCount++;
            }

        } catch (err) {
            console.error(`❌ Error processing ${file}: ${err.message}`);
            failCount++;
        }
    }

    console.log('\n🎉 Bulk Upload Completed!');
    console.log(`Summary: ${successCount} Successful, ${failCount} Failed.`);
    process.exit(0);
}

main();
