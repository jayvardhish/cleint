import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { motion } from 'framer-motion';
import { Video, BookOpen, MessageSquare, PenTool, Calculator, FileText, Bot, ShieldAlert, Map, LayoutDashboard, LogOut, User as UserIcon, Zap } from 'lucide-react';

import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Pages for Performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const VideoSummarizer = React.lazy(() => import('./pages/VideoSummarizer'));
const QuizGenerator = React.lazy(() => import('./pages/QuizGenerator'));
const HandwritingRecognition = React.lazy(() => import('./pages/HandwritingRecognition'));
const MathSolver = React.lazy(() => import('./pages/MathSolver'));
const VirtualTutor = React.lazy(() => import('./pages/VirtualTutor'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const About = React.lazy(() => import('./pages/About'));

// Loading Screen Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-gray-400 text-sm tracking-widest uppercase">Loading Resource...</p>
    </div>
  </div>
);

// Basic components (to be created)
const Dashboard = () => {
  console.log("Dashboard component rendered");
  const { user } = useAuth();
  return (
    <div className="p-8 lg:p-16 bg-[#FAFBFF] min-h-screen">
      <div className="mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-pill mb-6 w-fit bg-primary/10 text-primary border-primary/20"
        >
          Academic Command Center
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl lg:text-7xl font-black text-accent tracking-tight leading-none mb-6"
        >
          Welcome, <span className="text-primary italic">{user?.username || 'Learner'}!</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-500 font-medium max-w-3xl leading-relaxed"
        >
          Your multimodal learning engines are synchronized. Access your specialized AI tools below to accelerate your academic journey.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {[
          { to: "/features/video-summarizer", icon: <Video />, title: "Video Summarizer", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80", gradient: "from-violet-700/80 via-violet-500/40 to-transparent", accent: "#7C3AED", badge: "Most Popular", bullets: ["Auto timestamped notes", "Multi-language support", "Export to PDF"], desc: "Transform any YouTube lecture or video into crisp, structured notes in seconds." },
          { to: "/features/quiz-generator", icon: <BookOpen />, title: "Quiz Generator", image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80", gradient: "from-sky-700/80 via-sky-500/40 to-transparent", accent: "#0EA5E9", badge: "AI Powered", bullets: ["MCQ & open-ended", "Difficulty scaling", "Instant grading"], desc: "Upload PDFs or notes and get intelligent, curriculum-aligned quizzes instantly." },
          { to: "/features/handwriting-recognition", icon: <PenTool />, title: "Handwriting OCR", image: "https://images.unsplash.com/photo-1503551723145-6c040742065b?auto=format&fit=crop&w=800&q=80", gradient: "from-orange-700/80 via-orange-500/40 to-transparent", accent: "#F97316", badge: "Precision OCR", bullets: ["Scan any handwriting", "Edit & export", "98% accuracy"], desc: "Seamlessly digitize paper-based notes into high-fidelity editable text." },
          { to: "/features/math-solver", icon: <Calculator />, title: "Math Solver", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80", gradient: "from-emerald-700/80 via-emerald-500/40 to-transparent", accent: "#10B981", badge: "Step-by-Step", bullets: ["LaTeX rendering", "Graph visualizer", "All difficulty levels"], desc: "Solve complex equations with detailed step-by-step LaTeX explanations." },
          { to: "/features/virtual-tutor", icon: <Bot />, title: "Virtual Tutor", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80", gradient: "from-amber-700/80 via-amber-500/40 to-transparent", accent: "#F59E0B", badge: "24/7 Available", bullets: ["Context-aware chat", "Subject expert mode", "Study plan builder"], desc: "An intelligent AI companion for deep-dives into any academic subject area." }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -10, transition: { duration: 0.25 } }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-shadow flex flex-col"
          >
            {/* Image */}
            <div className="relative h-52 overflow-hidden flex-shrink-0">
              <img
                src={item.image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={item.title}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient}`} />
              {/* Badge */}
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-lg"
                style={{ backgroundColor: item.accent }}
              >
                {item.badge}
              </div>
              {/* Live indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
              {/* Icon */}
              <div
                className="absolute bottom-4 right-4 w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/20"
                style={{ backgroundColor: item.accent }}
              >
                {React.cloneElement(item.icon, { className: "w-5 h-5" })}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-black text-accent mb-2 leading-tight">{item.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">{item.desc}</p>

              {/* Bullets */}
              <ul className="space-y-1.5 mb-5">
                {item.bullets.map((b, bi) => (
                  <li key={bi} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={item.to}
                className="mt-auto flex items-center justify-between w-full px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ backgroundColor: item.accent }}
              >
                Launch Engine
                <Zap className="w-4 h-4 fill-white" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center purple-gradient text-white">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-lg">Loading your profile...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Navbar />
      <div className="flex-1 bg-white overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/features/video-summarizer" element={
                <ProtectedRoute>
                  <VideoSummarizer />
                </ProtectedRoute>
              } />

              <Route path="/features/quiz-generator" element={
                <ProtectedRoute>
                  <QuizGenerator />
                </ProtectedRoute>
              } />

              <Route path="/features/handwriting-recognition" element={
                <ProtectedRoute>
                  <HandwritingRecognition />
                </ProtectedRoute>
              } />

              <Route path="/features/math-solver" element={
                <ProtectedRoute>
                  <MathSolver />
                </ProtectedRoute>
              } />

              <Route path="/features/virtual-tutor" element={
                <ProtectedRoute>
                  <VirtualTutor />
                </ProtectedRoute>
              } />

              {/* Fallback */}
            </Routes>
          </React.Suspense>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
