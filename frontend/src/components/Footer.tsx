import React from 'react';
import { Sparkles, Github, Shield, Cpu, Database, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-heading font-bold text-white">HireAI</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mb-4 leading-relaxed">
              Production-grade AI-powered job recruitment platform. Built with Java 21, Spring Boot 3, PostgreSQL, pgvector semantic search, Apache Tika resume parsing, and React TypeScript frontend.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Cpu className="w-3 h-3 text-teal-400" /> Java 21 & Spring Boot 3
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Database className="w-3 h-3 text-teal-400" /> PostgreSQL + pgvector
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Server className="w-3 h-3 text-teal-400" /> React 18 + Vite
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/jobs" className="hover:text-teal-400 transition-colors">Search Jobs</a></li>
              <li><a href="/ai-matcher" className="hover:text-teal-400 transition-colors">AI Match & Scanner</a></li>
              <li><a href="/jobs?remote=REMOTE" className="hover:text-teal-400 transition-colors">Remote Roles</a></li>
              <li><a href="/api/v1/swagger-ui.html" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Swagger API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Developer & Source
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/vishalydv3406-rgb/java-hireai-portal"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-teal-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/vishalydv3406-rgb"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-400 transition-colors"
                >
                  vishalydv3406-rgb
                </a>
              </li>
              <li className="text-slate-500 text-[11px] mt-2">
                Distributed under MIT License. Clean Architecture & Production Engineering.
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HireAI Inc. Developed by Vishal Yadav.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
