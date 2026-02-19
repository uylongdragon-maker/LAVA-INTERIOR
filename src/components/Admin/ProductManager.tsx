import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { Product, Category, Material, ProductStatus } from '../../../types';
import ImageCropper from './ImageCropper';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ProductManagerProps { }

const ProductManager: React.FC<ProductManagerProps> = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<Category>(Category.TableSet);
    const [material, setMaterial] = useState<Material>(Material.Cement);
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('1');
    const [sku, setSku] = useState('');
    const [status, setStatus] = useState<ProductStatus>(ProductStatus.InStock);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

    const firebase = initFirebase();

    const fetchProducts = async () => {
        if (!firebase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(firebase.db, 'products'));
            const fetchedProducts: Product[] = [];
            querySnapshot.forEach((doc) => {
                fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Smart SKU Generation
    useEffect(() => {
        if (name && category) {
            const categoryCode = category.substring(0, 3).toUpperCase();
            const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            // Only auto-generate if SKU is empty or seems auto-generated
            if (!sku || sku.startsWith('LAVA-')) {
                // setSku(`LAVA-${categoryCode}-${randomSuffix}`);
            }
        }
    }, [name, category]);

    const generateSmartSku = () => {
        const categoryCode = category.substring(0, 3).toUpperCase();
        const shortName = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setSku(`LAVA-${categoryCode}-${shortName}-${randomSuffix}`);
    };

    const readFile = (file: File) => {
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result as string));
            reader.readAsDataURL(file);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setTempImgSrc(imageDataUrl);
            setShowCropper(true);
            setImageFile(file); // Keep original to show filename if needed
        }
    };

    const onCropComplete = (croppedBlob: Blob) => {
        setCroppedBlob(croppedBlob);
        setShowCropper(false);
    };

    const onCropCancel = () => {
        setShowCropper(false);
        setTempImgSrc(null);
        if (!croppedBlob) setImageFile(null); // Reset if no crop was saved
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebase || (!imageFile && !croppedBlob)) {
            alert("Please select an image and ensure Firebase is connected.");
            return;
        }
        setUploading(true);

        try {
            // 1. Upload Image
            let imageUrl = '';
            if (croppedBlob) {
                imageUrl = await uploadToCloudinary(croppedBlob);
            } else if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            } else {
                throw new Error("No image to upload");
            }

            // 2. Add to Firestore
            const newProduct = {
                name,
                price: Number(price),
                category,
                material,
                description,
                stock: Number(stock),
                sku,
                status,
                imageUrl,
                createdAt: Timestamp.now(),
            };

            await addDoc(collection(firebase.db, 'products'), newProduct);

            // 3. Reset Form & Refresh
            resetForm();
            fetchProducts();
            alert("Product added successfully!");

        } catch (error) {
            console.error("Error adding product: ", error);
            alert("Failed to add product.");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setStock('1');
        setSku('');
        setStatus(ProductStatus.InStock);
        setImageFile(null);
        setCroppedBlob(null);
        setTempImgSrc(null);
    };

    const handleDelete = async (id: string) => {
        if (!firebase || !window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteDoc(doc(firebase.db, 'products', id));
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert("Failed to delete product.");
        }
    };

    if (!firebase) return <div>Firebase not configured.</div>;

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {showCropper && tempImgSrc && (
                <ImageCropper
                    imageSrc={tempImgSrc}
                    onCropComplete={onCropComplete}
                    onCancel={onCropCancel}
                />
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#101913] dark:text-white">Product Management</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Product Image */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] text-center">
                        <h3 className="font-bold mb-4 dark:text-white">Product Image</h3>

                        <div className="relative aspect-[4/5] bg-gray-50 dark:bg-black/20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-primary transition-colors cursor-pointer"
                            onClick={() => document.getElementById('image-upload')?.click()}>

                            {croppedBlob ? (
                                <img src={URL.createObjectURL(croppedBlob)} alt="Preview" className="w-full h-full object-cover" />
                            ) : tempImgSrc ? (
                                <img src={tempImgSrc} alt="Preview" className="w-full h-full object-cover opacity-50" />
                            ) : (
                                <div className="space-y-2 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                    <p className="text-sm">Click to upload image</p>
                                </div>
                            )}

                            {/* Overlay for re-upload/crop */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span className="text-white text-sm font-bold">Change Image</span>
                            </div>

                            <input
                                id="image-upload"
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <p className="text-xs text-gray-400 mt-4">
                            Supported formats: JPG, PNG. Ratio 4:5 recommended.
                        </p>
                    </div>
                </div>

                {/* Right Column - Product Details */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold dark:text-white">Product Details</h3>
                            {uploading && <span className="text-primary text-sm font-bold animate-pulse">Uploading...</span>}
                        </div>

                        {/* Name & SKU */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Product Name</label>
                                <input
                                    type="text" placeholder="e.g., Lava Stone Table"
                                    value={name} onChange={e => setName(e.target.value)} required
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">SKU (Stock Keeping Unit)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text" placeholder="LAVA-..."
                                        value={sku} onChange={e => setSku(e.target.value)} required
                                        className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateSmartSku}
                                        title="Auto Generate SKU"
                                        className="p-3 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">smart_toy</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Category & Material */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as Category)}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <span className="absolute right-4 top-3.5 pointer-events-none material-symbols-outlined text-gray-500">expand_more</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Material</label>
                                <div className="relative">
                                    <select
                                        value={material}
                                        onChange={e => setMaterial(e.target.value as Material)}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {Object.values(Material).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <span className="absolute right-4 top-3.5 pointer-events-none material-symbols-outlined text-gray-500">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Price, Stock, Status */}
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Price (VND)</label>
                                <input
                                    type="number" placeholder="0"
                                    value={price} onChange={e => setPrice(e.target.value)} required
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Stock</label>
                                <input
                                    type="number" placeholder="1"
                                    value={stock} onChange={e => setStock(e.target.value)} required
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Status</label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value as ProductStatus)}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <span className="absolute right-4 top-3.5 pointer-events-none material-symbols-outlined text-gray-500">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
                            <ReactQuill
                                theme="snow"
                                value={description}
                                onChange={setDescription}
                                modules={quillModules}
                                className="bg-white dark:bg-black/20 dark:text-white rounded-xl overflow-hidden"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit" disabled={uploading}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {uploading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                                {uploading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Product List Table */}
            <div className="bg-white dark:bg-[#1a261f] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#2a4032]">
                    <h3 className="font-bold text-lg dark:text-white">Inventory ({products.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-black/20">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price (VND)</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            <div>
                                                <div className="text-sm font-bold dark:text-white">{product.name}</div>
                                                <div className="text-xs text-gray-400">{product.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{Number(product.price).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.status === ProductStatus.InStock ? 'bg-green-100 text-green-700' :
                                            product.status === ProductStatus.PreOrder ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductManager;


