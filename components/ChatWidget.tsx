
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, doc, setDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { ChatMessage, ChatSession } from '../types';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'lead' | 'chat'>('lead');
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const firebase = initFirebase();

    useEffect(() => {
        if (!activeSessionId || !firebase) return;
        const q = query(
            collection(firebase.db, 'chats', activeSessionId, 'messages'),
            orderBy('timestamp', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(msgs);
            scrollToBottom();
        });
        return () => unsubscribe();
    }, [activeSessionId]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStartChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebase) return;
        
        try {
            const sessionRef = await addDoc(collection(firebase.db, 'chats'), {
                customerName: customerInfo.name,
                phone: customerInfo.phone,
                status: 'active',
                createdAt: Timestamp.now(),
                csCode: `CS-${Math.floor(10000 + Math.random() * 90000)}`
            });
            
            setActiveSessionId(sessionRef.id);
            setStep('chat');
            
            // Bot Welcome Message
            await addDoc(collection(firebase.db, 'chats', sessionRef.id, 'messages'), {
                sender: 'bot',
                text: `Chào mừng ${customerInfo.name} đến với Lava Interior! Hiện tại chúng tôi đang có chương trình khuyến mãi giảm 10% (mã LAVA10). Bạn cần tư vấn trực tiếp hay muốn tìm mua sản phẩm nào ạ?`,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error("Error starting chat", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText || !activeSessionId || !firebase) return;

        const text = inputText;
        setInputText('');
        
        try {
            await addDoc(collection(firebase.db, 'chats', activeSessionId, 'messages'), {
                sender: 'customer',
                text: text,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] font-body">
            {/* Chat Bubble */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="size-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce"
                >
                    <span className="material-symbols-outlined text-3xl">chat</span>
                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] h-[550px] bg-white dark:bg-zinc-900 rounded-[32px] shadow-[0_24px_64px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-black/5 animate-scale-in">
                    {/* Header */}
                    <div className="p-6 bg-primary text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <span className="material-symbols-outlined">support_agent</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Hỗ trợ trực tuyến</h3>
                                <div className="flex items-center gap-1">
                                    <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Đang online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-black/20 custom-scrollbar">
                        {step === 'lead' ? (
                            <div className="space-y-6 pt-4 animate-fade-in-up">
                                <div className="text-center space-y-2">
                                    <h4 className="text-xl font-bold">Xin chào! 👋</h4>
                                    <p className="text-sm text-gray-500 font-light">Vui lòng để lại thông tin để chúng tôi có thể hỗ trợ bạn tốt nhất.</p>
                                </div>
                                <form onSubmit={handleStartChat} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Họ và tên</label>
                                        <input 
                                            required
                                            value={customerInfo.name}
                                            onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                            className="w-full p-4 bg-white dark:bg-zinc-800 border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 dark:text-white"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Số điện thoại</label>
                                        <input 
                                            required
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                            className="w-full p-4 bg-white dark:bg-zinc-800 border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 dark:text-white"
                                            placeholder="0901234567"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl shadow-black/10"
                                    >
                                        Bắt đầu hội thoại
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                                            msg.sender === 'customer' 
                                                ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                                                : msg.sender === 'bot'
                                                    ? 'bg-gradient-to-br from-gray-800 to-black text-white rounded-tl-none shadow-lg'
                                                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-black/5 rounded-tl-none shadow-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {msg.sender === 'bot' ? 'Assistant Bot' : msg.sender === 'admin' ? 'Support' : 'Bạn'}
                                        </span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    {step === 'chat' && (
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-black/5">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input 
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    className="flex-1 bg-gray-100 dark:bg-zinc-800/50 border-none rounded-full py-3 px-6 text-sm focus:ring-1 focus:ring-primary dark:text-white"
                                    placeholder="Nhập nội dung..."
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputText}
                                    className="size-10 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-80 active:scale-90 transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
