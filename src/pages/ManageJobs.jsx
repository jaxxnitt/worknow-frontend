import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyJobs,
  getCurrentApplicant,
  hireApplicant,
  rejectApplicant,
} from "../api/client";
import Confetti from "../components/Confetti";
import GigVideoUpload from "../components/GigVideoUpload";

export default function ManageJobs() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showHireSuccess, setShowHireSuccess] = useState(false);
  const [editingVideoForJob, setEditingVideoForJob] = useState(null);
  const [expandedVideos, setExpandedVideos] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      loadJobs();
    }
  }, [isLoggedIn]);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicant(gigId) {
    try {
      const app = await getCurrentApplicant(gigId);
      setJobs((jobs) =>
        jobs.map((j) =>
          j.id === gigId ? { ...j, currentApp: app } : j
        )
      );
    } catch (err) {
      setJobs((jobs) =>
        jobs.map((j) =>
          j.id === gigId
            ? { ...j, currentApp: { error: "No pending applicants" } }
            : j
        )
      );
    }
  }

  async function handleAction(applicationId, type) {
    setActionLoading(applicationId);
    try {
      if (type === "hire") {
        await hireApplicant(applicationId);
        setShowHireSuccess(true);
        setTimeout(() => setShowHireSuccess(false), 3000);
      } else {
        await rejectApplicant(applicationId);
      }
      await loadJobs();
    } catch (err) {
      alert(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  function toggleVideoExpand(jobId) {
    setExpandedVideos(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  }

  function handleVideoChange(jobId, newUrl) {
    setJobs(jobs =>
      jobs.map(j => j.id === jobId ? { ...j, videoUrl: newUrl } : j)
    );
    setEditingVideoForJob(null);
  }

  if (!isLoggedIn) {
    return (
      <div className="glass-vibrant p-8 rounded-3xl text-center animate-fadeIn">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-4xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Login Required
        </h2>
        <p className="text-gray-500 mb-6">
          Please log in to manage your posted jobs.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="btn-primary px-8 py-3 text-lg"
        >
          <span className="relative z-10">Go to Login</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <Confetti active={showHireSuccess} />

      {/* Success Toast */}
      {showHireSuccess && (
        <div className="toast toast-success animate-slideUp">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-gray-800">Worker hired successfully!</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Manage Jobs
          </h2>
          <p className="text-white/70 mt-1">
            Welcome back, {user?.name?.split(' ')[0] || "Employer"}
          </p>
        </div>
        <button
          onClick={loadJobs}
          disabled={loading}
          className="btn-secondary px-4 py-2 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl animate-shake flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading && jobs.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 font-medium">Loading your jobs...</p>
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="glass-vibrant rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Jobs Posted Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by posting your first job to find workers.
          </p>
          <button
            onClick={() => navigate("/post")}
            className="btn-primary px-8 py-3 text-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Post Your First Job
            </span>
          </button>
        </div>
      )}

      {jobs.map((job, index) => (
        <div
          key={job.id}
          className="glass-vibrant rounded-3xl p-5 card-hover animate-slideUp"
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {job.title}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                  ₹{job.payment}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {job.city}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              job.active
                ? "badge-success"
                : "bg-gray-200 text-gray-600"
            }`}>
              {job.active ? "Active" : "Closed"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 bg-white/30 rounded-xl p-3">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-gray-700">{job.applicationCount}</span> applicants
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.deadline}
            </span>
            {job.videoUrl && (
              <span className="flex items-center gap-1.5 text-violet-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Has Video</span>
              </span>
            )}
          </div>

          {/* Job Video Section */}
          {editingVideoForJob === job.id ? (
            <div className="mb-4 p-4 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Manage Job Video
                </h4>
                <button
                  onClick={() => setEditingVideoForJob(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <GigVideoUpload
                gigId={job.id}
                videoUrl={job.videoUrl}
                onVideoChange={(url) => handleVideoChange(job.id, url)}
              />
            </div>
          ) : job.videoUrl ? (
            <div className="mb-4">
              {expandedVideos[job.id] ? (
                <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
                  <video
                    src={job.videoUrl}
                    controls
                    className="w-full aspect-video object-contain"
                    playsInline
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => toggleVideoExpand(job.id)}
                      className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingVideoForJob(job.id)}
                    className="absolute bottom-2 right-2 bg-white/90 text-violet-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleVideoExpand(job.id)}
                  className="w-full bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl p-3 flex items-center justify-between hover:from-violet-200 hover:to-pink-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-violet-700">View Job Video</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingVideoForJob(job.id);
                    }}
                    className="text-violet-500 hover:text-violet-700 p-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingVideoForJob(job.id)}
              className="w-full mb-4 bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-dashed border-violet-200 rounded-xl p-3 flex items-center justify-center gap-2 hover:border-violet-400 hover:from-violet-100 hover:to-pink-100 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-violet-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-violet-500 group-hover:text-violet-600">Add Job Video</span>
            </button>
          )}

          <button
            onClick={() => loadApplicant(job.id)}
            className="text-violet-600 hover:text-violet-700 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all duration-200 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Current Applicant
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {job.currentApp && (
            <div className="pt-4 border-t border-gray-200/50 animate-fadeIn">
              {job.currentApp.error ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-gray-500 text-sm italic flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    {job.currentApp.error}
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      {job.currentApp.applicantName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {job.currentApp.applicantName}
                      </p>
                      <p className="text-xs text-violet-600">Applicant</p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-xl p-3 mb-4">
                    <p className="text-sm text-gray-600">
                      {job.currentApp.note || "No message provided"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(job.currentApp.id, "hire")}
                      disabled={actionLoading === job.currentApp.id}
                      className="flex-1 btn-success py-3 px-4 disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {actionLoading === job.currentApp.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Hire
                          </>
                        )}
                      </span>
                    </button>

                    <button
                      onClick={() => handleAction(job.currentApp.id, "reject")}
                      disabled={actionLoading === job.currentApp.id}
                      className="flex-1 btn-danger py-3 px-4 disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
