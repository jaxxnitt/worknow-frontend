import { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || "worker";
  });

  const { user, logout, loading } = useAuth();

  function switchMode(newMode) {
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <span className="text-xl">💼</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                WorkNow
              </h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">
                {mode === "worker" ? "Find work fast" : "Hire workers fast"}
              </p>
            </div>
          </Link>

          {/* RIGHT SIDE CONTROLS */}
          <div className="flex items-center gap-3">
            {/* MODE SWITCH */}
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => switchMode("worker")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === "worker"
                    ? "bg-white shadow-md text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Worker
              </button>

              <button
                onClick={() => switchMode("employer")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === "employer"
                    ? "bg-white shadow-md text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Employer
              </button>
            </div>

            {/* NAVIGATION */}
            {mode === "worker" && (
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors hidden sm:block"
              >
                Find Work
              </Link>
            )}

            {mode === "employer" && user && (
              <>
                <Link
                  to="/manage"
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors hidden sm:block"
                >
                  My Jobs
                </Link>

                <Link
                  to="/post"
                  className="bg-gradient-to-r from-gray-800 to-black text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  + Post Job
                </Link>
              </>
            )}

            {/* AUTH ACTION */}
            {!user ? (
              <Link
                to="/login"
                className="bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium shadow-md border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                Login
              </Link>
            ) : (
              <Link
                to="/profile"
                className="flex items-center gap-2 group"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full shadow-md object-cover ring-2 ring-transparent group-hover:ring-gray-300 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-transparent group-hover:ring-gray-300 transition-all">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-gray-600 group-hover:text-gray-900 text-sm font-medium transition-colors hidden sm:block">
                  {user?.name?.split(' ')[0] || "Profile"}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />

          {/* WORKER MODE */}
          {mode === "worker" && (
            <Route
              path="/"
              element={
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Available Jobs
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Find urgent work near you
                    </p>
                  </div>
                  <Home />
                </div>
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20 animate-fadeIn">
                  <div className="text-5xl mb-4">🔐</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Login Required
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Please log in as an employer to post or manage jobs.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block bg-gradient-to-r from-gray-800 to-black text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Go to Login
                  </Link>
                </div>
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
