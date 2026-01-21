import { useState } from "react";
import { postJob } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import CityInput from "../components/CityInput";
import Confetti from "../components/Confetti";
import GigVideoUpload from "../components/GigVideoUpload";

export default function PostJob() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    city: "",
    payment: "",
    deadline: "Today",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCityValid, setIsCityValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdGigId, setCreatedGigId] = useState(null);
  const [gigVideoUrl, setGigVideoUrl] = useState(null);
  const [showVideoStep, setShowVideoStep] = useState(false);

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
          You must be logged in to post a job.
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

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (!isCityValid) {
      setError("Please select a city from the suggestions");
      return;
    }

    setLoading(true);

    try {
      const result = await postJob({
        title: form.title,
        city: form.city,
        payment: Number(form.payment),
        deadline: form.deadline,
      });

      // Store the created gig ID and show video step
      if (result && result.id) {
        setCreatedGigId(result.id);
        setShowVideoStep(true);
      } else {
        // If no ID returned, just show success and redirect
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/manage");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleVideoChange(url) {
    setGigVideoUrl(url);
  }

  function handleSkipVideo() {
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/manage");
    }, 2000);
  }

  function handleFinish() {
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/manage");
    }, 2000);
  }

  return (
    <div className="animate-fadeIn">
      <Confetti active={showSuccess} />

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-vibrant rounded-3xl p-8 text-center animate-success-pop max-w-sm mx-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Job Posted!</h3>
            <p className="text-gray-500">Redirecting to manage jobs...</p>
          </div>
        </div>
      )}

      {showVideoStep ? (
        /* Video Upload Step */
        <>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  Job Created!
                </h2>
                <p className="text-white/70 text-sm">
                  Now add a video to get more applications
                </p>
              </div>
            </div>
          </div>

          <div className="glass-vibrant rounded-3xl p-6">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-1">{form.title}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {form.city}
                </span>
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                  ₹{form.payment}
                </span>
              </div>
            </div>

            <GigVideoUpload
              gigId={createdGigId}
              videoUrl={gigVideoUrl}
              onVideoChange={handleVideoChange}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSkipVideo}
                className="flex-1 btn-secondary py-3 px-4"
              >
                Skip for now
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 btn-primary py-3 px-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {gigVideoUrl ? "Finish" : "Done"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Job Form Step */
        <>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              Post a Job
            </h2>
            <p className="text-white/70 mt-1">
              Find workers for your urgent tasks
            </p>
          </div>

          <div className="glass-vibrant rounded-3xl p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl animate-shake flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="e.g., Help moving furniture"
                  required
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <CityInput
                  value={form.city}
                  onChange={(val, isValid) => {
                    setForm({ ...form, city: val });
                    setIsCityValid(isValid);
                  }}
                  onValidSelection={setIsCityValid}
                  placeholder="e.g., Mumbai"
                />
                {form.city && !isCityValid && (
                  <p className="text-xs text-amber-600 mt-1 ml-1">
                    Please select a city from the suggestions
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                    ₹
                  </div>
                  <input
                    name="payment"
                    type="number"
                    value={form.payment}
                    onChange={updateField}
                    placeholder="500"
                    required
                    min="1"
                    className="input-modern pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, deadline: "Today" })}
                    className={`py-3.5 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      form.deadline === "Today"
                        ? "btn-primary"
                        : "bg-white/50 text-gray-600 hover:bg-white/80 border border-white/50"
                    }`}
                  >
                    <span className={form.deadline === "Today" ? "relative z-10 flex items-center gap-2" : "flex items-center gap-2"}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Today
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, deadline: "Tomorrow" })}
                    className={`py-3.5 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      form.deadline === "Tomorrow"
                        ? "btn-primary"
                        : "bg-white/50 text-gray-600 hover:bg-white/80 border border-white/50"
                    }`}
                  >
                    <span className={form.deadline === "Tomorrow" ? "relative z-10 flex items-center gap-2" : "flex items-center gap-2"}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tomorrow
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Posting Job...
                    </>
                  ) : (
                    <>
                      Post Job
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-6 glass-vibrant rounded-3xl p-5 border-l-4 border-violet-500">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Tips for a Great Job Post
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">✓</span>
                Be specific about what the job involves
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">✓</span>
                Offer competitive payment for faster responses
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">✓</span>
                Jobs expire after 24-48 hours based on deadline
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">✓</span>
                Add a video to get 3x more applications!
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
