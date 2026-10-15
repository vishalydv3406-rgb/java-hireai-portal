import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi, applicationsApi, resumesApi } from '../services/api';
import { Job, Resume } from '../types';
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock, CheckCircle2, AlertCircle, Sparkles, Filter, X } from 'lucide-react';

export const JobsPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isCandidate } = useAuth();

  // Search & Filter state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [remoteType, setRemoteType] = useState<string>(searchParams.get('remote') || '');
  const [employmentType, setEmploymentType] = useState<string>(searchParams.get('type') || '');

  // Data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Apply modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (remoteType) params.remoteType = remoteType;
      if (employmentType) params.employmentType = employmentType;

      const data = await jobsApi.search(params);
      setJobs(data.content || []);
      if (data.content && data.content.length > 0 && !selectedJob) {
        setSelectedJob(data.content[0]);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    if (remoteType) params.set('remote', remoteType);
    if (employmentType) params.set('type', employmentType);
    setSearchParams(params);
  };

  const handleOpenApply = async (job: Job) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!isCandidate) {
      alert('Only candidates can submit job applications. Please log in with a candidate account.');
      return;
    }

    setSelectedJob(job);
    setApplyError(null);
    setApplySuccess(false);
    setIsApplyModalOpen(true);

    try {
      const myResumes = await resumesApi.getMyResumes();
      setResumes(myResumes);
      const primary = myResumes.find((r) => r.isPrimary);
      if (primary) {
        setSelectedResumeId(primary.id);
      } else if (myResumes.length > 0) {
        setSelectedResumeId(myResumes[0].id);
      }
    } catch (err) {
      console.error('Failed to load candidate resumes:', err);
    }
  };

  const handleConfirmApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplyLoading(true);
    setApplyError(null);

    try {
      await applicationsApi.apply({
        jobId: selectedJob.id,
        resumeId: selectedResumeId || undefined,
        coverLetter: coverLetter || undefined,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess(false);
        setCoverLetter('');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application';
      setApplyError(msg);
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* ── Search & Filter Bar ───────────────────────────────── */}
      <form onSubmit={handleFilterSubmit} className="p-4 rounded-2xl glass-panel mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Search className="w-4 h-4 text-teal-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Title, skills, company..."
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <MapPin className="w-4 h-4 text-teal-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <select
              value={remoteType}
              onChange={(e) => setRemoteType(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none w-full"
            >
              <option value="" className="bg-slate-900">All Work Modes</option>
              <option value="REMOTE" className="bg-slate-900">Remote Only</option>
              <option value="HYBRID" className="bg-slate-900">Hybrid</option>
              <option value="ONSITE" className="bg-slate-900">On-site</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none"
            >
              <option value="" className="bg-slate-900">All Types</option>
              <option value="FULL_TIME" className="bg-slate-900">Full-Time</option>
              <option value="CONTRACT" className="bg-slate-900">Contract</option>
              <option value="INTERNSHIP" className="bg-slate-900">Internship</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-colors shadow-md shadow-teal-500/20"
            >
              Filter
            </button>
          </div>

        </div>
      </form>

      {/* ── Main Layout: Job List & Detail ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span>Showing {jobs.length} open position{jobs.length === 1 ? '' : 's'}</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-32 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800/50"></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-panel">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">No positions found</h4>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or keyword filters.</p>
            </div>
          ) : (
            jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500/50 shadow-lg shadow-teal-500/10'
                      : 'glass-card border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-heading font-semibold text-white hover:text-teal-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-400" />
                        {job.company?.name || 'Top Tech Employer'}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {job.remoteType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location || 'Remote'}
                    </span>
                    {job.salaryMin && (
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax ? job.salaryMax / 1000 : 0).toFixed(0)}k
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500 ml-auto text-[11px]">
                      <Clock className="w-3 h-3" />
                      {job.applicationsCount} applicants
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Job Detail Panel */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="p-6 sm:p-8 rounded-2xl glass-panel sticky top-20 border border-slate-800">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-white mb-1">
                    {selectedJob.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="text-teal-400 font-semibold">{selectedJob.company?.name}</span>
                    <span>•</span>
                    <span>{selectedJob.location || 'Remote'}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedJob.employmentType}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApply(selectedJob)}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply With AI
                </button>
              </div>

              {/* Job Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Compensation</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedJob.salaryMin
                      ? `$${(selectedJob.salaryMin / 1000).toFixed(0)}k - $${(selectedJob.salaryMax ? selectedJob.salaryMax / 1000 : 0).toFixed(0)}k`
                      : 'Competitive'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Experience</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedJob.minExperienceYears ? `${selectedJob.minExperienceYears}+ Years` : 'Any Experience'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Work Location</span>
                  <span className="text-xs font-semibold text-teal-400">
                    {selectedJob.remoteType}
                  </span>
                </div>
              </div>

              {/* Description & Responsibilities */}
              <div className="space-y-6 text-sm text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto pr-2">
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Role Overview</h4>
                  <p className="whitespace-pre-line text-xs sm:text-sm text-slate-400">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.responsibilities && (
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Key Responsibilities</h4>
                    <p className="whitespace-pre-line text-xs sm:text-sm text-slate-400">
                      {selectedJob.responsibilities}
                    </p>
                  </div>
                )}

                {selectedJob.requirements && (
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Technical Qualifications</h4>
                    <p className="whitespace-pre-line text-xs sm:text-sm text-slate-400">
                      {selectedJob.requirements}
                    </p>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Benefits & Perks</h4>
                    <p className="whitespace-pre-line text-xs sm:text-sm text-slate-400">
                      {selectedJob.benefits}
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-2xl glass-panel text-center text-slate-500 text-sm">
              Select a job from the list to preview full details.
            </div>
          )}
        </div>

      </div>

      {/* ── 1-Click Application Modal ──────────────────────────── */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Application Submission</span>
              <h3 className="text-xl font-heading font-bold text-white mt-1">
                Apply for {selectedJob.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedJob.company?.name}</p>
            </div>

            {applySuccess ? (
              <div className="p-6 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
                <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Our AI engine calculated your match score and forwarded your profile to the hiring team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmApply} className="space-y-4">
                {applyError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Select Resume</label>
                  {resumes.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                      No uploaded resumes found. You can submit now and add a resume from your candidate portal.
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.originalFilename} {r.isPrimary ? '(Primary)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Note / Cover Letter (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly introduce your relevant experience or project achievements..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="flex-1 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {applyLoading ? 'Evaluating with AI...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
