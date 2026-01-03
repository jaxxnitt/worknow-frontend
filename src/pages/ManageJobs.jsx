import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyJobs,
  getCurrentApplicant,
  hireApplicant,
  rejectApplicant,
} from "../api/client";

export default function ManageJobs() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

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
      // No current applicant or error
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

  if (!isLoggedIn) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
        <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Login Required
        </h2>
        <p className="text-gray-600 mb-5">
          Please log in to manage your posted jobs.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-gradient-to-r from-gray-800 to-black text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Manage My Jobs
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.name || "Employer"}
          </p>
        </div>
        <button
          onClick={loadJobs}
          disabled={loading}
          className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-gray-600 hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-200"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Refreshing...
            </span>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
          {error}
        </div>
      )}

      {loading && jobs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            <p className="text-gray-500">Loading your jobs...</p>
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Jobs Posted Yet
          </h3>
          <p className="text-gray-500 mb-5">
            Start by posting your first job to find workers.
          </p>
          <button
            onClick={() => navigate("/post")}
            className="bg-gradient-to-r from-gray-800 to-black text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            + Post a Job
          </button>
        </div>
      )}

      {jobs.map((job, index) => (
        <div
          key={job.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/20 hover:shadow-xl transition-all duration-300 animate-slideUp"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                ₹{job.payment} · {job.city}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                job.active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {job.active ? "Active" : "Closed"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.applicationCount} applicants
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.deadline}
            </span>
          </div>

          <button
            onClick={() => loadApplicant(job.id)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all duration-200"
          >
            View Current Applicant
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {job.currentApp && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
              {job.currentApp.error ? (
                <p className="text-gray-500 text-sm italic">
                  {job.currentApp.error}
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {job.currentApp.applicantName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {job.currentApp.applicantName}
                      </p>
                      <p className="text-xs text-gray-500">Applicant</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-gray-600">
                      {job.currentApp.note || "No message provided"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleAction(job.currentApp.id, "hire")
                      }
                      disabled={actionLoading === job.currentApp.id}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                      {actionLoading === job.currentApp.id
                        ? "Processing..."
                        : "Hire"}
                    </button>

                    <button
                      onClick={() =>
                        handleAction(job.currentApp.id, "reject")
                      }
                      disabled={actionLoading === job.currentApp.id}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
