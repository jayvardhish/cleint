import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Video, PenTool, Calculator,
  MessageSquare, ShieldCheck, Zap, ArrowRight,
  Brain, Sparkles, TrendingUp, Clock, Star
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: "Video Summarizer",
    badge: "Most Popular",
    badgeColor: "#7C3AED",
    desc: "Transform any YouTube lecture or video into crisp, structured notes in seconds using state-of-the-art transcription AI.",
    bullets: ["Auto timestamped notes", "Multi-language support", "Export to PDF"],
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    gradient: "from-violet-600/90 via-violet-500/50 to-transparent",
    accent: "#7C3AED",
    link: "/features/video-summarizer",
  },
  {
    icon: BookOpen,
    title: "Quiz Generator",
    badge: "AI Powered",
    badgeColor: "#0EA5E9",
    desc: "Upload PDFs, notes, or paste text and get intelligent, curriculum-aligned quizzes with instant feedback.",
    bullets: ["MCQ & open-ended", "Difficulty scaling", "Instant grading"],
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
    gradient: "from-sky-600/90 via-sky-500/50 to-transparent",
    accent: "#0EA5E9",
    link: "/features/quiz-generator",
  },
  {
    icon: Calculator,
    title: "Math Solver",
    badge: "Step-by-Step",
    badgeColor: "#10B981",
    desc: "From algebra to calculus — solve complex equations with detailed LaTeX-rendered step-by-step explanations.",
    bullets: ["LaTeX rendering", "Graph visualizer", "Supports all levels"],
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    gradient: "from-emerald-600/90 via-emerald-500/50 to-transparent",
    accent: "#10B981",
    link: "/features/math-solver",
  },
  {
    icon: MessageSquare,
    title: "Virtual Tutor",
    badge: "24/7 Available",
    badgeColor: "#F59E0B",
    desc: "Your personal AI academic assistant that answers questions, explains concepts and guides your learning journey.",
    bullets: ["Context-aware chat", "Subject expert mode", "Study plan builder"],
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
    gradient: "from-amber-600/90 via-amber-500/50 to-transparent",
    accent: "#F59E0B",
    link: "/features/virtual-tutor",
  },
];

const stats = [
  { label: "Active Learners", value: "50K+", icon: Star },
  { label: "Videos Processed", value: "2M+", icon: Video },
  { label: "Accuracy Rate", value: "99.9%", icon: ShieldCheck },
  { label: "Avg Response", value: "<2s", icon: Clock },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-accent italic">
            Smart<span className="text-primary">Learn</span>
          </span>
        </div>
        <div className="hidden md:flex space-x-10 text-gray-500 font-bold text-sm uppercase tracking-widest">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        </div>
        <div className="flex space-x-4 items-center">
          <Link to="/login" className="px-6 py-2.5 font-bold text-gray-600 hover:text-primary transition-colors">Login</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-32 px-8 lg:px-24">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-purple-50 to-transparent" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <div className="glass-pill mb-6 w-fit mx-auto lg:mx-0">Next-Gen AI Learning</div>
            <h1 className="text-6xl lg:text-8xl font-black text-accent leading-[0.9] mb-8">
              Master Your <br />
              <span className="text-primary text-glow italic">Knowledge</span> <br />
              Instantly.
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed">
              The world's most advanced multimodal learning engine. Transcribe lectures,
              solve equations, and generate quizzes in seconds — all powered by state-of-the-art AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="btn-primary px-10 py-5 text-lg group">
                Start Learning Free
                <Zap className="ml-3 w-5 h-5 group-hover:scale-125 transition-transform" />
              </Link>
              <a href="#features" className="btn-secondary px-10 py-5 text-lg">
                Explore Features
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 animate-float">
              <div className="glass-card p-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                  alt="Advanced Learning Interface"
                  className="rounded-[2rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 w-full"
                />
              </div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-10 -right-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden lg:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Verified</p>
                    <p className="text-xl font-black text-accent">99.9% Accuracy</p>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px]" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-10 px-8 lg:px-24 bg-accent">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 justify-center md:justify-start"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-light flex-shrink-0">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-32 px-8 lg:px-24 bg-[#FAFBFF]">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="glass-pill mx-auto mb-6">Cutting-Edge Features</div>
          <h2 className="text-5xl lg:text-7xl font-black text-accent mb-6">
            Designed for <span className="text-primary italic">Excellence</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
            Everything you need to optimize your learning workflow — built with a focus on speed, precision, and elegance.
          </p>
        </div>

        {/* 4-Column Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.25 } }}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-shadow flex flex-col"
            >
              {/* Card Image */}
              <div className="relative h-52 overflow-hidden flex-shrink-0">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient}`} />

                {/* Badge top-left */}
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-lg"
                  style={{ backgroundColor: feature.accent }}
                >
                  {feature.badge}
                </div>

                {/* Icon bottom-right */}
                <div
                  className="absolute bottom-4 right-4 w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/20"
                  style={{ backgroundColor: feature.accent }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black text-accent mb-3 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 font-medium">
                  {feature.desc}
                </p>

                {/* Bullet Points */}
                <ul className="space-y-2 mb-6">
                  {feature.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: feature.accent }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={feature.link}
                  className="mt-auto flex items-center justify-between w-full px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
                  style={{ backgroundColor: feature.accent }}
                >
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Next-Generation Learning Modalities ── */}
        <div className="mt-28 pt-20 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-primary font-black uppercase tracking-widest text-sm">Beyond Convergence</span>
              <h3 className="text-4xl lg:text-5xl font-black text-accent mt-2 leading-tight">
                Next-Generation <br />
                Learning <span className="text-primary italic">Modalities</span>
              </h3>
            </div>
            <p className="text-gray-400 font-medium max-w-sm text-sm md:text-right">
              Explore the full spectrum of AI-powered learning tools that adapt to your unique style.
            </p>
          </div>

          {/* 2 Big Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {[
              {
                img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
                badge: "Workspace Elite",
                badgeBg: "bg-primary",
                badgeText: "text-white",
                title: "AI-Optimized Multimodal Environment",
                desc: "Seamlessly transition between video, text, and voice in a unified digital ecosystem designed for cognitive performance.",
                gradient: "from-accent via-accent/50 to-transparent",
              },
              {
                img: "https://images.unsplash.com/photo-1665686310934-8fab52b3821b?auto=format&fit=crop&w=1200&q=80",
                badge: "Interstellar UI",
                badgeBg: "bg-white",
                badgeText: "text-primary",
                title: "Quantum-Speed Knowledge Hashing",
                desc: "Extract and tag core concepts from massive datasets in real-time using our proprietary neural vector hashing engine.",
                gradient: "from-primary/90 via-primary/40 to-transparent",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-[420px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl"
              >
                <img
                  src={card.img}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={card.title}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`} />
                <div className="absolute bottom-10 left-10 right-10">
                  <span className={`${card.badgeBg} ${card.badgeText} px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 inline-block`}>
                    {card.badge}
                  </span>
                  <h4 className="text-2xl lg:text-3xl font-black text-white mb-3 leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-gray-300 font-medium text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 3 Small Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Dynamic Logic",
                subtitle: "Adaptive reasoning engine",
                img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
                accent: "bg-violet-500",
                tag: "#7C3AED",
              },
              {
                title: "Universal Sync",
                subtitle: "Cross-device collaboration",
                img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
                accent: "bg-sky-500",
                tag: "#0EA5E9",
              },
              {
                title: "Adaptive Flow",
                subtitle: "Personalized learning paths",
                img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80",
                accent: "bg-emerald-500",
                tag: "#10B981",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="h-[300px] rounded-[2rem] overflow-hidden relative group shadow-xl cursor-pointer"
              >
                <img
                  src={card.img}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={card.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/50 transition-all duration-500" />

                {/* Top badge */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${card.accent} animate-pulse`} />
                  <span className="text-white text-xs font-black uppercase tracking-widest drop-shadow">
                    {card.title}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-gray-300 text-xs font-semibold mb-3">{card.subtitle}</p>
                  <div
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                    style={{ backgroundColor: card.tag }}
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32 px-8 lg:px-24 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-xs font-bold text-white uppercase tracking-widest mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Limited Early Access
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Ready to <span className="text-primary-light italic">Level Up</span> Your Learning?
          </h2>
          <p className="text-gray-300 text-lg mb-12 font-medium max-w-xl mx-auto leading-relaxed">
            Join 50,000+ students already using SmartLearn. Get unlimited access to all AI tools — completely free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary px-12 py-5 text-lg group">
              Start for Free
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="px-12 py-5 text-lg font-bold text-white border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
