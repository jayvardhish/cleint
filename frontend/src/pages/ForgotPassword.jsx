import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        setError(null);

        try {
            await api.post('/api/auth/forgot-password', { email });
            setMessage("If an account exists with this email, you will receive a reset link shortly.");
        } catch (err) {
            console.error("Forgot password failed:", err);
            setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-body">
            {/* Left Panel - Decorative (Keeping it consistent with Login/Signup) */}
            <div className="hidden lg:flex w-1/2 purple-gradient p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center space-x-2 w-fit mb-12">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">SM</div>
                        <span className="text-2xl font-bold tracking-tight">SmartLearn</span>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-bold mb-6">Reset Password</h1>
                        <p className="text-xl text-purple-100 max-w-md">
                            Don't worry! It happens. Enter your email and we'll help you get back on track.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10">
                    <p className="text-purple-200">© 2026 Smart Multimodal Learning Platform. All rights reserved.</p>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Link to="/login" className="flex items-center text-primary font-semibold hover:text-primary-light mb-8 group">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Login
                    </Link>

                    <h2 className="text-3xl font-bold text-accent mb-2">Forgot Password?</h2>
                    <p className="text-gray-500 mb-8">Enter the email address associated with your account.</p>

                    {message ? (
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl mb-6">
                            {message}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-70"
                            >
                                {isSubmitting ? "Sending..." : (
                                    <>Send Reset Link <Send className="ml-2 w-5 h-5" /></>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
