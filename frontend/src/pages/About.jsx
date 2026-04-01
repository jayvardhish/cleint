import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, Globe, Award } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-white font-body selection:bg-primary selection:text-white">
            {/* Header / Nav */}
            <nav className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
                <Link to="/" className="flex items-center space-x-3 group">
                    <motion.div 
                        whileHover={{ rotate: 180 }}
                        className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"
                    >
                        <Zap className="w-6 h-6 fill-white" />
                    </motion.div>
                    <span className="text-2xl font-black tracking-tight text-accent italic group-hover:text-primary transition-colors">Smart<span className="text-primary group-hover:text-accent">Learn</span></span>
                </Link>
                <Link to="/signup" className="btn-primary px-8 py-3 rounded-full text-sm">Join the Elite</Link>
            </nav>

            {/* Hero Section with Glassmorphism */}
            <section className="pt-32 pb-40 px-8 lg:px-24 overflow-hidden relative bg-[#FAFBFF]">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="glass-pill mx-auto mb-10 bg-white/50 border-white text-primary font-black uppercase tracking-[0.2em] text-[10px]">Neural Intelligence Research</div>
                        <h1 className="text-5xl lg:text-7xl font-black text-accent leading-[0.9] mb-10 tracking-tighter">
                            Architecting <br />
                            <span className="text-primary text-glow italic">Human</span> Potential.
                        </h1>
                        <p className="text-2xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto mb-16 px-4">
                            SmartLearn is a deep-tech initiative focused on the convergence of multimodal AI and cognitive science to redefine how knowledge is acquired and synthesized.
                        </p>
                        
                        <div className="flex justify-center gap-10">
                            <motion.div whileHover={{ y: -5 }} className="text-center">
                                <p className="text-5xl font-black text-accent">99.9%</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Accuracy Rate</p>
                            </motion.div>
                            <div className="w-px h-16 bg-gray-200"></div>
                            <motion.div whileHover={{ y: -5 }} className="text-center">
                                <p className="text-5xl font-black text-primary">2.4ms</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Latency Hub</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Background Geometric Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full pointer-events-none -z-10">
                    <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
            </section>

            {/* Core Values with Premium Cards */}
            <section className="py-40 px-8 lg:px-24 bg-white relative">
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FAFBFF] to-white"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                    {[
                        { icon: <Target className="w-8 h-8" />, title: "Precision", color: "from-blue-600 to-indigo-600", desc: "Our neural engines undergo rigorous academic validation to ensure 0-error rate in mathematical and conceptual summarization." },
                        { icon: <Globe className="w-8 h-8" />, title: "Inclusion", color: "from-purple-600 to-pink-600", desc: "Designed for a borderless world, supporting 50+ languages and real-time transcription across any device or format." },
                        { icon: <Award className="w-8 h-8" />, title: "Excellence", color: "from-orange-600 to-red-600", desc: "We don't just solve problems; we provide context. Every SmartLearn insight is backed by verified reference hashing." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -15 }}
                            className="bg-[#F8F9FF] rounded-[4rem] p-16 border border-gray-100/50 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all group"
                        >
                            <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-[2rem] flex items-center justify-center text-white mb-10 shadow-2xl`}>
                                {item.icon}
                            </div>
                            <h3 className="text-4xl font-black text-accent mb-6 tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                            <p className="text-gray-500 font-medium leading-loose text-lg">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Visionary Section */}
            <section className="py-40 px-8 lg:px-24 bg-accent text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex flex-col lg:flex-row items-center gap-24 relative z-10">
                    <div className="lg:w-1/2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/30 rounded-[4rem] blur-[60px] group-hover:bg-primary/50 transition-colors"></div>
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                                className="rounded-[4rem] relative z-10 w-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000"
                                alt="Innovation Hub"
                            />
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="glass-pill mb-10 bg-white/10 border-white/20 text-white font-bold tracking-widest text-[10px]">OUR GENESIS</div>
                        <h2 className="text-4xl lg:text-6xl font-black mb-10 leading-[0.9] tracking-tighter italic">Democratizing <br /> <span className="text-primary not-italic">Universal</span> Insight.</h2>
                        <p className="text-xl text-gray-400 font-medium leading-relaxed mb-16">
                            SmartLearn was born in a garage with one vision: to give every student the same high-fidelity cognitive tools as the world's top institutions. Today, we process petabytes of knowledge data to help you learn faster than ever before.
                        </p>
                        
                        <button className="bg-white text-accent px-12 py-6 rounded-[2rem] font-black text-lg hover:bg-primary hover:text-white transition-all shadow-2xl flex items-center gap-4">
                            Explore Our Stack
                            <Zap className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Experience Footer */}
            <footer className="py-24 px-8 lg:px-24 bg-white text-center border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center space-x-3 mb-10">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Zap className="w-7 h-7 fill-white" />
                        </div>
                        <span className="text-3xl font-black tracking-tight text-accent italic">Smart<span className="text-primary">Learn</span></span>
                    </div>
                    <div className="flex justify-center flex-wrap gap-10 text-gray-400 font-bold uppercase tracking-widest text-xs mb-16 px-4">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <a href="#" className="hover:text-primary transition-colors">Lab Reports</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                    <p className="text-gray-300 font-medium text-sm tracking-tight italic">Part of the Intelligence Research Labs Collective. <br /> Developed with precision and passion in 2026.</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
