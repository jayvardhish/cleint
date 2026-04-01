import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Trash2, BookOpen, Calculator, Layers, Brain, Zap, Copy } from 'lucide-react';
import api from '../utils/api';

const VirtualTutor = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/api/chat/history');
            setChat(response.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = { role: 'user', content: message, timestamp: new Date() };
        setChat([...chat, userMsg]);
        setMessage("");
        setLoading(true);

        try {
            const response = await api.post('/api/chat/message', { message });
            setChat(prev => [...prev, { role: 'assistant', content: response.data.reply, timestamp: new Date() }]);
        } catch (error) {
            console.error("Chat failed:", error);
            alert("Failed to get response from tutor.");
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await api.delete('/api/chat/history');
            setChat([]);
        } catch (error) {
            console.error("Failed to clear chat:", error);
            alert("Failed to clear chat history.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-72px)] bg-[#FAFBFF] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl px-12 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <Bot className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-accent tracking-tighter italic">Neural <span className="text-primary">Tutor</span></h1>
                            <div className="glass-pill text-[8px] px-2 py-0.5 border-primary/10 text-primary">V3.0 CORE</div>
                        </div>
                        <div className="flex items-center text-[10px] text-green-500 font-black tracking-[0.2em] uppercase">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
                            Quantum Interface Active
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={clearChat} 
                        className="p-4 bg-red-50 text-red-400 hover:text-red-600 rounded-2xl transition-all hover:bg-red-100 border border-transparent hover:border-red-200 active:scale-95 group"
                    >
                        <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 lg:p-8 space-y-8 scrollbar-hide">
                {chat.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-12 py-20 relative">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[60px] animate-pulse"></div>
                            <div className="w-40 h-40 bg-white rounded-[3.5rem] shadow-inner flex items-center justify-center text-primary border border-primary/5 relative z-10 group hover:rotate-6 transition-transform duration-700">
                                <Sparkles className="w-16 h-16 group-hover:scale-125 transition-transform" />
                            </div>
                        </motion.div>
                        <div className="max-w-xl mx-auto">
                            <h3 className="text-5xl font-black text-accent mb-6 tracking-tighter leading-none italic selection:bg-primary/20">How can I assist your <span className="text-primary italic">academic breakthrough?</span></h3>
                            <p className="text-gray-400 text-xl font-medium leading-relaxed italic">Deconstruct complex theorems, architect research papers, or resolve multi-variable logic problems in real-time.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                            {[
                                { t: "Explain String Theory", i: <Zap className="w-4 h-4" /> },
                                { t: "Derive Euler's Identity", i: <Calculator className="w-4 h-4" /> },
                                { t: "Advanced Organic Chemistry", i: <Layers className="w-4 h-4" /> },
                                { t: "Neuroplasticity Synthesis", i: <Brain className="w-4 h-4" /> }
                            ].map(topic => (
                                <motion.button
                                    key={topic.t}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    onClick={() => setMessage(topic.t)}
                                    className="px-8 py-5 bg-white border border-gray-50 rounded-[2rem] text-sm font-black tracking-widest uppercase hover:border-primary/20 hover:text-primary transition-all text-gray-400 shadow-xl shadow-primary/5 flex items-center justify-center gap-3 group"
                                >
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">{topic.i}</span>
                                    <span>{topic.t}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {chat.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-5 group`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl transition-transform group-hover:scale-110 ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white'
                                }`}>
                                {msg.role === 'user' ? <User className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
                            </div>
                            <div className={`p-5 lg:p-7 rounded-[2rem] shadow-lg relative group/msg transition-all ${msg.role === 'user'
                                ? 'bg-accent text-white rounded-br-none shadow-accent/10'
                                : 'bg-white text-gray-700 border border-gray-50 rounded-bl-none shadow-primary/5'
                                }`}>
                                <div className={`absolute top-0 ${msg.role === 'user' ? 'right-full' : 'left-full'} p-3 opacity-0 group-hover/msg:opacity-40 transition-opacity`}>
                                    <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-base lg:text-lg font-medium leading-relaxed tracking-tight selection:bg-white/20 whitespace-pre-wrap">{msg.content}</p>
                                <div className={`flex items-center gap-3 mt-4 opacity-50 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`w-1 h-1 rounded-full ${msg.role === 'user' ? 'bg-white' : 'bg-primary'}`}></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center space-x-3 bg-white px-10 py-6 rounded-[2.5rem] border border-gray-50 shadow-2xl shadow-primary/5"
                        >
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic mb-0.5">Synthesizing</span>
                            <div className="flex gap-1.5">
                                {[0, 150, 300].map(d => (
                                    <div key={d} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
                <div ref={scrollRef} className="h-20" />
            </div>

            {/* Input Area */}
            <footer className="p-4 lg:p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 sticky bottom-0 z-30">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-6">
                        <div className="relative flex-grow group">
                            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Sequence your academic query..."
                                className="w-full px-8 py-5 bg-gray-50/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all pr-20 font-bold text-lg text-accent placeholder:text-gray-400 relative z-10"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3 z-20">
                                <button className="p-3 text-gray-200 hover:text-primary transition-all rounded-xl hover:bg-primary/5 group/btn">
                                    <BookOpen className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                </button>
                                <div className="w-[1px] h-6 bg-gray-100"></div>
                                <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">LLM-CORE<br/>READY</div>
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || loading}
                            className="w-16 h-16 btn-primary rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50 group shrink-0"
                        >
                            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-8 opacity-20 pointer-events-none grayscale">
                        <div className="flex items-center gap-2">
                             <Zap className="w-3 h-3" />
                             <span className="text-[8px] font-black uppercase tracking-[0.4em]">Proprietary reasoning Engine</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Layers className="w-3 h-3" />
                             <span className="text-[8px] font-black uppercase tracking-[0.4em]">Zero latency interface</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VirtualTutor;
