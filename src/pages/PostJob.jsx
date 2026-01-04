import { useState } from "react";
import { postJob } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import CityInput from "../components/CityInput";

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

  if (!isLoggedIn) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 animate-fadeIn">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Login Required
          </h2>
          <p className="text-gray-500 mb-6">
            You must be logged in to post a job.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-gray-800 to-black text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
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
      await postJob({
        title: form.title,
        city: form.city,
        payment: Number(form.payment),
        deadline: form.deadline,
      });

      setForm({
        title: "",
        city: "",
        payment: "",
        deadline: "Today",
      });
      setIsCityValid(false);

      alert("Job posted successfully!");
      navigate("/manage");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Post a Job
        </h2>
        <p className="text-gray-500 mt-1">
          Find workers for your urgent tasks
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g., Help moving furniture"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-400 transition-all duration-200 bg-white/80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment (₹)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
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
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-400 transition-all duration-200 bg-white/80"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, deadline: "Today" })}
                className={`py-3 rounded-xl font-medium transition-all duration-200 ${
                  form.deadline === "Today"
                    ? "bg-gradient-to-r from-gray-800 to-black text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Today
                </span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, deadline: "Tomorrow" })}
                className={`py-3 rounded-xl font-medium transition-all duration-200 ${
                  form.deadline === "Tomorrow"
                    ? "bg-gradient-to-r from-gray-800 to-black text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Tomorrow
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                Posting Job...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Post Job
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Tips for a Great Job Post
        </h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            Be specific about what the job involves
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            Offer competitive payment for faster responses
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            Jobs expire after 24-48 hours based on deadline
          </li>
        </ul>
      </div>
    </div>
  );
}
