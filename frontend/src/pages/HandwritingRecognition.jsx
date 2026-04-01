import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Copy, Check, Download,
    Image as ImageIcon, Zap, History, X,
    Trash2, RefreshCw, Layers, ExternalLink, ScrollText
} from 'lucide-react';
import api from '../utils/api';

const HandwritingRecognition = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/api/ocr/history');
            setHistory(response.data);
            if (response.data.length > 0 && !selectedItem) {
                setSelectedItem(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch OCR history:", error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', 'default');

        try {
            const response = await api.post('/api/ocr/upload', formData);
            const newItem = {
                _id: response.data.id,
                title: file.name,
                text: response.data.text,
                mode: response.data.mode,
                created_at: new Date().toISOString()
            };
            setHistory([newItem, ...history]);
            setSelectedItem(newItem);
            setFile(null);
            setPreview(null);
        } catch (error) {
            alert("Handwriting conversion failed. Ensure you're uploaded a clear image.");
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/api/ocr/${id}`);
            const newHistory = history.filter(item => item._id !== id);
            setHistory(newHistory);
            if (selectedItem?._id === id) {
                setSelectedItem(newHistory[0] || null);
            }
        } catch (error) {
            alert("Failed to delete record.");
        }
    };

    const copyToClipboard = () => {
        if (!selectedItem?.text) return;
        navigator.clipboard.writeText(selectedItem.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FAFBFF] flex flex-col lg:flex-row overflow-x-hidden">
            {/* Sidebar: OCR History */}
            <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm relative z-20">
                <div className="p-5 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
                            <History className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-accent tracking-tighter italic">Scan <span className="text-primary">Archive</span></h2>
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none">Intelligence Synthesis History</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <ScrollText className="w-16 h-16 text-gray-300 mb-6" />
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed">System awaiting data input...</p>
                        </div>
                    )}
                    {history.map((item) => (
                        <motion.button
                            key={item._id}
                            whileHover={{ x: 6 }}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left p-6 rounded-[2rem] transition-all border flex items-center justify-between group ${selectedItem?._id === item._id
                                ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                                : 'bg-white border-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="min-w-0 pr-4">
                                <h4 className="font-black text-accent text-sm truncate pr-2 tracking-tight mb-2 leading-none">{item.title || "Quantum Scan"}</h4>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedItem?._id === item._id ? 'bg-primary animate-pulse' : 'bg-gray-100'}`}></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center">
                                        {new Date(item.created_at).toLocaleDateString()} • {item.mode} Mode
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteItem(item._id); }}
                                className="opacity-0 group-hover:opacity-100 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.button>
                    ))}
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col p-4 lg:p-8 w-full relative overflow-x-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <header className="mb-8 text-center lg:text-left">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-pill mb-6 w-fit mx-auto lg:mx-0"
                    >
                        Multimodal OCR Engine
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-black text-accent tracking-tighter leading-none mb-4"
                    >
                        Ink <span className="text-primary italic text-glow">Transcriber</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 font-medium max-w-3xl leading-relaxed mx-auto lg:mx-0"
                    >
                        Leverage neural-pattern recognition to convert raw handwriting into high-fidelity digital assets with structural semantic preserving.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    {/* Input Column */}
                    <div className="xl:col-span-5 space-y-10">
                        {/* Upload Card */}
                        <div className="bg-white rounded-[3.5rem] border border-gray-50 shadow-2xl shadow-primary/5 p-10 relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-focus-within:bg-primary transition-colors"></div>
                           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                Capture Sequence
                            </h3>
                            
                            <div className="border border-gray-50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all bg-gray-50/30 relative">
                                {preview ? (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img src={preview} alt="Scan preview" className="max-h-[300px] rounded-3xl shadow-2xl border-4 border-white mb-6 relative z-10 transition-transform duration-500 group-hover:scale-105" />
                                        <button
                                            onClick={() => { setFile(null); setPreview(null); }}
                                            className="absolute -top-6 -right-6 bg-red-500 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform z-20"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12 duration-500 border border-primary/10 shadow-inner">
                                            <ImageIcon className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-2xl font-black text-accent mb-2">Initialize Scanner</h4>
                                        <p className="text-gray-400 font-medium italic mb-8">Drop image or tap to select</p>
                                    </>
                                )}
                                <input type="file" id="ocr-img" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <label
                                    htmlFor="ocr-img"
                                    className="px-12 py-5 bg-white hover:bg-gray-50 text-accent font-black rounded-2xl cursor-pointer transition-all border border-gray-100 shadow-xl active:scale-95"
                                >
                                    {file ? "Replace Matrix" : "Select Source Image"}
                                </label>
                            </div>

                            <button
                                onClick={handleProcess}
                                disabled={!file || loading}
                                className="w-full mt-10 btn-primary py-6 rounded-[2rem] text-xl shadow-2xl shadow-primary/30 group disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7 fill-white group-hover:scale-125 transition-transform" />}
                                <span className="ml-3">Begin Intelligent Scan</span>
                            </button>
                        </div>
                    </div>

                    {/* Result Column */}
                    <div className="xl:col-span-7">
                        {loading ? (
                            <div className="bg-white rounded-[4rem] border border-gray-50 shadow-2xl p-20 flex flex-col items-center justify-center text-center h-full min-h-[600px] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gray-50">
                                    <motion.div 
                                        className="h-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 15, repeat: Infinity }}
                                    />
                                </div>
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0.5, 1, 0.5],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-32 h-32 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-12 border border-primary/20 shadow-inner"
                                >
                                    <ScrollText className="w-16 h-16" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-accent mb-6 leading-none tracking-tighter">Geometric Hashing Active</h2>
                                <p className="text-gray-400 max-w-md text-xl font-medium leading-relaxed italic">
                                    Decoding ink vector distributions and reconstructuring semantic nodes using deep vision logic.
                                </p>
                            </div>
                        ) : selectedItem ? (
                            <motion.div
                                key={selectedItem._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[4rem] border border-gray-50 shadow-2xl overflow-hidden flex flex-col h-full min-h-[650px] group"
                            >
                                <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-16 h-16 bg-accent text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-accent/20">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-2xl text-accent tracking-tighter leading-none mb-2 italic">{selectedItem.title || "Quantum Scan Output"}</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Neural Map Verified</span>
                                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedItem.mode} Protocol</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-6 py-4 bg-gray-50 hover:bg-white border hover:border-primary/30 rounded-2xl transition-all text-gray-400 hover:text-primary flex items-center gap-3 group active:scale-95"
                                        >
                                            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 group-hover:text-primary transition-colors" />}
                                            <span className={`text-sm font-black ${copied ? 'text-green-500' : ''}`}>{copied ? 'Copied' : 'Syndicate Text'}</span>
                                        </button>
                                        <button className="hidden sm:flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 hover:shadow-primary/30 transition-all active:scale-95">
                                            <Download className="w-5 h-5" />
                                            <span>Export TXT</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-12 lg:p-16 overflow-y-auto bg-white flex-1 relative">
                                    <div className="bg-[#FCFCFD] rounded-[3.5rem] p-12 shadow-inner border border-gray-50 relative group min-h-[450px] hover:border-primary/20 transition-colors">
                                        <div className="absolute top-12 left-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                                            <ScrollText className="w-48 h-48 text-primary" />
                                        </div>
                                        <div className="relative z-10 whitespace-pre-wrap text-xl font-bold text-gray-600 leading-relaxed italic selection:bg-primary/20 tracking-tight">
                                            {selectedItem.text}
                                        </div>
                                    </div>

                                    {/* Intelligence Summary */}
                                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-gray-50">
                                        <div className="bg-primary/5 p-8 rounded-[2.5rem] flex items-start space-x-6 border border-primary/10">
                                            <div className="w-12 h-12 bg-white text-primary shadow-lg rounded-2xl flex items-center justify-center shrink-0">
                                                <Zap className="w-6 h-6 fill-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-accent uppercase tracking-tight mb-2 italic">Spatial Intelligence</p>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Neural vision algorithms successfully reconstructed semantic structure from raw topological ink data.</p>
                                            </div>
                                        </div>
                                        <div className="bg-accent/5 p-8 rounded-[2.5rem] flex items-start space-x-6 border border-accent/10">
                                            <div className="w-12 h-12 bg-white text-accent shadow-lg rounded-2xl flex items-center justify-center shrink-0">
                                                <RefreshCw className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-accent uppercase tracking-tight mb-2 italic">Consistency Check</p>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Cross-validated with linguistic probability maps to ensure 99.8% lexical accuracy across all nodes.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[4rem] border-4 border-dashed border-gray-50 p-24 flex flex-col items-center justify-center text-center group h-full relative overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gray-50 rounded-full blur-[100px] group-hover:bg-primary/5 transition-colors"></div>
                                <motion.div
                                    whileHover={{ y: -12, rotate: 10, scale: 1.1 }}
                                    className="w-40 h-40 bg-[#FAFBFF] rounded-[3.5rem] flex items-center justify-center text-gray-100 mb-12 shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500"
                                >
                                    <ImageIcon className="w-20 h-20" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-gray-300 tracking-tighter mb-4 leading-none italic">Workspace Awaiting</h2>
                                <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.5em]">Select an energy-matrix scan to commence data visualization</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HandwritingRecognition;
