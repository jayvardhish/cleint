import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Chrome, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../utils/api';

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/api/auth/login', data);
            const { access_token } = response.data;

            const userRes = await api.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            login(access_token, userRes.data);
            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed context:", {
                apiUrl: API_URL,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            let errorMessage = "Login failed. Please check your connection.";
            if (error.response) {
                errorMessage = error.response.data?.detail || `Server Error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "No response from server. This could be a CORS issue or the backend being down.";
            }
            
            alert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F9FAFB] font-body">
            {/* Left Panel - Immersive Decorative */}
            <div className="hidden lg:flex w-[45%] purple-gradient p-16 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                    <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
                        alt="Abstract Mesh"
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
                        <div className="glass-pill text-white/90 border-white/20 mb-8 w-fit bg-white/10">Welcome Back</div>
                        <h1 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter">
                            Resume Your <br />
                            <span className="text-secondary italic">Genius</span> Journey.
                        </h1>
                        <p className="text-xl text-purple-100 max-w-sm font-medium leading-relaxed opacity-80">
                            Log in to access your curated learning environment and AI-driven growth metrics.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-primary shadow-lg" alt="User" />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-purple-200 uppercase tracking-widest">Joined by 10k+ Learners</p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-40 -left-20 w-80 h-80 bg-primary-light/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Right Panel - Premium Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white p-12 rounded-[3rem] shadow-2xl shadow-purple-900/5 border border-gray-100"
                >
                    <div className="lg:hidden flex items-center space-x-3 mb-12">
                        <Zap className="w-8 h-8 text-primary fill-primary" />
                        <span className="text-2xl font-black tracking-tight text-accent italic">SmartLearn</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-accent mb-3 tracking-tight">Sign In</h2>
                        <p className="text-gray-400 font-medium">Enter your credentials to enter the platform.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Password</label>
                                <Link to="/forgot-password" title="Forgot Password" className="text-xs text-primary font-black hover:underline tracking-widest">Forgot?</Link>
                            </div>
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
                            {isSubmitting ? "Authenticating..." : (
                                <>Enter Dashboard <LogIn className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-6 bg-white text-gray-400 font-bold uppercase tracking-[0.2em]">Secure Gateway</span>
                        </div>
                    </div>

                    <div className="mt-10">
                        <a
                            href={`${API_URL}/api/auth/google/login`}
                            className="flex items-center justify-center w-full py-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 hover:shadow-xl transition-all font-bold text-gray-700 shadow-md"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" /> Continue with Google
                        </a>
                    </div>

                    <p className="mt-12 text-center text-gray-400 font-medium">
                        New to the platform? <Link to="/signup" className="text-primary font-black ml-1 hover:underline">Create Account</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
