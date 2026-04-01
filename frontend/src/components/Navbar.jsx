import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Video, BookOpen, MessageSquare, LogOut, User, Zap } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-12">
                <Link to="/dashboard" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-accent italic">Smart<span className="text-primary">Learn</span></span>
                </Link>

                <div className="hidden lg:flex items-center space-x-8">
                    <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Center
                    </Link>
                    <Link to="/about" className="flex items-center text-gray-500 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                        About
                    </Link>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 pl-2 pr-5 py-1.5 bg-gray-50 rounded-full border border-gray-100 shadow-inner">
                    <div className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} className="w-full h-full rounded-full object-cover" alt="Profile" />
                        ) : (
                            <User className="w-4 h-4" />
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-0.5">Academic Pro</p>
                        <p className="text-sm font-black text-accent leading-none">{user?.username}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
