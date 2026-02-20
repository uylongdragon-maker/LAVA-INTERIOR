
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { SiteConfig, Showroom } from '../../../types';
import { useAdminLang } from '../../contexts/AdminLanguageContext';
import { uploadToCloudinary } from '../../../services/cloudinary';

const ContentManager: React.FC = () => {
    const { t } = useAdminLang();
    const [activeSection, setActiveSection] = useState<'general' | 'home' | 'about' | 'footer' | 'contact' | 'titles'>('general');
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
        contactPage: { pageTitle: '', pageSubtitle: '', workingHours: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const firebase = initFirebase();

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
                        {/* VALUES SECTION (Repeater) */}
                        {activeSection === 'about' && (
                            <div className="space-y-8 animate-fade-in mt-8 border-t border-gray-100 dark:border-[#2a4032] pt-8">
                                {/* Core Values */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold dark:text-white">Core Values</h3>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, values: [...(prev.values || []), { icon: 'star', title: 'New Value', desc: '' }] }))}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            + Add Value
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {config.values?.map((val, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => setConfig(prev => ({ ...prev, values: prev.values.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Icon (Material Symbol)</label>
                                                        <input
                                                            type="text"
                                                            value={val.icon}
                                                            onChange={e => {
                                                                const newValues = [...(config.values || [])];
                                                                newValues[idx].icon = e.target.value;
                                                                setConfig(prev => ({ ...prev, values: newValues }));
                                                            }}
                                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Title</label>
                                                        <input
                                                            type="text"
                                                            value={val.title}
                                                            onChange={e => {
                                                                const newValues = [...(config.values || [])];
                                                                newValues[idx].title = e.target.value;
                                                                setConfig(prev => ({ ...prev, values: newValues }));
                                                            }}
                                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Description</label>
                                                        <input
                                                            type="text"
                                                            value={val.desc}
                                                            onChange={e => {
                                                                const newValues = [...(config.values || [])];
                                                                newValues[idx].desc = e.target.value;
                                                                setConfig(prev => ({ ...prev, values: newValues }));
                                                            }}
                                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Milestones */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold dark:text-white">Milestones</h3>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, milestones: [...(prev.milestones || []), { year: '2024', title: 'New Milestone', desc: '' }] }))}
                                            className="text-sm text-primary hover:underline"
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
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Year</label>
                                                        <input
                                                            type="text"
                                                            value={m.year}
                                                            onChange={e => {
                                                                const newItems = [...(config.milestones || [])];
                                                                newItems[idx].year = e.target.value;
                                                                setConfig(prev => ({ ...prev, milestones: newItems }));
                                                            }}
                                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Title</label>
                                                        <input
                                                            type="text"
                                                            value={m.title}
                                                            onChange={e => {
                                                                const newItems = [...(config.milestones || [])];
                                                                newItems[idx].title = e.target.value;
                                                                setConfig(prev => ({ ...prev, milestones: newItems }));
                                                            }}
                                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Description</label>
                                                        <input
                                                            type="text"
                                                            value={m.desc}
                                                            onChange={e => {
                                                                const newItems = [...(config.milestones || [])];
                                                                newItems[idx].desc = e.target.value;
                                                                setConfig(prev => ({ ...prev, milestones: newItems }));
                                                            }}
                                                            className="w-full p-2 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Team */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold dark:text-white">Team Members</h3>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, team: [...(prev.team || []), { name: 'New Member', role: 'Role', img: '' }] }))}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            + Add Member
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {config.team?.map((member, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/5 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => setConfig(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                                        {member.img ? <img src={member.img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300"></div>}
                                                    </div>
                                                    <div className="space-y-2 flex-1">
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={e => {
                                                                const newItems = [...(config.team || [])];
                                                                newItems[idx].name = e.target.value;
                                                                setConfig(prev => ({ ...prev, team: newItems }));
                                                            }}
                                                            placeholder="Name"
                                                            className="w-full p-1 rounded border text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={member.role}
                                                            onChange={e => {
                                                                const newItems = [...(config.team || [])];
                                                                newItems[idx].role = e.target.value;
                                                                setConfig(prev => ({ ...prev, team: newItems }));
                                                            }}
                                                            placeholder="Role"
                                                            className="w-full p-1 rounded border text-xs dark:bg-black/20 dark:border-white/10 dark:text-gray-400"
                                                        />
                                                        <input
                                                            type="file"
                                                            onChange={async (e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    const url = await uploadToCloudinary(e.target.files[0]);
                                                                    const newItems = [...(config.team || [])];
                                                                    newItems[idx].img = url;
                                                                    setConfig(prev => ({ ...prev, team: newItems }));
                                                                }
                                                            }}
                                                            className="w-full text-xs dark:text-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}
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
