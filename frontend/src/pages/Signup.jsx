import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Chrome, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { API_URL } from '../utils/api';

const schema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Signup = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            await api.post('/api/auth/signup', data);
            alert("Account created successfully! Please log in.");
            navigate('/login');
        } catch (error) {
            console.error("Signup failed:", error);
            const errorMessage = error.response?.data?.detail || error.message || "Signup failed. Please try again.";
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F9FAFB] font-body">
            {/* Left Panel - Immersive Decorative (Matches Login) */}
            <div className="hidden lg:flex w-[45%] purple-gradient p-16 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                    <img
                        src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&q=80"
                        alt="Abstract Mesh Blue"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center space-x-3 w-fit mb-20 group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl transition-transform group-hover:rotate-12">
                            <Zap className="w-7 h-7 fill-primary" />
                        </div>
                        <span className="text-3xl font-black tracking-tight italic">Smart<span className="text-white/80">Learn</span></span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="glass-pill text-white/90 border-white/20 mb-8 w-fit bg-white/10">Start Your Journey</div>
                        <h1 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter">
                            Join the <br />
                            <span className="text-secondary italic">Limitless</span> <br />
                            Generation.
                        </h1>
                        <p className="text-xl text-purple-100 max-w-sm font-medium leading-relaxed opacity-80">
                            Create your universal learning ID and start mastering any subject with the power of multimodal AI.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[5, 6, 7, 8].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-10 h-10 rounded-full border-2 border-primary shadow-lg" alt="User" />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-purple-200 uppercase tracking-widest">Growing 24% month-over-month</p>
                </div>

                <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-1/2 -left-20 w-80 h-80 bg-primary-light/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Right Panel - Premium Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white p-12 rounded-[3rem] shadow-2xl shadow-purple-900/5 border border-gray-100 overflow-y-auto max-h-[90vh]"
                >
                    <div className="lg:hidden flex items-center space-x-3 mb-10">
                        <Zap className="w-8 h-8 text-primary fill-primary" />
                        <span className="text-2xl font-black tracking-tight text-accent italic">SmartLearn</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-accent mb-3 tracking-tight">Create Account</h2>
                        <p className="text-gray-400 font-medium">Join thousands of students learning smarter with AI.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('username')}
                                    type="text"
                                    placeholder="John Doe"
                                    className={`input-premium ${errors.username ? 'border-red-400 bg-red-50/10' : ''}`}
                                />
                            </div>
                            {errors.username && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`input-premium ${errors.email ? 'border-red-400 bg-red-50/10' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`input-premium ${errors.password ? 'border-red-400 bg-red-50/10' : ''}`}
                                />
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary py-5 text-lg shadow-primary/30 group disabled:opacity-70 mt-4"
                        >
                            {isSubmitting ? "Generating ID..." : (
                                <>Sign Up <UserPlus className="ml-3 w-6 h-6 group-hover:-translate-y-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-6 bg-white text-gray-400 font-bold uppercase tracking-[0.2em]">Universal SSO</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <a
                            href={`${API_URL}/api/auth/google/login`}
                            className="flex items-center justify-center w-full py-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 hover:shadow-xl transition-all font-bold text-gray-700 shadow-md"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" /> Sign up with Google
                        </a>
                    </div>

                    <p className="mt-10 text-center text-gray-400 font-medium">
                        Already have an account? <Link to="/login" className="text-primary font-black ml-1 hover:underline">Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
