import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Zap, Upload, ImageIcon, Calculator, RefreshCw,
    FileText, CheckCircle2, ChevronRight, Download, Copy,
    Trash2, Lightbulb, History, Send, X, Terminal, Brain
} from 'lucide-react';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MathSolver = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [expression, setExpression] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeInput, setActiveInput] = useState('text'); // 'text' or 'image'

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/api/math/history');
            setHistory(response.data);
            if (response.data.length > 0 && !selectedItem) {
                setSelectedItem(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch math history:", error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setActiveInput('image');
        }
    };

    const handleSolveText = async () => {
        if (!expression.trim()) return;
        setLoading(true);
        try {
            const response = await api.post('/api/math/solve-text', { expression });
            const newItem = {
                _id: response.data.id,
                expression,
                solution: response.data.solution,
                type: 'text',
                created_at: new Date().toISOString()
            };
            setHistory([newItem, ...history]);
            setSelectedItem(newItem);
            setExpression("");
        } catch (error) {
            alert("Failed to solve manual input.");
        } finally {
            setLoading(false);
        }
    };

    const handleSolveImage = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post('/api/math/solve', formData);
            const newItem = {
                _id: response.data.id,
                expression: response.data.expression,
                solution: response.data.solution,
                type: 'image',
                created_at: new Date().toISOString()
            };
            setHistory([newItem, ...history]);
            setSelectedItem(newItem);
            setFile(null);
            setPreview(null);
        } catch (error) {
            alert("Failed to analyze image.");
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/api/math/${id}`);
            const newHistory = history.filter(item => item._id !== id);
            setHistory(newHistory);
            if (selectedItem?._id === id) {
                setSelectedItem(newHistory[0] || null);
            }
        } catch (error) {
            alert("Failed to delete item.");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFBFF] flex flex-col lg:flex-row overflow-x-hidden">
            {/* Sidebar: History */}
            <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm relative z-20">
                <div className="p-5 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
                            <History className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-accent tracking-tighter italic">Proof <span className="text-primary">Logs</span></h2>
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none">Computational History</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <Brain className="w-16 h-16 text-gray-300 mb-6" />
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed">No equations sequenced...</p>
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
                                <h4 className="font-black text-accent text-sm truncate pr-2 tracking-tight mb-2 leading-none italic">{item.expression}</h4>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedItem?._id === item._id ? 'bg-primary animate-pulse' : 'bg-gray-100'}`}></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center">
                                         {item.type === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Terminal className="w-3 h-3 mr-1" />}
                                         {new Date(item.created_at).toLocaleDateString()}
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
            <main className="flex-1 flex flex-col p-4 lg:p-8 w-full relative min-w-0 overflow-x-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <header className="mb-8 text-center lg:text-left">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-pill mb-6 w-fit mx-auto lg:mx-0"
                    >
                        Theoretical Physics & Calculus
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-black text-accent tracking-tighter leading-none mb-4"
                    >
                        Math <span className="text-primary italic text-glow">Architect</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 font-medium max-w-3xl leading-relaxed mx-auto lg:mx-0"
                    >
                        Deconstruct complex mathematical structures into logical, step-by-step proofs using high-fidelity reasoning engines.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    {/* Input Column */}
                    <div className="xl:col-span-5 space-y-10">
                        {/* Selector Tabs */}
                        <div className="bg-white p-2 rounded-[2rem] border border-gray-50 shadow-2xl shadow-primary/5 flex">
                            <button
                                onClick={() => setActiveInput('text')}
                                className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-widest ${activeInput === 'text' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <Terminal className="w-4 h-4" />
                                <span>Code Input</span>
                            </button>
                            <button
                                onClick={() => setActiveInput('image')}
                                className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-widest ${activeInput === 'image' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                <span>Visual Scan</span>
                            </button>
                        </div>

                        {/* Text Card */}
                        <AnimatePresence mode="wait">
                            {activeInput === 'text' ? (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="bg-white rounded-[3.5rem] border border-gray-50 shadow-2xl p-10 space-y-8 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-focus-within:bg-primary transition-colors"></div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                                            <Calculator className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-black text-accent tracking-tighter italic">Equation Synthesis</h3>
                                    </div>
                                    <textarea
                                        value={expression}
                                        onChange={(e) => setExpression(e.target.value)}
                                        placeholder="Enter theorem, function, or expression (e.g. Solve 3x + 4 = 19 or d/dx sin(x)^2...)"
                                        className="w-full p-8 bg-gray-50 border border-transparent rounded-[2.5rem] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-gray-700 min-h-[220px] resize-none text-xl lowercase tracking-tight placeholder:text-gray-200"
                                    />
                                    <button
                                        onClick={handleSolveText}
                                        disabled={!expression.trim() || loading}
                                        className="w-full btn-primary py-6 rounded-[2rem] text-xl shadow-2xl shadow-primary/40 group active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7 fill-white group-hover:scale-125 transition-transform" />}
                                        <span className="ml-3">Execute Logic Engine</span>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="image"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="bg-white rounded-[3.5rem] border border-gray-50 shadow-2xl p-10 space-y-8 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-focus-within:bg-primary transition-colors"></div>
                                    <div className="border border-gray-50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all bg-gray-50/30 relative">
                                        {preview ? (
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <img src={preview} alt="Preview" className="max-h-[280px] rounded-3xl shadow-2xl border-4 border-white mb-6 relative z-10 transition-transform duration-500 group-hover:scale-105" />
                                                <button onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-6 -right-6 bg-red-500 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform z-20">
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12 duration-500 border border-primary/10 shadow-inner">
                                                    <Upload className="w-10 h-10" />
                                                </div>
                                                <h4 className="text-2xl font-black text-accent mb-2">Initialize Visual Scan</h4>
                                                <p className="text-gray-400 font-medium italic mb-8">Align problem in frame</p>
                                            </>
                                        )}
                                        <input type="file" id="math-img" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        <label
                                            htmlFor="math-img"
                                            className="px-12 py-5 bg-white hover:bg-gray-50 text-accent font-black rounded-2xl cursor-pointer transition-all border border-gray-100 shadow-xl active:scale-95"
                                        >
                                            {file ? "Change Target Image" : "Select Source Matrix"}
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleSolveImage}
                                        disabled={!file || loading}
                                        className="w-full btn-primary py-6 rounded-[2rem] text-xl shadow-2xl shadow-primary/40 group active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <Layers className="w-7 h-7 group-hover:scale-110 transition-transform" />}
                                        <span className="ml-3">Extract & Compute</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Sidebar (Right) */}
                    <div className="xl:col-span-7">
                        {loading ? (
                            <div className="bg-white rounded-[4rem] border border-gray-50 shadow-2xl p-24 flex flex-col items-center justify-center text-center h-full min-h-[650px] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gray-50">
                                    <motion.div 
                                        className="h-full bg-primary shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 12, repeat: Infinity }}
                                    />
                                </div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 90, 180, 270, 360]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-32 h-32 bg-primary/5 rounded-[3rem] flex items-center justify-center text-primary mb-12 border border-primary/20 shadow-inner"
                                >
                                    <Calculator className="w-16 h-16" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-accent mb-6 leading-none tracking-tighter italic">Proof Synthesis Active</h2>
                                <p className="text-gray-400 max-w-sm text-xl font-medium leading-relaxed italic mx-auto">
                                    Decomposing variables and validating computational proofs using recursive reasoning chains.
                                </p>
                                <div className="mt-16 space-y-4 w-64 mx-auto">
                                    <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: [-200, 200] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="h-full w-1/3 bg-primary rounded-full"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] text-center">Neural Mapping Protocol</p>
                                </div>
                            </div>
                        ) : selectedItem ? (
                            <motion.div
                                key={selectedItem._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[4rem] border border-gray-50 shadow-2xl overflow-hidden flex flex-col min-h-[700px] group"
                            >
                                <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20 gap-4">
                                    <div className="flex items-center space-x-6 min-w-0">
                                        <div className="w-16 h-16 bg-accent text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-accent/20 shrink-0">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="font-black text-2xl text-accent tracking-tighter leading-none mb-2 italic truncate">Scientific Proof Output</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-3 py-1 rounded-full border border-primary/10 hidden sm:inline-block">Computational Verified</span>
                                                <div className="w-1 h-1 bg-gray-200 rounded-full hidden sm:block"></div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedItem.type} Mode</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 shrink-0">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(selectedItem.solution)}
                                            className="p-4 bg-gray-50 hover:bg-white border hover:border-primary/30 rounded-2xl transition-all text-gray-400 hover:text-primary active:scale-95 shadow-sm"
                                        >
                                            <Copy className="w-6 h-6 hover:scale-110 transition-transform" />
                                        </button>
                                        <button className="hidden sm:flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 hover:shadow-primary/30 transition-all active:scale-95">
                                            <Download className="w-5 h-5" />
                                            <span>Export LaTeX</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-12 lg:p-16 overflow-y-auto space-y-16 bg-white flex-1 relative">
                                    {/* Problem Header */}
                                    <div className="bg-[#FCFCFD] p-10 rounded-[3rem] border border-gray-50 shadow-inner relative overflow-hidden group/math">
                                        <div className="absolute top-10 right-10 p-6 opacity-[0.03] group-hover/math:opacity-[0.08] transition-opacity pointer-events-none">
                                            <Calculator className="w-48 h-48 text-primary" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 inline-block bg-white px-4 py-1.5 rounded-full border border-primary/10 shadow-sm italic">Input Core Matrix</div>
                                            <div className="text-3xl font-black text-accent selection:bg-primary/20 tracking-tight leading-tight italic">
                                                {selectedItem.expression}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Solution Content */}
                                    <div className="space-y-12">
                                        <div className="flex items-center space-x-8">
                                            <div className="h-[1px] flex-1 bg-gray-100" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] whitespace-nowrap italic">Neural Logic Chain</span>
                                            <div className="h-[1px] flex-1 bg-gray-100" />
                                        </div>

                                        <div className="prose prose-2xl prose-slate max-w-none selection:bg-primary/20 min-h-[400px]">
                                            <div className="math-container bg-white rounded-[3.5rem] p-4 relative">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={{
                                                        p: ({ children }) => <p className="mb-8 leading-relaxed text-gray-600 font-bold italic text-2xl tracking-tight">{children}</p>,
                                                        li: ({ children }) => <li className="mb-4 text-gray-600 font-bold text-xl tracking-tight list-none flex items-center gap-4">
                                                            <div className="w-2 h-2 bg-primary/30 rounded-full shrink-0"></div>
                                                            {children}
                                                        </li>
                                                    }}
                                                >
                                                    {selectedItem.solution}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pro Features Footer */}
                                    <div className="pt-16 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 flex items-start space-x-6">
                                            <div className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg shrink-0 mt-0.5 border border-primary/5">
                                                <CheckCircle2 className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-accent uppercase tracking-tight mb-2 italic">Axiomatic Verification</p>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Each derivative step cross-validated against fundamental mathematical axioms for 100% formal rigour.</p>
                                            </div>
                                        </div>
                                        <div className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/10 flex items-start space-x-6">
                                            <div className="w-12 h-12 bg-white text-accent rounded-2xl flex items-center justify-center shadow-lg shrink-0 mt-0.5 border border-accent/5">
                                                <Lightbulb className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-accent uppercase tracking-tight mb-2 italic">Pedagogical Synthesis</p>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Solution structure optimized for heuristic mastery, ensuring conceptual transfer rather than just finality.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[4rem] border-4 border-dashed border-gray-50 p-24 flex flex-col items-center justify-center text-center group h-full relative overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gray-50 rounded-full blur-[100px] group-hover:bg-primary/5 transition-colors"></div>
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: -15, y: -10 }}
                                    className="w-48 h-48 bg-[#FAFBFF] rounded-[4rem] flex items-center justify-center text-gray-100 mb-12 shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500"
                                >
                                    <Calculator className="w-24 h-24" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-gray-300 tracking-tighter mb-4 italic">Proof Environment Idle</h2>
                                <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.5em]">Sequence a problem matrix to deploy the core engine</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MathSolver;
