import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resumesApi, applicationsApi } from '../services/api';
import { Resume, Application } from '../types';
import { FileText, Upload, Trash2, CheckCircle2, Clock, Eye, Sparkles, Building, AlertCircle } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'resumes'>('applications');

  // Resumes state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewingResume, setViewingResume] = useState<Resume | null>(null);

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const fetchResumes = async () => {
    setResumeLoading(true);
    try {
      const data = await resumesApi.getMyResumes();
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setResumeLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const data = await applicationsApi.getMyApplications();
      setApplications(data.content || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchApplications();
  }, []);

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      await resumesApi.upload(uploadFile, uploadLabel || undefined, resumes.length === 0);
      setUploadFile(null);
      setUploadLabel('');
      await fetchResumes();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await resumesApi.setPrimary(id);
      await fetchResumes();
    } catch (err) {
      console.error('Failed to set primary resume:', err);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumesApi.delete(id);
      await fetchResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OFFERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'UNDER_REVIEW':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">Candidate Portal</span>
          <h1 className="text-2xl font-heading font-bold text-white mt-0.5">
            {user?.fullName || 'Candidate Profile'}
          </h1>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'applications'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'resumes'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resumes & Documents ({resumes.length})
          </button>
        </div>
      </div>

      {/* ── Applications Tab ──────────────────────────────────── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tracking status across active submissions</span>
          </div>

          {appsLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">No applications submitted yet</h4>
              <p className="text-xs text-slate-400 mb-4">Explore open roles and apply with AI precision.</p>
              <a
                href="/jobs"
                className="inline-flex px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-heading font-semibold text-white">
                        {app.jobTitle}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-teal-400" />
                      {app.companyName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    {app.matchScore && (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{app.matchScore}% AI Match</span>
                      </div>
                    )}
                    <div className="text-right text-slate-500 text-[11px]">
                      Submitted on {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Resumes Tab ───────────────────────────────────────── */}
      {activeTab === 'resumes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Upload Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleUploadResume} className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" />
                Upload New Resume
              </h3>
              <p className="text-xs text-slate-400">
                Supports PDF and DOCX. Apache Tika will automatically extract skills and career history.
              </p>

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Document</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-500 file:text-slate-950 hover:file:bg-teal-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Resume Label (Optional)</label>
                <input
                  type="text"
                  value={uploadLabel}
                  onChange={(e) => setUploadLabel(e.target.value)}
                  placeholder="e.g. Senior Java Fullstack 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {uploading ? 'Parsing & Indexing...' : 'Upload & Extract Text'}
              </button>
            </form>
          </div>

          {/* Resumes List */}
          <div className="lg:col-span-7 space-y-3">
            {resumeLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading resumes...</div>
            ) : resumes.length === 0 ? (
              <div className="p-12 text-center rounded-2xl glass-panel text-slate-400 text-xs">
                No resumes uploaded yet. Upload your CV on the left to start applying.
              </div>
            ) : (
              resumes.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl glass-card flex items-start justify-between gap-4 border border-slate-800"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <h4 className="text-sm font-semibold text-white">{r.originalFilename}</h4>
                      {r.isPrimary && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Label: {r.label || 'Default'} • Size: {(r.fileSizeBytes / 1024).toFixed(1)} KB
                    </p>
                    {r.extractedTextSnippet && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        "{r.extractedTextSnippet}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!r.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(r.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteResume(r.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};
