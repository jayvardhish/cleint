import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        setMessage(null);
        setError(null);

        try {
            await api.post('/api/auth/reset-password', {
                token,
                new_password: password
            });
            setMessage("Password reset successful! You can now log in with your new password.");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error("Reset password failed:", err);
            setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-accent mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-500 mb-6">This password reset link is invalid or has expired.</p>
                    <button onClick={() => navigate('/login')} className="w-full btn-primary">Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white font-body">
            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 purple-gradient p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 w-fit mb-12">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">SM</div>
                        <span className="text-2xl font-bold tracking-tight">SmartLearn</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl font-bold mb-6">Create New Password</h1>
                        <p className="text-xl text-purple-100 max-w-md">
                            Ensure your new password is secure and easy for you to remember.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <h2 className="text-3xl font-bold text-accent mb-2">Set New Password</h2>
                    <p className="text-gray-500 mb-8">Please enter your new password below.</p>

                    {message ? (
                        <div className="p-8 bg-white border border-green-100 rounded-3xl text-center shadow-sm">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-accent mb-2">Success!</h3>
                            <p className="text-gray-500 mb-6">{message}</p>
                            <button onClick={() => navigate('/login')} className="btn-primary w-full">Go to Login</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-70"
                            >
                                {isSubmitting ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
