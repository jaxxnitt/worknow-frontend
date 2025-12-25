import { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";
import Login from "./pages/Login";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  /*
   * Persist mode across refreshes.
   * Default to "worker" if nothing is stored.
   */
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || "worker";
  });

  /*
   * Auth state from context
   */
  const { user, logout, loading } = useAuth();

  /*
   * Helper to switch mode and persist it.
   */
  function switchMode(newMode) {
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  }

  /*
   * Avoid rendering app before auth state is known
   */
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div
      className={`min-h-screen ${
        mode === "employer" ? "bg-gray-200" : "bg-gray-100"
      }`}
    >
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">WorkNow</h1>
            <p className="text-xs text-gray-500">
              Mode:{" "}
              <span className="font-semibold capitalize">
                {mode}
              </span>
            </p>
          </div>

          {/* RIGHT SIDE CONTROLS */}
          <div className="flex items-center gap-4">
            {/* MODE SWITCH */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => switchMode("worker")}
                className={`px-3 py-1 rounded-md text-sm ${
                  mode === "worker"
                    ? "bg-white shadow font-semibold"
                    : "text-gray-500"
                }`}
              >
                Worker
              </button>

              <button
                onClick={() => switchMode("employer")}
                className={`px-3 py-1 rounded-md text-sm ${
                  mode === "employer"
                    ? "bg-white shadow font-semibold"
                    : "text-gray-500"
                }`}
              >
                Employer
              </button>
            </div>

            {/* NAVIGATION */}
            {mode === "worker" && (
              <Link
                to="/"
                className="text-gray-700 hover:text-black"
              >
                Find Work
              </Link>
            )}

            {mode === "employer" && user && (
              <>
                <Link
                  to="/manage"
                  className="text-gray-700 hover:text-black"
                >
                  Manage Jobs
                </Link>

                <Link
                  to="/post"
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  + Post Job
                </Link>
              </>
            )}

            {/* AUTH ACTION */}
            {!user ? (
              <Link
                to="/login"
                className="text-gray-700 hover:text-black"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={logout}
                className="text-gray-700 hover:text-black"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />

          {/* WORKER MODE */}
          {mode === "worker" && (
            <Route
              path="/"
              element={
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Available Jobs
                  </h2>
                  <Home />
                </>
              }
            />
          )}

          {/* EMPLOYER MODE (PROTECTED) */}
          {mode === "employer" && user && (
            <>
              <Route path="/post" element={<PostJob />} />
              <Route path="/manage" element={<ManageJobs />} />
            </>
          )}

          {/* EMPLOYER MODE BUT NOT LOGGED IN */}
          {mode === "employer" && !user && (
            <Route
              path="*"
              element={
                <p className="text-gray-600">
                  Please log in as an employer to post or manage jobs.
                </p>
              }
            />
          )}

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
