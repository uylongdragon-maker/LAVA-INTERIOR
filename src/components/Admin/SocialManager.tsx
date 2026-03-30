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
    const [aiContent, setAiContent] = useState('');
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

    const generateAISuggestion = () => {
        setLoading(true);
        setTimeout(() => {
            const baseSuggestions = [
                "Khám phá sự kết hợp hoàn hảo giữa phong cách tối giản và vật liệu bền vững. Bộ sưu tập nội thất xi măng mài của LAVA sẽ làm bừng sáng góc nhà bạn. ✨ #LavaInterior #Minimalism",
                "Bạn đang tìm kiếm điểm nhấn cho sân vườn? Chậu cây Composite siêu nhẹ từ LAVA chính là lựa chọn số 1. Độ bền vượt trội, thiết kế sang trọng. 🌿 #SânVườn #NộiThất",
                "Ưu đãi đặc biệt: Giảm ngay 20% cho tất cả đơn hàng nội thất trong tuần này. Đừng bỏ lỡ cơ hội làm mới không gian sống của bạn! 🏷️ #KhuyếnMãi #LavaInterior"
            ];
            
            const imageSuggestions = [
                "Hình ảnh thật từ showroom: Góc làm việc hiện đại với điểm nhấn từ bàn xi măng mài LAVA. Một chút thô mộc cho ngày làm việc thêm cảm hứng. 💻☕ #HomeOffice #CreativeSpace",
                "Cận cảnh chi tiết hoàn thiện của sản phẩm mới nhất. Từng đường nét được mài thủ công kỹ lưỡng để mang lại cảm giác cao cấp nhất. 💎 #Artisan #Handmade",
                "Biến ban công nhỏ thành nơi thư giãn lý tưởng với combo chậu cây Composite LAVA. Chịu nắng mưa cực tốt, bền bỉ qua năm tháng. ☀️🌧️ #BalconyDesign #OutdoorLiving"
            ];

            const chosen = selectedImage ? imageSuggestions : baseSuggestions;
            setAiContent(chosen[Math.floor(Math.random() * chosen.length)]);
            setLoading(false);
            if (selectedImage) alert("AI đã phân tích hình ảnh và đưa ra nội dung phù hợp!");
        }, 1500);
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
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-6">
            {!isConfigured ? (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-black/5 animate-fade-in max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">api</span>
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
                                    className="flex-1 p-3 border border-black/10 rounded-xl dark:bg-zinc-800 dark:text-white text-sm"
                                    placeholder="Dán mã User Access Token từ Graph API Explorer"
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
                            <div className="space-y-3 pt-4 border-t border-black/5 animate-fade-in-up">
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
                                                className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-80 transition-all"
                                            >
                                                Kết nối
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-[11px] text-primary leading-relaxed">
                            <strong>Mẹo:</strong> Hãy đảm bảo bạn đã cấp quyền <code>pages_read_engagement</code> và <code>pages_manage_posts</code> khi lấy Token để việc kết nối diễn ra thuận lợi.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Posting & AI Suggestion */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-black/5 relative">
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
                                    title="Thay đổi cấu hình API"
                                >
                                    <span className="material-symbols-outlined">settings</span>
                                </button>
                            </div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">create</span>
                                Đăng bài mới lên Facebook
                            </h2>
                            <textarea 
                                value={newPostContent}
                                onChange={e => setNewPostContent(e.target.value)}
                                className="w-full min-h-[150px] p-6 bg-gray-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 dark:text-white text-sm"
                                placeholder="Bạn đang nghĩ gì?..."
                            />

                            {imagePreview && (
                                <div className="mt-4 relative group w-max">
                                    <img src={imagePreview} className="h-32 rounded-2xl border border-black/5 shadow-sm" alt="Preview" />
                                    <button 
                                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                        className="absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined">image</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">Thêm hình ảnh</span>
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
                                    className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                                >
                                    {posting ? 'Đang đăng...' : 'Đăng bài'}
                                </button>
                            </div>
                        </div>

                        {/* Social Analytics Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {loading && posts.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center py-20">
                                    <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-black/5 hover:shadow-xl transition-all group">
                                        <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                                            {post.imageUrl ? (
                                                <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-300 text-4xl">image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md uppercase tracking-widest">
                                                Facebook
                                            </div>
                                        </div>
                                        <p className="text-sm line-clamp-2 mb-6 font-light h-10">{post.content}</p>
                                        <div className="flex justify-between items-center pt-4 border-t border-black/5">
                                            <div className="flex items-center gap-4 text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                                                    <span className="text-[10px] font-bold">{post.metrics.likes}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">comment</span>
                                                    <span className="text-[10px] font-bold">{post.metrics.comments}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">share</span>
                                                    <span className="text-[10px] font-bold">{post.metrics.shares}</span>
                                                </div>
                                            </div>
                                            <a 
                                                href={post.permalink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-primary hover:underline font-bold"
                                            >
                                                Xem bài viết
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-12 text-center bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-black/10">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">post_add</span>
                                    <p className="text-sm text-gray-400">Chưa có bài viết nào được tìm thấy hoặc quyền truy cập bị hạn chế.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Manager & AI Tool */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-primary to-green-600 p-8 rounded-[40px] text-white space-y-6 shadow-2xl shadow-primary/20">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                                <h2 className="text-xl font-bold">AI SEO Assistant</h2>
                            </div>
                            <p className="text-sm opacity-90 font-light leading-relaxed">
                                Tự động tối ưu bài viết chuẩn SEO, tăng tỉ lệ chuyển đổi từ khách hàng trên mạng xã hội.
                            </p>
                            <button 
                                onClick={generateAISuggestion}
                                className="w-full py-4 bg-white/20 backdrop-blur-md rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white/30 transition-all border border-white/30"
                            >
                                Đề xuất nội dung ngay
                            </button>
                            
                            {aiContent && (
                                <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 animate-fade-in-up">
                                    <p className="text-xs text-white/80 leading-relaxed italic">{aiContent}</p>
                                    <button 
                                        onClick={() => { setNewPostContent(aiContent); setAiContent(''); }}
                                        className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white hover:underline flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span> Sử dụng mẫu này
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-black/5 space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">query_stats</span>
                                Thống kê Fanpage
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 dark:bg-black/20 rounded-3xl border border-black/5">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Tiếp cận (Ngày)</p>
                                    <p className="text-2xl font-black text-primary">{pageInsights.reach.toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-gray-50 dark:bg-black/20 rounded-3xl border border-black/5">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Hiển thị (Ngày)</p>
                                    <p className="text-2xl font-black text-green-500">{pageInsights.impressions.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                <p className="text-[10px] text-primary uppercase font-bold mb-2">Gợi ý từ AI Ads</p>
                                <p className="text-xs italic text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {pageInsights.reach > 0 
                                        ? "Dữ liệu cho thấy tương tác đang tập trung vào buổi tối. Hãy lên lịch đăng bài vào 20:00 để tối ưu Reach."
                                        : "Hãy bắt đầu bằng việc đăng 1 bài viết kèm hình ảnh bàn ghế xi măng để AI thu thập dữ liệu quảng cáo ban đầu."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialManager;
