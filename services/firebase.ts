
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDoc, Timestamp, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Lazy initialization
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

const isConfigured = (): boolean => {
    const requiredKeys = ['apiKey', 'projectId', 'authDomain'];
    const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig] || firebaseConfig[key as keyof typeof firebaseConfig] === `YOUR_FIREBASE_${key.toUpperCase()}`);
    
    if (missing.length > 0) {
        if (typeof window !== 'undefined') {
            console.warn(`Firebase is not fully configured. Missing: ${missing.join(', ')}. Falling back to local storage.`);
        }
        return false;
    }
    return true;
};

export const initFirebase = () => {
    if (typeof window === 'undefined') return null; // Prevent server-side initialization in static export if not needed
    if (app && db) return { db, app, analytics };
    if (!isConfigured()) {
        console.warn('Firebase credentials not configured. Using localStorage fallback.');
        return null;
    }
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        try {
            analytics = getAnalytics(app);
        } catch (e) {
            console.warn('Firebase Analytics failed to initialize:', e);
        }
        return { db, app, analytics };
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        return null;
    }
};

export interface SavedDesign {
    id: string;
    imageUrl: string;
    prompt: string;
    palette: string;
    createdAt: string;
}

// Convert base64 to blob
const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
};

// Get designs from localStorage (fallback)
export const getLocalDesigns = (): SavedDesign[] => {
    try {
        const stored = localStorage.getItem('lava_designs');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

import { uploadToCloudinary } from './cloudinary';

// ... (keep existing code)

// Upload design to Cloudinary + save metadata to Firestore
export const uploadDesign = async (
    base64Image: string,
    prompt: string,
    palette: string
): Promise<SavedDesign | null> => {
    const firebase = initFirebase();

    // Fallback to localStorage if Firebase not configured
    if (!firebase) {
        const design: SavedDesign = {
            id: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            imageUrl: base64Image,
            prompt,
            palette,
            createdAt: new Date().toISOString(),
        };
        const existingDesigns = getLocalDesigns();
        existingDesigns.unshift(design);
        localStorage.setItem('lava_designs', JSON.stringify(existingDesigns.slice(0, 20)));
        return design;
    }

    try {
        const blob = base64ToBlob(base64Image);

        // Upload image to Cloudinary
        const imageUrl = await uploadToCloudinary(blob);

        // Save metadata to Firestore
        const designData = {
            imageUrl,
            prompt,
            palette,
            storageProvider: 'cloudinary', // Mark as Cloudinary
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(firebase.db, 'designs'), designData);

        const design: SavedDesign = {
            id: docRef.id,
            imageUrl,
            prompt,
            palette,
            createdAt: new Date().toISOString(),
        };

        // Also cache in localStorage
        const existingDesigns = getLocalDesigns();
        existingDesigns.unshift(design);
        localStorage.setItem('lava_designs', JSON.stringify(existingDesigns.slice(0, 20)));

        return design;
    } catch (error) {
        console.error('Failed to upload design:', error);
        return null;
    }
};

// Delete design from Firebase Storage + Firestore
export const deleteDesign = async (id: string): Promise<boolean> => {
    try {
        const firebase = initFirebase();

        // If local-only or Firebase not configured
        if (!firebase || id.startsWith('local_')) {
            const designs = getLocalDesigns().filter(d => d.id !== id);
            localStorage.setItem('lava_designs', JSON.stringify(designs));
            return true;
        }

        // Get design doc to find storage path
        const docSnap = await getDoc(doc(firebase.db, 'designs', id));

        if (docSnap.exists()) {
            // Delete from Firestore
            await deleteDoc(doc(firebase.db, 'designs', id));
        }

        // Remove from localStorage cache
        const designs = getLocalDesigns().filter(d => d.id !== id);
        localStorage.setItem('lava_designs', JSON.stringify(designs));

        return true;
    } catch (error) {
        console.error('Failed to delete design:', error);
        return false;
    }
};

import { Order } from '../types';

export const createOrder = async (order: Omit<Order, 'id'>) => {
    const firebase = initFirebase();
    if (!firebase) {
        // Fallback to localStorage for demo
        const orders = JSON.parse(localStorage.getItem('lava_orders') || '[]');
        const newOrder = { ...order, id: 'LAVA-' + Math.random().toString(36).substring(2, 11).toUpperCase() };
        orders.push(newOrder);
        localStorage.setItem('lava_orders', JSON.stringify(orders));
        return { id: newOrder.id };
    }
    try {
        const docRef = await addDoc(collection(firebase.db, 'orders'), {
            ...order,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id };
    } catch (error) {
        console.error("Error creating order", error);
        throw error;
    }
};
