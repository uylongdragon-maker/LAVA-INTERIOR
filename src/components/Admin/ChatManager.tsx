
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, Timestamp, doc, updateDoc, getDocs } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { ChatSession, ChatMessage } from '../../../types';

const ChatManager: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const firebase = useMemo(() => initFirebase(), []);

    useEffect(() => {
        if (!firebase) return;
        const q = query(collection(firebase.db, 'chats'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: ChatSession[] = [];
            snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() } as ChatSession));
            setSessions(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!activeSession || !firebase) return;
        const q = query(
            collection(firebase.db, 'chats', activeSession.id, 'messages'),
            orderBy('timestamp', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(msgs);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
        return () => unsubscribe();
    }, [activeSession]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText || !activeSession || !firebase) return;
        const text = replyText;
        setReplyText('');
        try {
            await addDoc(collection(firebase.db, 'chats', activeSession.id, 'messages'), {
                sender: 'admin',
                text: text,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error("Error sending reply", error);
        }
    };

    const closeSession = async (id: string) => {
        if (!firebase || !window.confirm("Kết thúc lượt hỗ trợ này?")) return;
        try {
            await updateDoc(doc(firebase.db, 'chats', id), { status: 'closed' });
            setActiveSession(null);
        } catch (error) {
            console.error("Error closing session", error);
        }
    };

    const exportToExcel = async (session: ChatSession) => {
        if (!firebase) return;
        const q = query(collection(firebase.db, 'chats', session.id, 'messages'), orderBy('timestamp', 'asc'));
        const snap = await getDocs(q);
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Sender,Message,Timestamp\n";
        
        snap.forEach((d) => {
            const m = d.data();
            const time = m.timestamp?.toDate().toLocaleString() || '';
            csvContent += `${d.id},${m.sender},"${m.text.replace(/"/g, '""')}",${time}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `LAVA_Chat_${session.csCode || session.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-160px)] gap-6 animate-fade-in">
            {/* Sidebar: Session List */}
            <div className="w-80 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 flex flex-col shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black/5 bg-gray-50/50 dark:bg-black/20">
                    <h3 className="font-bold text-lg">Danh sách hội thoại</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                        {sessions.length} Cuộc hội thoại
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {sessions.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSession(s)}
                            className={`w-full text-left p-4 rounded-2xl transition-all border group ${activeSession?.id === s.id 
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                : 'bg-white dark:bg-zinc-800/50 border-black/5 text-gray-700 dark:text-gray-300 hover:border-primary/50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm truncate pr-2">{s.customerName}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter ${s.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-400/20 text-gray-400'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <div className="text-[10px] opacity-70 truncate mb-2">{s.phone}</div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono group-hover:text-primary transition-colors">{s.csCode}</span>
                                <span className="text-[9px] italic opacity-50">{s.createdAt?.toDate ? new Date(s.createdAt.toDate()).toLocaleDateString() : ''}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 flex flex-col shadow-sm overflow-hidden relative">
                {activeSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-black/5 bg-gray-50/50 dark:bg-black/20 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                                    {activeSession.customerName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold">{activeSession.customerName}</h4>
                                    <p className="text-xs text-gray-500">{activeSession.phone} • {activeSession.csCode}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => exportToExcel(activeSession)}
                                    className="p-2.5 rounded-xl border border-black/5 hover:bg-black/5 transition-colors text-blue-500 flex items-center gap-2"
                                    title="Xuất lịch sử chat (Excel)"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Xuất Excel</span>
                                </button>
                                {activeSession.status === 'active' && (
                                    <button 
                                        onClick={() => closeSession(activeSession.id)}
                                        className="p-2.5 rounded-xl border border-black/5 hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Đóng</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-4 bg-gray-50/20 dark:bg-black/10 custom-scrollbar">
                            {messages.map((m) => (
                                <div 
                                    key={m.id} 
                                    className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`max-w-[70%] p-5 rounded-2xl text-sm leading-relaxed ${
                                        m.sender === 'admin' 
                                            ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                                            : m.sender === 'bot'
                                                ? 'bg-black text-white rounded-tl-none italic'
                                                : 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-black/5 rounded-tl-none shadow-sm'
                                    }`}>
                                        {m.text}
                                    </div>
                                    <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-widest px-1">
                                        {m.sender.toUpperCase()} • {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply Input */}
                        {activeSession.status === 'active' && (
                            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-black/5">
                                <form onSubmit={handleSendReply} className="flex gap-4">
                                    <input 
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-black/5 rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/20 dark:text-white"
                                        placeholder="Nhập nội dung phản hồi..."
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!replyText}
                                        className="px-8 bg-primary text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        Phản hồi <span className="material-symbols-outlined text-sm">send</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-4">
                        <div className="size-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-300">chat_bubble_outline</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-400">Chọn một hội thoại để trả lời</h4>
                        <p className="text-sm text-gray-500 max-w-xs font-light">
                            Hệ thống sẽ đồng bộ tin nhắn thời gian thực để bạn có thể hỗ trợ khách hàng nhanh nhất.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManager;
