import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Upload, Brain, CheckCircle2, XCircle, Info, ArrowRight, Trophy } from 'lucide-react';
import api from '../utils/api';

const QuizGenerator = () => {
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Content, 2: Generation, 3: Taking, 4: Results

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const generateQuiz = async () => {
        if (!content && !file) return alert("Please provide text or a file.");

        setLoading(true);
        setCurrentStep(2);

        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('content', content);
        formData.append('difficulty', 'medium');
        formData.append('num_questions', '5');

        try {
            const response = await api.post('/api/quizzes/generate', formData);
            setQuiz(response.data);
            setCurrentStep(3);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            alert("Error generating quiz.");
            setCurrentStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (qIdx, option) => {
        setUserAnswers({ ...userAnswers, [qIdx]: option });
    };

    const calculateScore = () => {
        let score = 0;
        quiz.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correct_answer) score++;
        });
        return score;
    };

    const shuffleQuestions = () => {
        const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
        setQuiz({ ...quiz, questions: shuffled });
        setUserAnswers({});
        setCurrentStep(3);
        setShowResults(false);
    };

    return (
        <div className="min-h-screen bg-[#FAFBFF] p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-16 text-center lg:text-left">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-pill mb-6 w-fit mx-auto lg:mx-0"
                    >
                        Intelligence Assessment Hub
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-black text-accent tracking-tighter leading-none mb-6"
                    >
                        Quiz <span className="text-primary italic text-glow">Architect</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 font-medium max-w-3xl leading-relaxed"
                    >
                        Transform static text and documents into dynamic, AI-powered diagnostic assessments designed for deep cognitive mapping.
                    </motion.p>
                </div>

                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        Source Knowledge Input
                                    </h3>
                                    <div className="relative group">
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Paste lecture logs, research papers, or study notes here..."
                                            className="w-full h-[400px] p-8 bg-white border border-gray-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 outline-none resize-none shadow-2xl shadow-primary/5 font-bold text-gray-700 transition-all placeholder:text-gray-200"
                                        />
                                        <FileText className="absolute bottom-10 right-10 w-8 h-8 text-gray-100 group-focus-within:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                                        Multimodal Document Scan
                                    </h3>
                                    <div className="h-[400px] bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col items-center justify-center shadow-2xl shadow-primary/5 hover:shadow-primary/10 group transition-all relative overflow-hidden group">
                                        <input type="file" onChange={handleFileChange} id="doc-upload" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.txt" />
                                        <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12 duration-500">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <p className="text-2xl font-black text-accent mb-2">
                                            {file ? file.name : "Drop Source Matrix"}
                                        </p>
                                        <p className="text-gray-400 font-medium italic">Standard PDF/TXT protocols supported</p>
                                        
                                        <div className="mt-10 flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                                            <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={generateQuiz}
                                    className="btn-primary px-16 py-6 text-xl rounded-[2.5rem] group shadow-2xl shadow-primary/40 active:scale-95"
                                >
                                    Initialize Generation Protocol
                                    <Brain className="ml-4 w-7 h-7 group-hover:scale-125 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-40 text-center"
                        >
                            <div className="relative mb-12">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-40 h-40 border-[16px] border-primary/10 border-t-primary rounded-full shadow-[0_0_50px_rgba(124,58,237,0.2)]"
                                />
                                <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-5xl font-black text-accent mb-6 leading-none">Mapping Neural Nodes</h2>
                            <p className="text-gray-400 max-w-lg text-xl font-medium leading-relaxed italic">
                                Sequencing assessment modules from provided source material using high-speed reasoning engines...
                            </p>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-16 pb-40"
                        >
                            <div className="sticky top-24 bg-white/80 backdrop-blur-2xl py-8 px-10 z-20 border-b border-gray-100 -mx-10 rounded-b-[3rem] shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <BookOpen className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-accent tracking-tighter leading-none">{quiz.title}</h2>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2 italic">Active Assessment Sequence</p>
                                    </div>
                                </div>
                                <span className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                                    {quiz.questions.length} Diagnostic Pairs
                                </span>
                            </div>

                            <div className="space-y-12">
                                {quiz.questions.map((q, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white border border-gray-50 rounded-[4rem] p-12 shadow-2xl shadow-primary/5 hover:border-primary/20 transition-colors"
                                    >
                                        <div className="flex items-start mb-10">
                                            <span className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center font-black text-lg mr-6 mt-1 flex-shrink-0 border border-primary/10">
                                                {idx + 1}
                                            </span>
                                            <h3 className="text-3xl font-black text-accent leading-tight tracking-tight pt-2">{q.question}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-20">
                                            {q.options.map((option, oIdx) => (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleAnswerSelect(idx, option)}
                                                    className={`p-6 text-left rounded-[2rem] border-2 transition-all group ${userAnswers[idx] === option
                                                        ? 'border-primary bg-primary/5 text-primary font-black shadow-xl shadow-primary/10'
                                                        : 'border-gray-50 hover:border-primary/40 hover:bg-white text-gray-600 font-bold'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-3 h-3 rounded-full transition-colors ${userAnswers[idx] === option ? 'bg-primary' : 'bg-gray-100'}`}></div>
                                                        {option}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex justify-center pt-10">
                                <button
                                    onClick={() => {
                                        if (Object.keys(userAnswers).length < quiz.questions.length) {
                                            return alert("Please resolve all diagnostic pairs before submission.");
                                        }
                                        setCurrentStep(4);
                                        setShowResults(true);
                                    }}
                                    className="btn-primary px-20 py-8 rounded-[3rem] text-2xl group shadow-2xl shadow-primary/30 active:scale-95"
                                >
                                    Push Analysis to Core
                                    <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-3 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-16 pb-40"
                        >
                            <div className="purple-gradient text-white rounded-[4rem] p-24 text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/30">
                                        <Trophy className="w-12 h-12 text-yellow-300 fill-yellow-300" />
                                    </div>
                                    <h2 className="text-7xl font-black mb-4 tracking-tighter italic">Diagnostic Finalized</h2>
                                    <p className="text-3xl text-purple-100 mb-12 font-medium">Cognitive Mapping: <span className="text-white font-black">{Math.round((calculateScore() / quiz.questions.length) * 100)}%</span> Efficiency</p>
                                    <div className="flex gap-6 justify-center">
                                        <button onClick={() => { setCurrentStep(1); setQuiz(null); setUserAnswers({}); }} className="bg-white text-primary px-12 py-5 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl active:scale-95">
                                            New Matrix
                                        </button>
                                        <button onClick={shuffleQuestions} className="bg-white/10 text-white border-2 border-white/50 backdrop-blur-md px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-white/20 transition-all active:scale-95">
                                            Rerender Sync
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-accent px-6 tracking-tighter">Detailed Analysis</h3>
                                {quiz.questions.map((q, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-12 rounded-[3.5rem] border ${userAnswers[idx] === q.correct_answer ? 'bg-green-50/50 border-green-100 shadow-green-500/5' : 'bg-red-50/50 border-red-100 shadow-red-500/5'} shadow-2xl`}
                                    >
                                        <div className="flex items-start mb-10">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-6 mt-1 flex-shrink-0 border shadow-sm ${userAnswers[idx] === q.correct_answer ? 'bg-white text-green-500 border-green-100' : 'bg-white text-red-500 border-red-100'}`}>
                                                {userAnswers[idx] === q.correct_answer ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                                            </div>
                                            <h4 className="text-3xl font-black text-accent tracking-tight leading-tight pt-2">{q.question}</h4>
                                        </div>
                                        <div className="ml-18 pl-0 md:pl-4 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Submitted Outcome</p>
                                                    <p className={`text-xl font-black ${userAnswers[idx] === q.correct_answer ? "text-green-600" : "text-red-500"}`}>{userAnswers[idx]}</p>
                                                </div>
                                                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Hashed Identity</p>
                                                    <p className="text-xl font-black text-green-600">{q.correct_answer}</p>
                                                </div>
                                            </div>
                                            <div className="p-8 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-inner flex items-start">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 mr-6">
                                                    <Info className="w-6 h-6" />
                                                </div>
                                                <p className="text-gray-500 font-bold italic leading-relaxed text-lg">{q.explanation}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QuizGenerator;
