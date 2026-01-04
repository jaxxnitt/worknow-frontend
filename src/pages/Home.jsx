import { useEffect, useState } from "react";
import { applyJob } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import CityInput from "../components/CityInput";

const API = "https://worknow-backend.onrender.com";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [city, setCity] = useState("");
  const [isCityValid, setIsCityValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
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

  async function apply(gigId) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setApplyingId(gigId);
    try {
      const note = prompt("Why are you a good fit? (optional)") || "";
      const msg = await applyJob(gigId, note);
      alert(msg);
      fetchJobs(city);
    } catch (err) {
      alert(err.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* SEARCH */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
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
            className="bg-gradient-to-r from-gray-800 to-black text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            <p className="text-gray-500">Finding jobs...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20 animate-fadeIn">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Jobs Found
          </h3>
          <p className="text-gray-500">
            {city
              ? `No jobs available in "${city}". Try a different city.`
              : "No jobs available at the moment. Check back soon!"}
          </p>
        </div>
      )}

      {/* Job Cards */}
      {jobs.map((job, index) => (
        <div
          key={job.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/20 hover:shadow-xl transition-all duration-300 animate-slideUp group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-bold text-lg text-gray-800 group-hover:text-gray-900 transition-colors">
              {job.title}
            </h2>
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              ₹{job.payment}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job.city}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {job.deadline}
            </span>
          </div>

          {/* Application Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Applications</span>
              <span
                className={`font-medium ${
                  job.applicationCount >= 10
                    ? "text-red-500"
                    : "text-gray-700"
                }`}
              >
                {job.applicationCount}/10
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  job.applicationCount >= 10
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : job.applicationCount >= 7
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                    : "bg-gradient-to-r from-blue-400 to-blue-600"
                }`}
                style={{
                  width: `${Math.min(job.applicationCount * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={() => apply(job.id)}
            disabled={job.applicationCount >= 10 || applyingId === job.id}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
              job.applicationCount >= 10
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : applyingId === job.id
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {job.applicationCount >= 10 ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Closed
              </span>
            ) : applyingId === job.id ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                >
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
                Applying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Apply Now
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
