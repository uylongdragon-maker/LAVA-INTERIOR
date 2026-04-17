
import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { SiteConfig, Showroom } from '../../../types';
import { useAdminLang } from '../../contexts/AdminLanguageContext';
import { uploadToCloudinary } from '../../../services/cloudinary';

const ContentManager: React.FC = () => {
    const { t } = useAdminLang();
    const [activeSection, setActiveSection] = useState<'general' | 'home' | 'about' | 'footer' | 'contact' | 'titles' | 'products'>('general');
    const [config, setConfig] = useState<SiteConfig>({
        heroTitle: '',
        heroSubtitle: '',
        heroImage: '',
        heroCtaText: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        workshopTitle: '',
        workshopDescription: '',
        aboutTitle: '',
        aboutDescription: '',
        aboutImage: '',
        footerDescription: '',
        socialFacebook: '',
        socialInstagram: '',
        sectionTitleMaterials: '',
        values: [],
        milestones: [],
        team: [],
        homeCollections: [],
        homeStats: [],
        homeIntro: { title: '', subtitle: '', desc: '', images: [] },
        showrooms: [],
        contactPage: { pageTitle: '', pageSubtitle: '', workingHours: '' },
        companySection: {
            factoryImg: '', factoryTitle: '', factoryDesc: '',
            sprayImg: '', sprayTitle: '', sprayDesc: '',
            centerTitle: '', centerDesc: '',
            features: [
                { img: '', title: '', desc: '' },
                { img: '', title: '', desc: '' },
                { img: '', title: '', desc: '' }
            ]
        },
        clientSection: {
            title: '', subtitle: '', desc: '', logos: [], exhibitionImages: ['', '', ''], bottomTitle: '', bottomDesc: ''
        },
        categories: [],
        modalLayout: {
            headerTitle: 'LACQUER & CEMENT',
            showLogo: true
        },
        siteName: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const firebase = useMemo(() => initFirebase(), []);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!firebase) return;
            try {
                const docRef = doc(firebase.db, 'site_config', 'main');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data() as SiteConfig);
                } else {
                    // Defaults
                    setConfig({
                        heroTitle: 'LAVA INTERIOR',
                        heroSubtitle: 'Nghệ thuật bê tông & Nội thất thủ công',
                        contactEmail: 'contact@lava.com',
                        contactPhone: '0909 123 456',
                        address: '123 Thao Dien, District 2, HCMC',
                        workshopTitle: 'Our Workshop',
                        workshopDescription: 'Where masterpiece is made.',
                        aboutTitle: 'Cốt Cách Từ Sự Thô Mộc',
                        aboutDescription: 'Chúng tôi tin rằng vẻ đẹp thực sự nằm trong sự chân thực của vật liệu.',
                        aboutImage: '',
                        footerDescription: 'Định nghĩa lại phong cách sống hiện đại qua tay nghề thủ công bền vững.',
                        socialFacebook: '#',
                        socialInstagram: '#',
                        sectionTitleMaterials: 'Thư viện vật liệu',
                        siteName: 'LAVA INTERIOR CO., LTD'
                    });
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteConfig) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const url = await uploadToCloudinary(e.target.files[0]);
                setConfig(prev => ({ ...prev, [field]: url }));
            } catch (error) {
                alert("Upload failed");
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebase) return;
        setSaving(true);
        try {
            await setDoc(doc(firebase.db, 'site_config', 'main'), config);
            alert("Configuration saved successfully!");
        } catch (error) {
            console.error("Error saving config:", error);
            alert("Failed to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading config...</div>;

    const sections = [
        { id: 'general', label: 'General & Hero' },
        { id: 'about', label: 'About Page' },
        { id: 'products', label: 'Product Config' },
        { id: 'footer', label: 'Contact & Footer' },
        { id: 'contact', label: 'Contact Page' },
        { id: 'titles', label: 'Section Titles' },
    ];

    return (
        <div className="bg-white dark:bg-[#1a261f] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] overflow-hidden">
            <div className="border-b border-gray-100 dark:border-[#2a4032] px-6 py-4 bg-gray-50/50 dark:bg-white/5">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeSection === section.id
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSave} className="p-6">

                {/* GENERAL & HERO */}
                {activeSection === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hero Title</label>
                                <input
                                    type="text" name="heroTitle" value={config.heroTitle} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Site Name (Footer)</label>
                                <input
                                    type="text" name="siteName" value={config.siteName} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Website Logo</label>
                                <input
                                    type="file" onChange={(e) => handleImageUpload(e, 'logo')}
                                    className="w-full text-sm dark:text-gray-300 mb-2"
                                />
                                {config.logo && <img src={config.logo} alt="Logo" className="h-12 object-contain bg-gray-100 dark:bg-white/10 p-1 rounded" />}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hero Subtitle</label>
                                <textarea
                                    name="heroSubtitle" value={config.heroSubtitle} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Workshop Title</label>
                                <input
                                    type="text" name="workshopTitle" value={config.workshopTitle} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Workshop Description</label>
                                <input
                                    type="text" name="workshopDescription" value={config.workshopDescription} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Gallery Images for Legacy Section */}
                        <div className="border-t border-gray-100 dark:border-[#2a4032] pt-6 mt-6">
                            <h3 className="font-bold dark:text-white mb-1">Gallery Images (Legacy Section)</h3>
                            <p className="text-xs text-gray-400 mb-4">4 hình ảnh hiển thị ở phần "Kế Thừa & Đổi Mới" trang chủ</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[0, 1, 2, 3].map(idx => (
                                    <div key={idx} className="space-y-2">
                                        <label className="block text-xs font-medium dark:text-gray-400">Image {idx + 1}</label>
                                        <div className="relative aspect-[4/5] bg-gray-50 dark:bg-black/20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 overflow-hidden group cursor-pointer"
                                            onClick={() => document.getElementById(`gallery-img-${idx}`)?.click()}>
                                            {config.homeIntro?.images?.[idx] ? (
                                                <img src={config.homeIntro.images[idx]} className="w-full h-full object-cover" alt={`Gallery ${idx + 1}`} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <span className="material-symbols-outlined">add_photo_alternate</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">Change</span>
                                            </div>
                                            <input
                                                id={`gallery-img-${idx}`}
                                                type="file"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const url = await uploadToCloudinary(e.target.files[0]);
                                                        const newImages = [...(config.homeIntro?.images || ['', '', '', ''])];
                                                        while (newImages.length < 4) newImages.push('');
                                                        newImages[idx] = url;
                                                        setConfig(prev => ({ ...prev, homeIntro: { ...prev.homeIntro, images: newImages } }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ABOUT PAGE */}
                {activeSection === 'about' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid md:grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">About Title (Philosophy)</label>
                                <input
                                    type="text" name="aboutTitle" value={config.aboutTitle} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">About Description</label>
                                <textarea
                                    name="aboutDescription" value={config.aboutDescription} onChange={handleChange} rows={4}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">About Image</label>
                                <input
                                    type="file" onChange={(e) => handleImageUpload(e, 'aboutImage')}
                                    className="w-full text-sm dark:text-gray-300 mb-2"
                                />
                                {config.aboutImage && <img src={config.aboutImage} alt="About" className="h-40 rounded-lg object-cover" />}
                            </div>
                        </div>

                        {/* THE COMPANY SECTION (Factory) */}
                        <div className="space-y-8 mt-12 border-t border-gray-100 dark:border-[#2a4032] pt-8">
                            <h3 className="font-bold text-lg dark:text-white">The Company Section (Factory & Production)</h3>
                            
                            <div className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5">
                                <h4 className="font-bold text-sm mb-3 dark:text-white">Block 1: Factory Image & Text</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Factory Title</label>
                                        <input
                                            type="text"
                                            value={config.companySection?.factoryTitle || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, factoryTitle: e.target.value } }))}
                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Factory Image</label>
                                        <input
                                            type="file"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const url = await uploadToCloudinary(e.target.files[0]);
                                                    setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, factoryImg: url } }));
                                                }
                                            }}
                                            className="w-full text-xs dark:text-gray-400"
                                        />
                                        {config.companySection?.factoryImg && <img src={config.companySection.factoryImg} className="h-12 mt-2 rounded object-cover" />}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Factory Description</label>
                                        <textarea
                                            value={config.companySection?.factoryDesc || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, factoryDesc: e.target.value } }))}
                                            rows={3}
                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5">
                                <h4 className="font-bold text-sm mb-3 dark:text-white">Block 2: Worker Image & Text</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Worker Title</label>
                                        <input
                                            type="text"
                                            value={config.companySection?.sprayTitle || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, sprayTitle: e.target.value } }))}
                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Worker Image</label>
                                        <input
                                            type="file"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const url = await uploadToCloudinary(e.target.files[0]);
                                                    setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, sprayImg: url } }));
                                                }
                                            }}
                                            className="w-full text-xs dark:text-gray-400"
                                        />
                                        {config.companySection?.sprayImg && <img src={config.companySection.sprayImg} className="h-12 mt-2 rounded object-cover" />}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Worker Description</label>
                                        <textarea
                                            value={config.companySection?.sprayDesc || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, sprayDesc: e.target.value } }))}
                                            rows={3}
                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-8">
                                <h4 className="font-bold text-sm mb-4 dark:text-white">3 Features Block</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[0, 1, 2].map((idx) => {
                                        const feature = config.companySection?.features?.[idx] || { img: '', title: '', desc: '' };
                                        return (
                                            <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1 dark:text-gray-400">Image</label>
                                                    <input
                                                        type="file"
                                                        onChange={async (e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const url = await uploadToCloudinary(e.target.files[0]);
                                                                const newFeatures = [...(config.companySection?.features || [])];
                                                                while (newFeatures.length < 3) newFeatures.push({ img: '', title: '', desc: '' });
                                                                newFeatures[idx] = { ...newFeatures[idx], img: url };
                                                                setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, features: newFeatures } }));
                                                            }
                                                        }}
                                                        className="w-full text-xs dark:text-gray-400"
                                                    />
                                                    {feature.img && <img src={feature.img} className="h-16 w-full object-cover mt-2 rounded" />}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={feature.title}
                                                    onChange={e => {
                                                        const newFeatures = [...(config.companySection?.features || [])];
                                                        while (newFeatures.length < 3) newFeatures.push({ img: '', title: '', desc: '' });
                                                        newFeatures[idx] = { ...newFeatures[idx], title: e.target.value };
                                                        setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, features: newFeatures } }));
                                                    }}
                                                    placeholder="Feature Title"
                                                    className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                                <textarea
                                                    value={feature.desc}
                                                    onChange={e => {
                                                        const newFeatures = [...(config.companySection?.features || [])];
                                                        while (newFeatures.length < 3) newFeatures.push({ img: '', title: '', desc: '' });
                                                        newFeatures[idx] = { ...newFeatures[idx], desc: e.target.value };
                                                        setConfig(prev => ({ ...prev, companySection: { ...prev.companySection!, features: newFeatures } }));
                                                    }}
                                                    placeholder="Description"
                                                    rows={3}
                                                    className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* CLIENT SECTION */}
                        <div className="space-y-8 mt-12 border-t border-gray-100 dark:border-[#2a4032] pt-8">
                            <h3 className="font-bold text-lg dark:text-white">Our Clients Section</h3>
                            <div className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5">
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Title</label>
                                        <input
                                            type="text"
                                            value={config.clientSection?.title || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, clientSection: { ...prev.clientSection!, title: e.target.value } }))}
                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Subtitle</label>
                                        <input
                                            type="text"
                                            value={config.clientSection?.subtitle || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, clientSection: { ...prev.clientSection!, subtitle: e.target.value } }))}
                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                </div>
                                
                                <h4 className="font-bold text-xs mb-3 uppercase tracking-widest opacity-50">Client Logos</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {config.clientSection?.logos?.map((logo, idx) => (
                                         <div key={idx} className="relative aspect-[3/2] bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center group overflow-hidden">
                                             <img src={logo} alt="Logo" className="max-w-[70%] max-h-[70%] object-contain" />
                                             <button type="button" onClick={() => {
                                                 const newLogos = config.clientSection?.logos?.filter((_, i) => i !== idx) || [];
                                                 setConfig(prev => ({ ...prev, clientSection: { ...prev.clientSection!, logos: newLogos } }));
                                             }} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 bg-white/80 rounded-full p-1 shadow-sm"><span className="material-symbols-outlined text-sm">delete</span></button>
                                         </div>
                                     ))}
                                     <button type="button" onClick={() => document.getElementById('upload-logo')?.click()} className="aspect-[3/2] border-2 border-dashed border-gray-100 dark:border-white/10 rounded flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                         <span className="material-symbols-outlined">add</span>
                                         <span className="text-[10px] font-bold uppercase">New Logo</span>
                                         <input type="file" id="upload-logo" className="hidden" onChange={async (e) => {
                                             if (e.target.files && e.target.files[0]) {
                                                 const url = await uploadToCloudinary(e.target.files[0]);
                                                 const newLogos = [...(config.clientSection?.logos || []), url];
                                                 setConfig(prev => ({ ...prev, clientSection: { ...prev.clientSection!, logos: newLogos } }));
                                             }
                                         }} />
                                     </button>
                                </div>
                            </div>
                        </div>

                        {/* CORE VALUES */}
                        <div className="space-y-8 mt-12 border-t border-gray-100 dark:border-[#2a4032] pt-8">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg dark:text-white">Core Values</h3>
                                <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, values: [...(prev.values || []), { icon: 'star', title: 'New Value', desc: '' }] }))}
                                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    + Add Value
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {config.values?.map((val, idx) => (
                                    <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 relative group">
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, values: prev.values.filter((_, i) => i !== idx) }))}
                                            className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text" value={val.icon} placeholder="Icon name"
                                                    onChange={e => {
                                                        const items = [...(config.values || [])];
                                                        items[idx].icon = e.target.value;
                                                        setConfig(prev => ({ ...prev, values: items }));
                                                    }}
                                                    className="w-24 p-2 rounded border text-xs dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                                <input
                                                    type="text" value={val.title} placeholder="Title"
                                                    onChange={e => {
                                                        const items = [...(config.values || [])];
                                                        items[idx].title = e.target.value;
                                                        setConfig(prev => ({ ...prev, values: items }));
                                                    }}
                                                    className="flex-1 p-2 rounded border text-sm font-bold dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                            </div>
                                            <textarea
                                                value={val.desc} placeholder="Description" rows={2}
                                                onChange={e => {
                                                    const items = [...(config.values || [])];
                                                    items[idx].desc = e.target.value;
                                                    setConfig(prev => ({ ...prev, values: items }));
                                                }}
                                                className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MILESTONES / TIMELINE */}
                        <div className="space-y-8 mt-12 border-t border-gray-100 dark:border-[#2a4032] pt-8">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg dark:text-white">Our Journey (Milestones)</h3>
                                <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, milestones: [...(prev.milestones || []), { year: '2024', title: '', desc: '' }] }))}
                                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    + Add Milestone
                                </button>
                            </div>
                            <div className="space-y-4">
                                {config.milestones?.map((m, idx) => (
                                    <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 relative group">
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, milestones: prev.milestones.filter((_, i) => i !== idx) }))}
                                            className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <input
                                                type="text" value={m.year} placeholder="Year"
                                                onChange={e => {
                                                    const items = [...(config.milestones || [])];
                                                    items[idx].year = e.target.value;
                                                    setConfig(prev => ({ ...prev, milestones: items }));
                                                }}
                                                className="md:col-span-1 p-2 rounded border text-sm font-bold dark:bg-black/20 dark:border-white/10 dark:text-white"
                                            />
                                            <div className="md:col-span-3 space-y-2">
                                                <input
                                                    type="text" value={m.title} placeholder="Title"
                                                    onChange={e => {
                                                        const items = [...(config.milestones || [])];
                                                        items[idx].title = e.target.value;
                                                        setConfig(prev => ({ ...prev, milestones: items }));
                                                    }}
                                                    className="w-full p-2 rounded border text-sm font-medium dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                                <input
                                                    type="text" value={m.desc} placeholder="Short description"
                                                    onChange={e => {
                                                        const items = [...(config.milestones || [])];
                                                        items[idx].desc = e.target.value;
                                                        setConfig(prev => ({ ...prev, milestones: items }));
                                                    }}
                                                    className="w-full p-2 rounded border text-xs dark:bg-black/20 dark:border-white/10 dark:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TEAM MEMBERS */}
                        <div className="space-y-8 mt-12 border-t border-gray-100 dark:border-[#2a4032] pt-8">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg dark:text-white">Our Team</h3>
                                <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, team: [...(prev.team || []), { name: 'Member', role: '', img: '' }] }))}
                                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    + Add Member
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {config.team?.map((member, idx) => (
                                    <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 relative group text-center">
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }))}
                                            className="absolute top-1 right-1 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                        <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full overflow-hidden mb-3 cursor-pointer" onClick={() => document.getElementById(`team-img-${idx}`)?.click()}>
                                            {member.img ? <img src={member.img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-symbols-outlined">person</span></div>}
                                            <input type="file" id={`team-img-${idx}`} className="hidden" onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const url = await uploadToCloudinary(e.target.files[0]);
                                                    const items = [...(config.team || [])];
                                                    items[idx].img = url;
                                                    setConfig(prev => ({ ...prev, team: items }));
                                                }
                                            }} />
                                        </div>
                                        <input
                                            type="text" value={member.name} placeholder="Name"
                                            onChange={e => {
                                                const items = [...(config.team || [])];
                                                items[idx].name = e.target.value;
                                                setConfig(prev => ({ ...prev, team: items }));
                                            }}
                                            className="w-full p-1 text-center bg-transparent border-none text-xs font-bold dark:text-white focus:ring-0"
                                        />
                                        <input
                                            type="text" value={member.role} placeholder="Role"
                                            onChange={e => {
                                                const items = [...(config.team || [])];
                                                items[idx].role = e.target.value;
                                                setConfig(prev => ({ ...prev, team: items }));
                                            }}
                                            className="w-full p-1 text-center bg-transparent border-none text-[10px] text-gray-500 uppercase tracking-widest focus:ring-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                {/* FOOTER & CONTACT */}
                {activeSection === 'footer' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                <input
                                    type="text" name="contactEmail" value={config.contactEmail} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                                <input
                                    type="text" name="contactPhone" value={config.contactPhone} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                                <input
                                    type="text" name="address" value={config.address} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Footer Description</label>
                                <textarea
                                    name="footerDescription" value={config.footerDescription} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Facebook URL</label>
                                <input
                                    type="text" name="socialFacebook" value={config.socialFacebook} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Instagram URL</label>
                                <input
                                    type="text" name="socialInstagram" value={config.socialInstagram} onChange={handleChange}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* PRODUCT CONFIG / DYNAMIC CATEGORIES */}
                {activeSection === 'products' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-black/5">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">Product Categories</h3>
                                    <p className="text-xs text-gray-400">Manage the labels used to classify your products.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, categories: [...(prev.categories || []), 'New Category'] }))}
                                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all"
                                >
                                    + Add Category
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(config.categories || []).map((cat, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-white dark:bg-black/20 p-2 rounded-xl border border-gray-100 dark:border-white/5 group">
                                        <input
                                            type="text"
                                            value={cat}
                                            onChange={(e) => {
                                                const newCats = [...(config.categories || [])];
                                                newCats[idx] = e.target.value;
                                                setConfig(prev => ({ ...prev, categories: newCats }));
                                            }}
                                            className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, categories: prev.categories?.filter((_, i) => i !== idx) }))}
                                            className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {(!config.categories || config.categories.length === 0) && (
                                <div className="py-12 text-center text-gray-400 italic text-sm">
                                    No dynamic categories defined. System will use defaults.
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex gap-3">
                            <span className="material-symbols-outlined text-amber-600">warning</span>
                            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                <strong>Important:</strong> Changing category names here will NOT automatically update products already assigned to the old name. You will need to re-assign those products in the Product Manager.
                            </p>
                        </div>

                        {/* MODAL LAYOUT CONFIG */}
                        <div className="mt-12 p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-black/5">
                            <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">auto_awesome_motion</span>
                                Catalogue Modal Settings
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Catalogue Header Title</label>
                                    <input
                                        type="text" 
                                        value={config.modalLayout?.headerTitle || ''} 
                                        onChange={(e) => setConfig(prev => ({ ...prev, modalLayout: { ...prev.modalLayout!, headerTitle: e.target.value } }))}
                                        className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-primary/50"
                                        placeholder="e.g., LACQUER & CEMENT"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 italic">This title appears in the sticker/header bar of the product detail window.</p>
                                </div>
                                <div className="space-y-4">
                                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Logo Visibility</label>
                                     <div 
                                        onClick={() => setConfig(prev => ({ ...prev, modalLayout: { ...prev.modalLayout!, showLogo: !(config.modalLayout?.showLogo ?? true) } }))}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-white dark:hover:bg-black/20 transition-all"
                                     >
                                         <div className={`w-12 h-6 rounded-full transition-colors relative ${ (config.modalLayout?.showLogo ?? true) ? 'bg-primary' : 'bg-gray-300' }`}>
                                             <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${ (config.modalLayout?.showLogo ?? true) ? 'right-1' : 'left-1' }`} />
                                         </div>
                                         <span className="text-sm dark:text-gray-300">Show Lava Interior logo in modal header</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTACT PAGE */}
                {activeSection === 'contact' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Page Header */}
                        <div>
                            <h3 className="font-bold dark:text-white mb-4">Page Header</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium mb-1 dark:text-gray-400">Page Title</label>
                                    <input
                                        type="text"
                                        value={config.contactPage?.pageTitle || ''}
                                        onChange={e => setConfig(prev => ({ ...prev, contactPage: { ...prev.contactPage, pageTitle: e.target.value } }))}
                                        placeholder="Liên hệ với Lava"
                                        className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium mb-1 dark:text-gray-400">Page Subtitle</label>
                                    <textarea
                                        value={config.contactPage?.pageSubtitle || ''}
                                        onChange={e => setConfig(prev => ({ ...prev, contactPage: { ...prev.contactPage, pageSubtitle: e.target.value } }))}
                                        placeholder="Ghé thăm showroom của chúng tôi..."
                                        rows={2}
                                        className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 dark:text-gray-400">Working Hours</label>
                                    <input
                                        type="text"
                                        value={config.contactPage?.workingHours || ''}
                                        onChange={e => setConfig(prev => ({ ...prev, contactPage: { ...prev.contactPage, workingHours: e.target.value } }))}
                                        placeholder="T2 – T7: 9:00 – 18:00"
                                        className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Showrooms */}
                        <div className="border-t border-gray-100 dark:border-[#2a4032] pt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold dark:text-white">Showrooms</h3>
                                <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, showrooms: [...(prev.showrooms || []), { city: 'Thành phố', address: 'Địa chỉ', label: 'Showroom', img: '' }] }))}
                                    className="text-sm text-primary hover:underline"
                                >
                                    + Add Showroom
                                </button>
                            </div>
                            <div className="space-y-4">
                                {config.showrooms?.map((sr, idx) => (
                                    <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 relative group">
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, showrooms: prev.showrooms.filter((_, i) => i !== idx) }))}
                                            className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Label (e.g. Flagship)</label>
                                                <input
                                                    type="text"
                                                    value={sr.label}
                                                    onChange={e => {
                                                        const items = [...(config.showrooms || [])];
                                                        items[idx] = { ...items[idx], label: e.target.value };
                                                        setConfig(prev => ({ ...prev, showrooms: items }));
                                                    }}
                                                    className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">City</label>
                                                <input
                                                    type="text"
                                                    value={sr.city}
                                                    onChange={e => {
                                                        const items = [...(config.showrooms || [])];
                                                        items[idx] = { ...items[idx], city: e.target.value };
                                                        setConfig(prev => ({ ...prev, showrooms: items }));
                                                    }}
                                                    className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Address</label>
                                                <input
                                                    type="text"
                                                    value={sr.address}
                                                    onChange={e => {
                                                        const items = [...(config.showrooms || [])];
                                                        items[idx] = { ...items[idx], address: e.target.value };
                                                        setConfig(prev => ({ ...prev, showrooms: items }));
                                                    }}
                                                    className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Showroom Image</label>
                                                <input
                                                    type="file"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            const url = await uploadToCloudinary(e.target.files[0]);
                                                            const items = [...(config.showrooms || [])];
                                                            items[idx] = { ...items[idx], img: url };
                                                            setConfig(prev => ({ ...prev, showrooms: items }));
                                                        }
                                                    }}
                                                    className="w-full text-xs dark:text-gray-400 mb-2"
                                                />
                                                {sr.img && <img src={sr.img} alt={sr.city} className="h-20 rounded-lg object-cover" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION TITLES */}
                {activeSection === 'titles' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Material Section Title</label>
                            <input
                                type="text" name="sectionTitleMaterials" value={config.sectionTitleMaterials} onChange={handleChange}
                                className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-8 border-t border-gray-100 dark:border-[#2a4032] pt-6">
                    <button
                        type="submit" disabled={saving}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/30"
                    >
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContentManager;
