import { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  function switchMode(newMode) {
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-bounce-slow">💼</span>
            </div>
          </div>
          <p className="text-white/80 font-medium">Loading WorkNow...</p>
        </div>
      </div>
    );
  }

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* HEADER */}
      <header className="glass-vibrant sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-xl">💼</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                WorkNow
              </h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">
                {mode === "worker" ? "Find work fast" : "Hire workers fast"}
              </p>
            </div>
          </Link>

          {/* RIGHT SIDE CONTROLS */}
          <div className="flex items-center gap-3">
            {/* MODE SWITCH - Hidden on mobile, shown in bottom nav */}
            <div className="hidden md:flex bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-inner border border-white/30">
              <button
                onClick={() => switchMode("worker")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  mode === "worker"
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                👷 Worker
              </button>

              <button
                onClick={() => switchMode("employer")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  mode === "employer"
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                👔 Employer
              </button>
            </div>

            {/* Post Job Button (Employer mode) */}
            {mode === "employer" && user && (
              <Link
                to="/post"
                className="hidden md:flex btn-primary items-center gap-2 px-4 py-2 text-sm"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post Job
                </span>
              </Link>
            )}

            {/* AUTH ACTION */}
            {!user ? (
              <Link
                to="/login"
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
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
                    className="w-10 h-10 rounded-xl shadow-lg object-cover ring-2 ring-white/50 group-hover:ring-violet-400 transition-all duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/50 group-hover:ring-violet-400 transition-all duration-300">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-6">
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
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      Available Jobs
                    </h2>
                    <p className="text-white/70 mt-1">
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
              <Route
                path="/"
                element={<Navigate to="/manage" />}
              />
            </>
          )}

          {/* EMPLOYER MODE BUT NOT LOGGED IN */}
          {mode === "employer" && !user && (
            <Route
              path="*"
              element={
                <div className="glass-vibrant rounded-3xl p-8 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-4xl">🔐</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Login Required
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Please log in as an employer to post or manage jobs.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex btn-primary px-8 py-3 text-lg"
                  >
                    <span className="relative z-10">Go to Login</span>
                  </Link>
                </div>
              }
            />
          )}

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* BOTTOM NAVIGATION - Mobile Only */}
      {!isLoginPage && (
        <nav className="bottom-nav md:hidden">
          <div className="flex justify-around items-center py-2">
            {/* Home/Jobs */}
            <Link
              to="/"
              className={`bottom-nav-item ${location.pathname === "/" ? "active" : ""}`}
              onClick={() => mode === "employer" && switchMode("worker")}
            >
              <div className={`nav-icon p-2 rounded-xl transition-all duration-300 ${
                location.pathname === "/" && mode === "worker" ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg scale-110" : "text-gray-500"
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium">Find Jobs</span>
            </Link>

            {/* Post Job */}
            {user && (
              <Link
                to="/post"
                className={`bottom-nav-item ${location.pathname === "/post" ? "active" : ""}`}
                onClick={() => mode === "worker" && switchMode("employer")}
              >
                <div className={`nav-icon p-2 rounded-xl transition-all duration-300 ${
                  location.pathname === "/post" ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg scale-110" : "text-gray-500"
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xs mt-1 font-medium">Post Job</span>
              </Link>
            )}

            {/* Manage Jobs */}
            {user && (
              <Link
                to="/manage"
                className={`bottom-nav-item ${location.pathname === "/manage" ? "active" : ""}`}
                onClick={() => mode === "worker" && switchMode("employer")}
              >
                <div className={`nav-icon p-2 rounded-xl transition-all duration-300 ${
                  location.pathname === "/manage" ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg scale-110" : "text-gray-500"
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs mt-1 font-medium">My Jobs</span>
              </Link>
            )}

            {/* Profile */}
            <Link
              to={user ? "/profile" : "/login"}
              className={`bottom-nav-item ${location.pathname === "/profile" ? "active" : ""}`}
            >
              <div className={`nav-icon p-2 rounded-xl transition-all duration-300 ${
                location.pathname === "/profile" ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg scale-110" : "text-gray-500"
              }`}>
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{user ? "Profile" : "Login"}</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
