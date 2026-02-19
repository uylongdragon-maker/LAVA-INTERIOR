
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found!');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkProducts() {
    try {
        const snapshot = await db.collection('products').get();
        console.log(`📊 Total Products in Firestore: ${snapshot.size}`);

        const categories = {};
        const materials = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            categories[data.category] = (categories[data.category] || 0) + 1;
            materials[data.material] = (materials[data.material] || 0) + 1;
        });

        console.log('--- Category Distribution ---');
        console.table(categories);
        console.log('--- Material Distribution ---');
        console.table(materials);

        if (snapshot.size > 0) {
            console.log('--- First 3 Products ---');
            snapshot.docs.slice(0, 3).forEach(doc => {
                const data = doc.data();
                console.log(`ID: ${doc.id}`);
                console.log(`Name: ${data.name}`);
                console.log(`Material: JSON.stringify(${JSON.stringify(data.material)})`);
                console.log(`Category: JSON.stringify(${JSON.stringify(data.category)})`);
                console.log('---');
            });
        }
    } catch (error) {
        console.error('❌ Error fetching products:', error);
    }
}

checkProducts();
