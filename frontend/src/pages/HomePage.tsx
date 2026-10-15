import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Search, MapPin, Briefcase, Zap, ArrowRight, ShieldCheck, Database, Cpu, CheckCircle } from 'lucide-react';

export const HomePage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 blur-[130px] -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Full-Stack Recruitment Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white mb-6 leading-tight">
            Connecting Top Talent With <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Precision AI Matching
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg mb-10 leading-relaxed">
            Eliminate traditional keyword filtering. HireAI uses vector embeddings, Apache Tika text parsing, and LLM matching to evaluate true candidate fit and deliver instant interview prep.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto p-2 sm:p-2.5 rounded-2xl glass-panel shadow-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
          >
            <div className="flex-1 flex items-center gap-2 px-3 w-full border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0">
              <Search className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skills (e.g. Java, React, Spring Boot)"
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-2 px-3 w-full pb-2 sm:pb-0">
              <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or Remote"
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              Search Jobs
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-slate-400">
            <span className="text-slate-500">Popular:</span>
            {['Java 21', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Remote'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setKeyword(tag);
                  navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── Key Architecture Metrics ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl glass-card border border-slate-800/80">
            <div className="text-3xl font-heading font-extrabold text-teal-400 mb-1">98.4%</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Matching Accuracy</div>
            <p className="text-xs text-slate-400">pgvector semantic cosine similarity across skills & projects.</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800/80">
            <div className="text-3xl font-heading font-extrabold text-teal-400 mb-1">&lt; 150ms</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">API Latency</div>
            <p className="text-xs text-slate-400">PostgreSQL indexing with Spring Boot 3 & HikariCP pool.</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800/80">
            <div className="text-3xl font-heading font-extrabold text-teal-400 mb-1">100%</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Explainable AI</div>
            <p className="text-xs text-slate-400">Transparent radar skill gaps and automated interview coaching.</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800/80">
            <div className="text-3xl font-heading font-extrabold text-teal-400 mb-1">Stateless</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">JWT Security</div>
            <p className="text-xs text-slate-400">BCrypt 12 rounds, role-based authorization, refresh token rotation.</p>
          </div>

        </div>
      </section>

      {/* ── Interactive Feature Callout ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-teal-500/20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium mb-4">
                <Zap className="w-3.5 h-3.5" />
                Live AI Matcher & Interview Coach
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Scan Your Resume Against Any Job in Seconds
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Paste your resume text or upload your PDF. Our AI engine extracts technical skills, identifies missing competencies, computes your real-time compatibility score, and prepares tailored interview questions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/ai-matcher"
                  className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-teal-500/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Try AI Match Scanner
                </Link>
                <Link
                  to="/jobs"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-sm transition-colors"
                >
                  Browse Open Positions
                </Link>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-semibold text-slate-200">AI Compatibility Analysis</span>
                </div>
                <span className="text-xs font-mono text-teal-400 font-bold">88.5% MATCH</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Skills Alignment (Java, Spring Boot, PostgreSQL)</span>
                    <span className="text-teal-400 font-semibold">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Experience & Seniority Fit</span>
                    <span className="text-teal-400 font-semibold">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Generated 5 custom Spring Boot architecture and system design interview questions.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
