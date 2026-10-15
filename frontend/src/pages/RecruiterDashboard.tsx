import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsApi, applicationsApi } from '../services/api';
import { Job, Application, ApplicationStatus } from '../types';
import { Briefcase, PlusCircle, Users, CheckCircle, XCircle, Clock, Sparkles, X, AlertCircle } from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected job for reviewing applicants
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Post Job modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(searchParams.get('action') === 'post');
  const [postTitle, setPostTitle] = useState('');
  const [postLocation, setPostLocation] = useState('Remote');
  const [postRemoteType, setPostRemoteType] = useState<'REMOTE' | 'HYBRID' | 'ONSITE'>('REMOTE');
  const [postEmploymentType, setPostEmploymentType] = useState<'FULL_TIME' | 'CONTRACT' | 'INTERNSHIP'>('FULL_TIME');
  const [postSalaryMin, setPostSalaryMin] = useState(120000);
  const [postSalaryMax, setPostSalaryMax] = useState(160000);
  const [postExperience, setPostExperience] = useState(3);
  const [postDescription, setPostDescription] = useState('');
  const [postRequirements, setPostRequirements] = useState('');
  const [postResponsibilities, setPostResponsibilities] = useState('');
  const [postingLoading, setPostingLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsApi.getMyJobs();
      setJobs(data.content || []);
      if (data.content && data.content.length > 0 && !selectedJob) {
        handleSelectJob(data.content[0]);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleSelectJob = async (job: Job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const data = await applicationsApi.getRecruiterApplications({ jobId: job.id });
      setApplications(data.content || []);
    } catch (err) {
      console.error('Failed to load applications for job:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await jobsApi.changeStatus(job.id, newStatus);
      await fetchMyJobs();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, status: ApplicationStatus) => {
    try {
      await applicationsApi.updateStatus(appId, { status });
      if (selectedJob) {
        handleSelectJob(selectedJob);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update applicant status');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingLoading(true);
    setPostError(null);

    try {
      await jobsApi.create({
        title: postTitle,
        description: postDescription,
        requirements: postRequirements,
        responsibilities: postResponsibilities,
        location: postLocation,
        remoteType: postRemoteType,
        employmentType: postEmploymentType,
        salaryMin: postSalaryMin,
        salaryMax: postSalaryMax,
        minExperienceYears: postExperience,
      });
      setIsPostModalOpen(false);
      setPostTitle('');
      setPostDescription('');
      setPostRequirements('');
      setPostResponsibilities('');
      await fetchMyJobs();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create job';
      setPostError(msg);
    } finally {
      setPostingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ── Recruiter Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">Recruiter Workspace</span>
          <h1 className="text-2xl font-heading font-bold text-white mt-0.5">
            Active Job Requisitions & Talent Pipeline
          </h1>
          <p className="text-xs text-slate-400">Manage posted openings and review AI match candidate scores</p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Job Opening
        </button>
      </div>

      {/* ── Main Layout: Jobs and Applicant Review ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: My Jobs */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Posted Roles ({jobs.length})</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading requisitions...</div>
          ) : jobs.length === 0 ? (
            <div className="p-10 text-center rounded-2xl glass-panel text-slate-400 text-xs">
              No jobs posted yet. Click "Create New Job Opening" to get started.
            </div>
          ) : (
            jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500/50 shadow-lg shadow-teal-500/10'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                      <p className="text-[11px] text-slate-400">{job.location} • {job.remoteType}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-teal-400">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicationsCount} Candidates
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleJobStatus(job);
                      }}
                      className="text-[11px] hover:text-white underline"
                    >
                      {job.status === 'PUBLISHED' ? 'Close Opening' : 'Publish'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Applicant Pipeline for Selected Job */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="p-6 rounded-2xl glass-panel space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold">Reviewing Applicants</span>
                  <h3 className="text-lg font-heading font-bold text-white">{selectedJob.title}</h3>
                </div>
                <span className="text-xs text-slate-400">{applications.length} submitted</span>
              </div>

              {appsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading applicants...</div>
              ) : applications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No candidate applications received yet for this position.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{app.candidateName}</h4>
                          <p className="text-xs text-slate-400">{app.candidateEmail}</p>
                          {app.resumeFilename && (
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Attached CV: {app.resumeFilename}
                            </span>
                          )}
                        </div>

                        {app.matchScore && (
                          <div className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            {app.matchScore}% Match
                          </div>
                        )}
                      </div>

                      {/* State transition workflow actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400 text-[11px]">
                          Current: <strong className="text-white">{app.status}</strong>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {app.status === 'APPLIED' && (
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'UNDER_REVIEW')}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                            >
                              Review
                            </button>
                          )}
                          {app.status === 'UNDER_REVIEW' && (
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'SHORTLISTED')}
                              className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-semibold"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status === 'SHORTLISTED' && (
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'INTERVIEW_SCHEDULED')}
                              className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-semibold"
                            >
                              Schedule Interview
                            </button>
                          )}
                          {app.status === 'INTERVIEW_SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'OFFERED')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold"
                            >
                              Extend Offer
                            </button>
                          )}
                          {app.status !== 'REJECTED' && app.status !== 'OFFERED' && (
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded hover:bg-red-500/20 text-red-400 text-[11px]"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl glass-panel text-slate-500 text-xs">
              Select a job requisition on the left to inspect applicants.
            </div>
          )}
        </div>

      </div>

      {/* ── Post Job Modal ────────────────────────────────────── */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">New Position</span>
              <h3 className="text-xl font-heading font-bold text-white mt-0.5">Post a Job Opening</h3>
              <p className="text-xs text-slate-400">Publish your opening directly to HireAI's semantic search database.</p>
            </div>

            {postError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{postError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Senior Java Architect"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Work Mode</label>
                  <select
                    value={postRemoteType}
                    onChange={(e) => setPostRemoteType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={postSalaryMin}
                    onChange={(e) => setPostSalaryMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={postSalaryMax}
                    onChange={(e) => setPostSalaryMax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Detail the mission and scope of the role..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Requirements & Qualifications</label>
                <textarea
                  rows={3}
                  value={postRequirements}
                  onChange={(e) => setPostRequirements(e.target.value)}
                  placeholder="Java 21, Spring Boot 3, PostgreSQL, Docker..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {postingLoading ? 'Publishing...' : 'Publish Job Opening'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
