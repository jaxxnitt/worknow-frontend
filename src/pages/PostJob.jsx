import { useState } from "react";
import { postJob } from "../client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    city: "",
    pay: "",
    deadline: "Today",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect unauthenticated users
  if (!isLoggedIn) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">
          Login required
        </h2>
        <p className="text-gray-600 mb-4">
          You must be logged in to post a job.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Go to Login
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
    setLoading(true);

    try {
      await postJob(form);

      // Reset form on success
      setForm({
        title: "",
        city: "",
        pay: "",
        deadline: "Today",
        description: "",
      });

      alert("Job posted successfully");
      navigate("/manage");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to post job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Post a Job
      </h2>

      {error && (
        <div className="mb-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={updateField}
          placeholder="Job title"
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          name="city"
          value={form.city}
          onChange={updateField}
          placeholder="City"
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          name="pay"
          value={form.pay}
          onChange={updateField}
          placeholder="Pay (e.g. ₹500/day)"
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <select
          name="deadline"
          value={form.deadline}
          onChange={updateField}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="Today">Today</option>
          <option value="Tomorrow">Tomorrow</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="Job description"
          rows={4}
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
