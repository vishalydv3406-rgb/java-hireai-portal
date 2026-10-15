import React, { useState } from 'react';
import { aiApi } from '../services/api';
import { AiMatchResult, InterviewPrepResult } from '../types';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Lightbulb, HelpCircle, Layers, RefreshCw } from 'lucide-react';

export const AiMatcherPage: React.FC = () => {
  const [resumeText, setResumeText] = useState(
    `Senior Java Full-Stack Engineer with 5+ years building distributed backend services using Java 21, Spring Boot 3, Spring Security, Hibernate, PostgreSQL, Docker, and REST APIs. Built real-time event pipelines with Kafka and cached high-throughput endpoints using Redis. Frontend experience with React, TypeScript, and Tailwind CSS.`
  );
  const [jobTitle, setJobTitle] = useState('Senior Backend Java Engineer');
  const [jobDescription, setJobDescription] = useState(
    `We are looking for a Senior Java Developer proficient in Java 21, Spring Boot 3, PostgreSQL, pgvector semantic search, Redis caching, and Kubernetes. Experience in microservice architecture, JUnit 5 testing, and Docker is required.`
  );

  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AiMatchResult | null>(null);
  const [prepResult, setPrepResult] = useState<InterviewPrepResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const match = await aiApi.match({
        resumeText,
        jobTitle,
        jobDescription,
      });
      setMatchResult(match);

      const prep = await aiApi.interviewPrep({
        resumeText,
        jobTitle,
        jobDescription,
      });
      setPrepResult(prep);
    } catch (err) {
      console.error('AI match analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* ── Title Banner ───────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Semantic Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
          AI Resume Scanner & Interview Coach
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Compare any resume against a job description. Receive instant alignment scores, skill gap highlights, and targeted interview prep questions.
        </p>
      </div>

      {/* ── Inputs Grid ────────────────────────────────────────── */}
      <form onSubmit={handleAnalyze} className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Resume Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
                1. Candidate Resume Text
              </label>
              <span className="text-[11px] text-slate-500">Paste raw text or bio</span>
            </div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume content here..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
            />
          </div>

          {/* Job Target */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                2. Target Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  3. Job Description & Requirements
                </label>
                <span className="text-[11px] text-slate-500">Paste job spec</span>
              </div>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
              />
            </div>
          </div>

        </div>

        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-teal-500/20 flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Embeddings & Skills...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Fit & Interview Prep
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Results Display ────────────────────────────────────── */}
      {matchResult && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Score Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-6 rounded-2xl glass-card border border-teal-500/30 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall AI Fit Score</span>
              <div className="text-5xl font-heading font-extrabold text-teal-400 my-2">
                {matchResult.overallMatchScore}%
              </div>
              <span className="text-xs text-teal-300 font-medium">
                {matchResult.overallMatchScore >= 80 ? 'Exceptional Alignment' : 'Strong Potential'}
              </span>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical Skills Overlap</span>
              <div className="text-4xl font-heading font-bold text-white my-2">
                {matchResult.skillsMatchScore}%
              </div>
              <span className="text-xs text-slate-400">Weighted against required competencies</span>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seniority & Experience</span>
              <div className="text-4xl font-heading font-bold text-white my-2">
                {matchResult.experienceMatchScore}%
              </div>
              <span className="text-xs text-slate-400">Tenure and architectural leadership fit</span>
            </div>

          </div>

          {/* Fit Summary */}
          <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-slate-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">AI Synthesis</span>
              {matchResult.fitSummary}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matched Skills */}
            <div className="p-6 rounded-2xl glass-panel">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Verified Matching Skills ({matchResult.matchedSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-2xl glass-panel">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Skills Gap / Unmentioned In Resume ({matchResult.missingSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Interview Preparation Questions */}
          {prepResult && prepResult.questions.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-lg font-heading font-bold text-white">
                    Tailored Interview Questions for {prepResult.jobTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Targeted technical and behavioral scenarios based on the tech stack requirements.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {prepResult.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-semibold uppercase tracking-wider">
                        {q.category}
                      </span>
                      <span className="text-slate-500 font-mono">Q{idx + 1}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">{q.question}</h4>
                    <p className="text-xs text-slate-400 italic">Context: {q.context}</p>

                    <div className="pt-2 text-xs text-teal-300/90 bg-teal-950/30 p-2.5 rounded-lg border border-teal-500/20">
                      <span className="font-bold text-teal-400">Expert Answer Strategy: </span>
                      {q.tips}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
