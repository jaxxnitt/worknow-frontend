import { useEffect, useState, useRef } from "react";
import { applyJob } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import CityInput from "../components/CityInput";
import Confetti from "../components/Confetti";

const API = "https://worknow-backend-production.up.railway.app";

function ApplyModal({ job, onClose, onApply, isApplying }) {
  const [note, setNote] = useState("");
  const [showModalVideo, setShowModalVideo] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-vibrant rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            💼
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>📍 {job.city}</span>
              <span>•</span>
              <span className="text-green-600 font-semibold">₹{job.payment}</span>
            </p>
          </div>
        </div>

        {/* Job Video in Modal */}
        {job.videoUrl && (
          <div className="mb-4">
            {showModalVideo ? (
              <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
                <video
                  src={job.videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video object-contain"
                  playsInline
                />
                <button
                  onClick={() => setShowModalVideo(false)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModalVideo(true)}
                className="w-full bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl p-3 flex items-center justify-center gap-2 hover:from-violet-200 hover:to-pink-200 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-violet-700">Watch Job Video</span>
              </button>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why should they hire you? (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="I'm a perfect fit because..."
            rows={3}
            className="input-modern resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary py-3 px-4"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(note)}
            disabled={isApplying}
            className="flex-1 btn-primary py-3 px-4"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isApplying ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Applying...
                </>
              ) : (
                <>
                  Apply Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, index, onApply, isApplying, isLoggedIn }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const cardRef = useRef(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const delta = e.touches[0].clientX - touchStart;
    setTouchDelta(Math.max(-100, Math.min(100, delta)));
  };

  const handleTouchEnd = () => {
    if (touchDelta > 80 && job.applicationCount < 10) {
      onApply(job);
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  const urgencyLevel = job.applicationCount >= 8 ? "high" : job.applicationCount >= 5 ? "medium" : "low";

  return (
    <div
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="glass-vibrant rounded-3xl p-5 card-hover animate-slideUp relative overflow-hidden"
      style={{
        animationDelay: `${index * 0.08}s`,
        transform: `translateX(${touchDelta}px) rotate(${touchDelta * 0.05}deg)`,
        transition: touchStart ? "none" : "transform 0.3s ease-out",
      }}
    >
      {/* Swipe hint overlay */}
      {touchDelta > 40 && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-500/30 rounded-3xl flex items-center justify-end pr-6">
          <div className="text-green-600 font-bold flex items-center gap-2">
            <span>Apply</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Urgency Badge */}
      {urgencyLevel === "high" && (
        <div className="absolute top-3 right-3 badge-warning animate-pulse-soft">
          🔥 Filling Fast
        </div>
      )}

      {/* Video Badge - show only if not showing urgency badge */}
      {job.videoUrl && urgencyLevel !== "high" && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Video
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <h2 className="font-bold text-lg text-gray-800 group-hover:text-gray-900 transition-colors pr-20">
          {job.title}
        </h2>
      </div>

      {/* Job Video */}
      {job.videoUrl && (
        <div className="mb-4">
          {showVideo ? (
            <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
              <video
                src={job.videoUrl}
                controls
                className="w-full aspect-video object-contain"
                playsInline
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideo(false);
                }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(true);
              }}
              className="w-full bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl p-3 flex items-center justify-center gap-2 hover:from-violet-200 hover:to-pink-200 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-violet-700">Watch Job Video</span>
            </button>
          )}
        </div>
      )}

      {/* Payment Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl text-lg font-bold shadow-lg">
          <span>₹</span>
          <span>{job.payment}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.city}
          </span>
          <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.deadline}
          </span>
        </div>
      </div>

      {/* Application Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Applications
          </span>
          <span className={`font-bold ${
            job.applicationCount >= 10
              ? "text-red-500"
              : job.applicationCount >= 7
              ? "text-orange-500"
              : "text-violet-600"
          }`}>
            {job.applicationCount}/10
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(job.applicationCount * 10, 100)}%` }}
          />
        </div>
        {job.applicationCount >= 7 && job.applicationCount < 10 && (
          <p className="text-xs text-orange-500 mt-1 animate-pulse">
            Only {10 - job.applicationCount} spots left!
          </p>
        )}
      </div>

      {/* Apply Button */}
      <button
        onClick={() => onApply(job)}
        disabled={job.applicationCount >= 10 || isApplying}
        className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
          job.applicationCount >= 10
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : isApplying
            ? "bg-violet-400 text-white cursor-wait"
            : "btn-primary"
        }`}
      >
        {job.applicationCount >= 10 ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Applications Closed
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoggedIn ? "Apply Now" : "Login to Apply"}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </button>

      {/* Swipe hint for mobile */}
      <p className="text-xs text-gray-400 text-center mt-3 sm:hidden">
        Swipe right to apply quickly →
      </p>
    </div>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [city, setCity] = useState("");
  const [isCityValid, setIsCityValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  function fetchJobs(cityFilter) {
    setLoading(true);

    const url = cityFilter
      ? `${API}/gigs?city=${encodeURIComponent(cityFilter)}`
      : `${API}/gigs`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setJobs(data))
      .finally(() => setLoading(false));
  }

  function handleApplyClick(job) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setSelectedJob(job);
  }

  async function handleApply(note) {
    if (!selectedJob) return;

    setApplyingId(selectedJob.id);
    try {
      await applyJob(selectedJob.id, note);

      // Show success animation
      setShowConfetti(true);
      setSuccessMessage("Application submitted!");
      setSelectedJob(null);

      // Refresh jobs
      fetchJobs(city);

      // Hide success after delay
      setTimeout(() => {
        setShowConfetti(false);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      alert(err.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      <Confetti active={showConfetti} />

      {/* Success Toast */}
      {successMessage && (
        <div className="toast toast-success animate-slideUp">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-gray-800">{successMessage}</span>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplying={applyingId === selectedJob.id}
        />
      )}

      {/* SEARCH */}
      <div className="glass-vibrant rounded-3xl p-4 shadow-xl">
        <div className="flex gap-3 relative">
          <div className="flex-1">
            <CityInput
              value={city}
              onChange={(val, isValid) => {
                setCity(val);
                setIsCityValid(isValid);
                if (isValid) {
                  fetchJobs(val);
                }
              }}
              onValidSelection={setIsCityValid}
              placeholder="Search by city..."
            />
            {city && !isCityValid && (
              <p className="text-xs text-amber-600 mt-1 ml-1">
                Please select a city from the suggestions
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (!city) {
                fetchJobs();
              } else if (isCityValid) {
                fetchJobs(city);
              } else {
                alert("Please select a city from the suggestions");
              }
            }}
            className="btn-primary px-6 py-3 flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && jobs.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-white/70 text-sm">
            <span className="font-bold text-white">{jobs.length}</span> jobs available
            {city && <span> in {city}</span>}
          </p>
          <button
            onClick={() => {
              setCity("");
              setIsCityValid(false);
              fetchJobs();
            }}
            className="text-white/70 text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 font-medium">Finding jobs...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="glass-vibrant rounded-3xl p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🔍</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Jobs Found
          </h3>
          <p className="text-gray-500 mb-4">
            {city
              ? `No jobs available in "${city}". Try a different city.`
              : "No jobs available at the moment. Check back soon!"}
          </p>
          {city && (
            <button
              onClick={() => {
                setCity("");
                setIsCityValid(false);
                fetchJobs();
              }}
              className="btn-secondary px-6 py-2"
            >
              View All Jobs
            </button>
          )}
        </div>
      )}

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
            onApply={handleApplyClick}
            isApplying={applyingId === job.id}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </div>
  );
}
