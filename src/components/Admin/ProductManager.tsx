import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, getDoc, addDoc, deleteDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { Product, Material, ProductStatus, DEFAULT_CATEGORIES, SiteConfig } from '../../../types';
import ImageCropper from './ImageCropper';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface ProductManagerProps { }

const ProductManager: React.FC<ProductManagerProps> = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<string>('');
    const [material, setMaterial] = useState<Material>(Material.Cement);
    const [categories, setCategories] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('1');
    const [sku, setSku] = useState('');
    const [status, setStatus] = useState<ProductStatus>(ProductStatus.InStock);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string>('');
    const [swatchGroups, setSwatchGroups] = useState<any[]>([]);
    const [uploadingSwatch, setUploadingSwatch] = useState<string | null>(null); // Track which swatch is uploading

    const firebase = useMemo(() => initFirebase(), []);

    const fetchProducts = async () => {
        if (!firebase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Fetch Categories first
            const configSnap = await getDoc(doc(firebase.db, 'site_config', 'main'));
            let currentCategories = DEFAULT_CATEGORIES;
            if (configSnap.exists()) {
                const config = configSnap.data() as SiteConfig;
                if (config.categories && config.categories.length > 0) {
                    currentCategories = config.categories;
                }
            }
            setCategories(currentCategories);
            if (!category) setCategory(currentCategories[0]);

            // 2. Fetch Products
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

    // SKU auto-generation is manual — use generateSmartSku button instead

    const generateSmartSku = () => {
        const removeAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const categoryCode = removeAccents(category).split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
        const shortName = removeAccents(name).split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
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

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setName(product.name);
        setPrice(String(product.price));
        setCategory(product.category);
        setMaterial(product.material);
        setDescription(product.description);
        setStock(String(product.stock));
        setSku(product.sku);
        setStatus(product.status);
        setExistingImageUrl(product.imageUrl);
        setImageFile(null);
        setCroppedBlob(null);
        setTempImgSrc(null);
        setSwatchGroups(product.swatchGroups || []);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = !!editingId;
        if (!firebase || (!isEditing && !imageFile && !croppedBlob)) {
            alert("Please select an image and ensure Firebase is connected.");
            return;
        }
        setUploading(true);

        try {
            // 1. Upload Image (only if new image selected)
            let imageUrl = existingImageUrl;
            if (croppedBlob) {
                imageUrl = await uploadToCloudinary(croppedBlob);
            } else if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            } else if (!isEditing) {
                throw new Error("No image to upload");
            }

            // 2. Build product data
            const productData = {
                name,
                price: Number(price),
                category,
                material,
                description,
                stock: Number(stock),
                sku,
                status,
                imageUrl,
                swatchGroups,
            };

            if (isEditing) {
                // Update existing product
                await updateDoc(doc(firebase.db, 'products', editingId), productData);
                alert("Product updated successfully!");
            } else {
                // Add new product
                await addDoc(collection(firebase.db, 'products'), {
                    ...productData,
                    createdAt: Timestamp.now(),
                });
                alert("Product added successfully!");
            }

            // 3. Reset Form & Refresh
            resetForm();
            fetchProducts();

        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Failed to save product.");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setExistingImageUrl('');
        setName('');
        setPrice('');
        setDescription('');
        setStock('1');
        setSku('');
        setStatus(ProductStatus.InStock);
        setImageFile(null);
        setCroppedBlob(null);
        setTempImgSrc(null);
        setSwatchGroups([]);
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

    const addSwatchGroup = () => {
        setSwatchGroups([...swatchGroups, { title: 'New Group', swatches: [] }]);
    };

    const updateGroupName = (index: number, name: string) => {
        const newGroups = [...swatchGroups];
        newGroups[index].title = name;
        setSwatchGroups(newGroups);
    };

    const removeSwatchGroup = (index: number) => {
        setSwatchGroups(swatchGroups.filter((_, i) => i !== index));
    };

    const addSwatch = (groupIndex: number) => {
        const newGroups = [...swatchGroups];
        newGroups[groupIndex].swatches.push({ name: '', color: '#000000', image: '' });
        setSwatchGroups(newGroups);
    };

    const updateSwatch = (groupIndex: number, swatchIndex: number, field: string, value: string) => {
        const newGroups = [...swatchGroups];
        newGroups[groupIndex].swatches[swatchIndex][field] = value;
        setSwatchGroups(newGroups);
    };

    const removeSwatch = (groupIndex: number, swatchIndex: number) => {
        const newGroups = [...swatchGroups];
        newGroups[groupIndex].swatches = newGroups[groupIndex].swatches.filter((_: any, i: number) => i !== swatchIndex);
        setSwatchGroups(newGroups);
    };

    const handleSwatchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, groupIndex: number, swatchIndex: number) => {
        if (e.target.files && e.target.files[0]) {
            const swatchId = `${groupIndex}-${swatchIndex}`;
            setUploadingSwatch(swatchId);
            try {
                const url = await uploadToCloudinary(e.target.files[0]);
                updateSwatch(groupIndex, swatchIndex, 'image', url);
            } catch (error) {
                console.error("Swatch upload error", error);
            } finally {
                setUploadingSwatch(null);
            }
        }
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
                            ) : existingImageUrl ? (
                                <img src={existingImageUrl} alt="Current" className="w-full h-full object-cover" />
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
                            <h3 className="font-bold dark:text-white">{editingId ? '✏️ Editing Product' : 'Product Details'}</h3>
                            <div className="flex items-center gap-3">
                                {editingId && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">Editing Mode</span>}
                                {uploading && <span className="text-primary text-sm font-bold animate-pulse">Uploading...</span>}
                            </div>
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
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
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

                        {/* Catalogue Swatches */}
                        <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">palette</span>
                                    Catalogue Swatches (Material Patterns)
                                </h4>
                                <button
                                    type="button"
                                    onClick={addSwatchGroup}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Add Group
                                </button>
                            </div>

                            <div className="space-y-6">
                                {swatchGroups.map((group, gIdx) => (
                                    <div key={gIdx} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 space-y-4">
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="text"
                                                value={group.title}
                                                onChange={(e) => updateGroupName(gIdx, e.target.value)}
                                                placeholder="Group Title (e.g. Marble Patterns)"
                                                className="flex-1 bg-transparent border-b border-gray-300 dark:border-white/20 pb-1 font-bold text-sm focus:outline-none focus:border-primary"
                                            />
                                            <button type="button" onClick={() => removeSwatchGroup(gIdx)} className="text-red-400 hover:text-red-600">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            {group.swatches.map((swatch: any, sIdx: number) => (
                                                <div key={sIdx} className="relative group/swatch bg-white dark:bg-[#1a261f] p-3 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 flex flex-col items-center gap-2">
                                                    <div className="relative size-12 rounded-full border border-gray-200 dark:border-white/20 overflow-hidden flex items-center justify-center bg-gray-50">
                                                       {swatch.image ? (
                                                           <img src={swatch.image} className="w-full h-full object-cover" />
                                                       ) : (
                                                           <div className="size-full" style={{ backgroundColor: swatch.color }} />
                                                       )}
                                                       <button 
                                                         type="button"
                                                         onClick={() => document.getElementById(`swatch-img-${gIdx}-${sIdx}`)?.click()}
                                                         className="absolute inset-0 bg-black/40 opacity-0 group-hover/swatch:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                       >
                                                          <span className="material-symbols-outlined text-sm">upload</span>
                                                       </button>
                                                       <input 
                                                          id={`swatch-img-${gIdx}-${sIdx}`}
                                                          type="file" 
                                                          className="hidden" 
                                                          onChange={(e) => handleSwatchImageUpload(e, gIdx, sIdx)}
                                                       />
                                                       {uploadingSwatch === `${gIdx}-${sIdx}` && (
                                                           <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                                                              <span className="material-symbols-outlined animate-spin text-primary text-sm">progress_activity</span>
                                                           </div>
                                                       )}
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        value={swatch.name || ''}
                                                        onChange={(e) => updateSwatch(gIdx, sIdx, 'name', e.target.value)}
                                                        placeholder="Name"
                                                        className="w-16 text-[8px] text-center bg-transparent border-none focus:outline-none dark:text-white"
                                                    />
                                                    <input 
                                                        type="color"
                                                        value={swatch.color || '#000000'}
                                                        onChange={(e) => updateSwatch(gIdx, sIdx, 'color', e.target.value)}
                                                        className="size-4 rounded-full border-none cursor-pointer"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeSwatch(gIdx, sIdx)}
                                                        className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined text-[10px]">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                type="button"
                                                onClick={() => addSwatch(gIdx)}
                                                className="size-12 rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {swatchGroups.length === 0 && (
                                    <p className="text-xs text-center text-gray-400 italic">No swatch groups added yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                {editingId ? 'Cancel Edit' : 'Reset'}
                            </button>
                            <button
                                type="submit" disabled={uploading}
                                className={`px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${editingId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                            >
                                {uploading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">{editingId ? 'edit' : 'save'}</span>}
                                {uploading ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
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
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className={`p-2 rounded-lg transition-colors ${editingId === product.id ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                                title="Edit product"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete product"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
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


