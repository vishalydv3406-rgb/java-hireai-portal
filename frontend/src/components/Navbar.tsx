import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Sparkles, Building2, User as UserIcon, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, isCandidate, isRecruiter, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-teal-400 bg-clip-text text-transparent">
              HireAI
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase -mt-1">
              AI Job Engine
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/jobs"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/jobs')
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              Explore Jobs
            </span>
          </Link>

          <Link
            to="/ai-matcher"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/ai-matcher')
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              AI Resume Matcher
            </span>
          </Link>

          {isAuthenticated && isCandidate && (
            <Link
              to="/candidate"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/candidate')
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                My Applications
              </span>
            </Link>
          )}

          {isAuthenticated && isRecruiter && (
            <Link
              to="/recruiter"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/recruiter')
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                Recruiter Portal
              </span>
            </Link>
          )}
        </nav>

        {/* User Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">
                  {user?.fullName || user?.email}
                </span>
                <span className="text-[10px] text-teal-400 font-mono">
                  {user?.role}
                </span>
              </div>

              {isRecruiter && (
                <Link
                  to="/recruiter?action=post"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors shadow-sm shadow-teal-500/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Post a Job
                </Link>
              )}

              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors shadow-md shadow-teal-500/20 flex items-center gap-1.5"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
