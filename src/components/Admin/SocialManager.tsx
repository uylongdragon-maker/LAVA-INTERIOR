import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { SocialPost, SocialConfig } from '../../../types';

const SocialManager: React.FC = () => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [pageInsights, setPageInsights] = useState<{reach: number, impressions: number}>({reach: 0, impressions: 0});
    const [config, setConfig] = useState<SocialConfig>({ fbPageId: '', fbAccessToken: '' });
    const [availablePages, setAvailablePages] = useState<any[]>([]);
    const [isConfigured, setIsConfigured] = useState(false);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [fetchingPages, setFetchingPages] = useState(false);
    const [userToken, setUserToken] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const firebase = initFirebase();

    useEffect(() => {
        const fetchConfig = async () => {
            if (!firebase) return;
            const docSnap = await getDoc(doc(firebase.db, 'settings', 'social'));
            if (docSnap.exists()) {
                const data = docSnap.data() as SocialConfig;
                setConfig(data);
                if (data.fbAccessToken && data.fbPageId) {
                    setIsConfigured(true);
                    fetchInitialData(data);
                }
            }
        };
        fetchConfig();
    }, []);

    const fetchInitialData = (conf: SocialConfig) => {
        fetchPosts(conf);
        fetchInsights(conf);
    };

    const fetchInsights = async (conf: SocialConfig) => {
        try {
            const res = await fetch(`https://graph.facebook.com/v19.0/${conf.fbPageId}/insights?metric=page_impressions_unique,page_posts_impressions&period=day&access_token=${conf.fbAccessToken}`);
            const data = await res.json();
            if (data.data) {
                const reach = data.data.find((i: any) => i.name === 'page_impressions_unique')?.values[0]?.value || 0;
                const impressions = data.data.find((i: any) => i.name === 'page_posts_impressions')?.values[0]?.value || 0;
                setPageInsights({ reach, impressions });
            }
        } catch (e) { console.error("Insights error", e); }
    };

    const fetchAvailablePages = async () => {
        if (!userToken) return;
        setFetchingPages(true);
        try {
            const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,category,access_token&access_token=${userToken}`);
            const meData = await meRes.json();
            if (meData.error) { alert(`Lỗi: ${meData.error.message}`); return; }
            if (meData.category) {
                handleSelectPage({ id: meData.id, name: meData.name, access_token: userToken });
                return;
            }
            const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`);
            const accountsData = await accountsRes.json();
            if (accountsData.error) {
                alert(`Lỗi lấy danh sách trang: ${accountsData.error.message}`);
            } else {
                setAvailablePages(accountsData.data || []);
            }
        } catch (error) {
            alert("Không thể kết nối với Facebook API.");
        } finally {
            setFetchingPages(false);
        }
    };

    const handleSelectPage = async (page: any) => {
        const newConfig = { fbPageId: page.id, fbAccessToken: page.access_token };
        if (!firebase) return;
        try {
            await setDoc(doc(firebase.db, 'settings', 'social'), newConfig);
            setConfig(newConfig);
            setIsConfigured(true);
            fetchInitialData(newConfig);
            alert(`Đã kết nối thành công với trang: ${page.name}`);
        } catch (error) { console.error("Error saving config", error); }
    };

    const fetchPosts = async (conf: SocialConfig) => {
        if (!conf.fbPageId || !conf.fbAccessToken) return;
        setLoading(true);
        try {
            const response = await fetch(
                `https://graph.facebook.com/v19.0/${conf.fbPageId}/posts?access_token=${conf.fbAccessToken}&fields=message,created_time,full_picture,id,permalink_url,comments.summary(true),reactions.summary(true),shares`
            );
            const data = await response.json();
            if (data.error) {
                alert(`Lỗi tải bài viết: ${data.error.message}`);
                if (data.error.code === 190) setIsConfigured(false);
                return;
            }
            const fetchedPosts: SocialPost[] = (data.data || []).map((post: any) => ({
                id: post.id,
                content: post.message || '',
                imageUrl: post.full_picture || '',
                platform: 'facebook',
                metrics: {
                    likes: post.reactions?.summary?.total_count || 0,
                    comments: post.comments?.summary?.total_count || 0,
                    shares: post.shares?.count || 0
                },
                createdAt: post.created_time,
                permalink: post.permalink_url
            }));
            setPosts(fetchedPosts);
        } catch (error) {
            alert("Không thể tải bài viết từ Facebook.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePostToFacebook = async () => {
        if (!newPostContent || !config.fbPageId || !config.fbAccessToken) return;
        setPosting(true);
        
        try {
            let photoUrl = '';
            if (selectedImage) {
                photoUrl = await uploadToCloudinary(selectedImage);
            }

            const endpoint = photoUrl 
                ? `https://graph.facebook.com/v19.0/${config.fbPageId}/photos`
                : `https://graph.facebook.com/v19.0/${config.fbPageId}/feed`;

            const body: any = {
                access_token: config.fbAccessToken,
                message: newPostContent
            };
            if (photoUrl) body.url = photoUrl;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            
            if (data.error) {
                alert(`Lỗi đăng bài: ${data.error.message}`);
            } else {
                alert('Đã đăng bài lên Facebook thành công!');
                setNewPostContent('');
                setSelectedImage(null);
                setImagePreview(null);
                fetchPosts(config);
            }
        } catch (error) {
            console.error("Post Error:", error);
            alert("Lỗi kết nối khi đăng bài.");
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-6">
            {!isConfigured ? (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-black/5 animate-fade-in max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary-dark dark:text-primary">
                        <span className="material-symbols-outlined">api</span>
                        Kết nối Facebook Fanpage
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">User Access Token</label>
                            <div className="flex gap-2">
                                <input 
                                    type="password"
                                    value={userToken}
                                    onChange={e => setUserToken(e.target.value)}
                                    className="flex-1 p-3 border border-black/10 rounded-xl dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Dán User Access Token từ Graph API Explorer"
                                />
                                <button 
                                    onClick={fetchAvailablePages}
                                    disabled={fetchingPages || !userToken}
                                    className="px-6 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:opacity-80 disabled:opacity-50 transition-all"
                                >
                                    {fetchingPages ? 'Đang tải...' : 'Lấy danh sách Trang'}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                * Sử dụng mã "User Access Token" để lấy danh sách các Trang bạn quản lý.
                            </p>
                        </div>

                        {availablePages.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-black/5">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Chọn Trang để kết nối</label>
                                <div className="grid gap-2">
                                    {availablePages.map(page => (
                                        <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5">
                                            <div>
                                                <p className="font-bold text-sm dark:text-white">{page.name}</p>
                                                <p className="text-[10px] text-gray-400">ID: {page.id}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleSelectPage(page)}
                                                className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-80 transition-all shadow-sm shadow-primary/20"
                                            >
                                                Kết nối
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Posting Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] shadow-sm border border-black/5 relative">
                            <div className="absolute top-8 right-8 flex gap-2">
                                <button 
                                    onClick={() => fetchInitialData(config)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                    title="Tải lại dữ liệu"
                                >
                                    <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
                                </button>
                                <button 
                                    onClick={() => setIsConfigured(false)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                    title="Thay đổi cấu hình"
                                >
                                    <span className="material-symbols-outlined">settings</span>
                                </button>
                            </div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary-dark dark:text-primary">
                                <span className="material-symbols-outlined">create</span>
                                Đăng bài mới lên Facebook
                            </h2>
                            <textarea 
                                value={newPostContent}
                                onChange={e => setNewPostContent(e.target.value)}
                                className="w-full min-h-[160px] p-6 bg-gray-50 dark:bg-black/40 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 dark:text-white text-sm resize-none placeholder:text-gray-400"
                                placeholder="Viết nội dung bài đăng của bạn tại đây..."
                            />

                            {imagePreview && (
                                <div className="mt-4 relative group w-max">
                                    <img src={imagePreview} className="h-40 rounded-2xl border border-black/5 shadow-md object-cover aspect-video" alt="Preview" />
                                    <button 
                                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                        className="absolute -top-3 -right-3 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-4 ring-white dark:ring-zinc-900"
                                    >
                                        <span className="material-symbols-outlined text-sm font-bold">close</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-8">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-gray-500 hover:text-primary-dark transition-all cursor-pointer bg-gray-100 dark:bg-white/5 py-3 px-6 rounded-full border border-black/5">
                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Thêm hình ảnh</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageSelect}
                                        />
                                    </label>
                                </div>
                                <button 
                                    onClick={handlePostToFacebook}
                                    disabled={posting || !newPostContent}
                                    className="px-10 py-4 bg-primary text-white font-black rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-[0_12px_24px_-8px_rgba(255,101,0,0.4)] disabled:opacity-50 disabled:shadow-none active:scale-95"
                                >
                                    {posting ? 'Đang gửi bài...' : 'Đăng ngay'}
                                </button>
                            </div>
                        </div>

                        {/* Recent Posts Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {loading && posts.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center py-20">
                                    <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : posts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-sm border border-black/5 hover:shadow-xl transition-all group">
                                    <div className="aspect-video rounded-2xl overflow-hidden mb-5 relative bg-gray-100 dark:bg-white/5">
                                        {post.imageUrl ? (
                                            <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Post" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-300 text-5xl font-light">description</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                            <span className="material-symbols-outlined text-[12px]">public</span> Facebook
                                        </div>
                                    </div>
                                    <p className="text-sm line-clamp-2 mb-6 font-light leading-relaxed dark:text-gray-300 h-10">{post.content}</p>
                                    <div className="flex justify-between items-center pt-5 border-t border-black/5">
                                        <div className="flex items-center gap-5 text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                                                <span className="text-[11px] font-black">{post.metrics.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                                                <span className="text-[11px] font-black">{post.metrics.comments}</span>
                                            </div>
                                        </div>
                                        <a 
                                            href={post.permalink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-primary font-black uppercase tracking-widest hover:text-primary-dark transition-colors flex items-center gap-1"
                                        >
                                            Chi tiết <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Analytics Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-black/5 space-y-8 shadow-sm">
                            <h3 className="text-lg font-bold flex items-center gap-3 text-primary-dark dark:text-primary">
                                <span className="material-symbols-outlined">insights</span>
                                Thống kê của Trang
                            </h3>
                            <div className="space-y-5">
                                <div className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 transition-colors hover:bg-primary/10">
                                    <p className="text-[10px] text-primary-dark uppercase font-black mb-1.5 tracking-widest">Tiếp cận khách hàng</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-black tracking-tight">{pageInsights.reach.toLocaleString()}</p>
                                        <span className="text-[10px] text-green-500 font-bold mb-1 flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[14px]">trending_up</span> Mới nhất
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 bg-green-500/5 rounded-[24px] border border-green-500/10 transition-colors hover:bg-green-500/10">
                                    <p className="text-[10px] text-green-600 uppercase font-black mb-1.5 tracking-widest">Lượt hiển thị bài đăng</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-black tracking-tight">{pageInsights.impressions.toLocaleString()}</p>
                                        <span className="text-[10px] text-gray-400 font-bold mb-1">Tổng cộng</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-all duration-700" />
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Kế hoạch Phân luồng</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-xs text-white/70">
                                        <span className="size-1.5 bg-primary rounded-full" />
                                        Đăng bài chéo các Group nội thất
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-white/70">
                                        <span className="size-1.5 bg-primary rounded-full" />
                                        Chia sẻ lên Story Instagram
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-white/70">
                                        <span className="size-1.5 bg-primary rounded-full" />
                                        Gửi tin nhắn mẫu cho khách quan tâm
                                    </li>
                                </ul>
                                <button className="w-full mt-4 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold hover:bg-white/5 transition-all">
                                    Thiết lập luồng mới
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialManager;
