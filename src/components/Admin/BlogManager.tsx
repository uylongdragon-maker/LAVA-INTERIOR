
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { BlogPost } from '../../../types';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { useAdminLang } from '../../contexts/AdminLanguageContext';

const BlogManager: React.FC = () => {
    const { t } = useAdminLang();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('published');

    const firebase = useMemo(() => initFirebase(), []);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        if (!firebase) return;
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(firebase.db, 'posts'));
            const fetchedPosts: BlogPost[] = [];
            querySnapshot.forEach((doc) => {
                fetchedPosts.push({ id: doc.id, ...doc.data() } as BlogPost);
            });
            // Sort by date desc
            fetchedPosts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setTitle('');
        setSlug('');
        setSummary('');
        setContent('');
        setImageFile(null);
        setImageUrl('');
        setStatus('published');
    };

    const handleEdit = (post: BlogPost) => {
        setIsEditing(true);
        setCurrentId(post.id);
        setTitle(post.title);
        setSlug(post.slug);
        setSummary(post.summary);
        setContent(post.content);
        setImageUrl(post.coverImage);
        setStatus(post.status);
    };

    const handleDelete = async (id: string) => {
        if (!firebase || !window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await deleteDoc(doc(firebase.db, 'posts', id));
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebase) return;

        try {
            let finalImageUrl = imageUrl;
            if (imageFile) {
                finalImageUrl = await uploadToCloudinary(imageFile);
            }

            const postData = {
                title,
                slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                summary,
                content,
                coverImage: finalImageUrl,
                status,
                author: 'Admin', // Hardcoded for now
                updatedAt: Timestamp.now(),
            };

            if (isEditing && currentId) {
                await updateDoc(doc(firebase.db, 'posts', currentId), postData);
                setPosts(posts.map(p => p.id === currentId ? { ...p, ...postData, id: currentId } as BlogPost : p));
            } else {
                const newPost = {
                    ...postData,
                    createdAt: Timestamp.now(),
                };
                const docRef = await addDoc(collection(firebase.db, 'posts'), newPost);
                setPosts([{ id: docRef.id, ...newPost } as BlogPost, ...posts]);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post");
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary dark:text-[#6fbe8e]">Blog Management</h2>
                <button
                    onClick={() => { resetForm(); setIsEditing(true); }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    + New Post
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                <input
                                    type="text" value={title} onChange={e => setTitle(e.target.value)} required
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Slug (URL)</label>
                                <input
                                    type="text" value={slug} onChange={e => setSlug(e.target.value)}
                                    placeholder="Auto-generated from title"
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Summary</label>
                                <textarea
                                    value={summary} onChange={e => setSummary(e.target.value)} rows={3}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                                <select
                                    value={status} onChange={e => setStatus(e.target.value as any)}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cover Image</label>
                                <input
                                    type="file" onChange={handleImageChange} accept="image/*"
                                    className="w-full text-sm dark:text-gray-300"
                                />
                                {imageUrl && (
                                    <img src={imageUrl} alt="Preview" className="mt-2 h-40 w-full object-cover rounded-lg border border-gray-200" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content</label>
                        <textarea
                            value={content} onChange={e => setContent(e.target.value)} rows={15} required
                            className="w-full p-4 rounded border dark:bg-black/20 dark:border-white/10 dark:text-white font-mono text-sm"
                            placeholder="# Write your post in Markdown..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button" onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            {currentId ? 'Update Post' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                            <img
                                src={post.coverImage || 'https://placehold.co/100x100?text=No+Image'}
                                alt={post.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-[#101913] dark:text-white">{post.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{post.summary}</p>
                                <span className="text-xs text-gray-400">
                                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-400">No posts found. Start writing!</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogManager;
