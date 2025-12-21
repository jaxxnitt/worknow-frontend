import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";

export default function App() {
  const [mode, setMode] = useState("worker"); // worker | employer

  return (
    <div className="min-h-screen bg-gray-100">
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

          {/* MODE SWITCH */}
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode("worker")}
                className={`px-3 py-1 rounded-md text-sm ${
                  mode === "worker"
                    ? "bg-white shadow font-semibold"
                    : "text-gray-500"
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => setMode("employer")}
                className={`px-3 py-1 rounded-md text-sm ${
                  mode === "employer"
                    ? "bg-white shadow font-semibold"
                    : "text-gray-500"
                }`}
              >
                Employer
              </button>
            </div>

            {/* NAV ACTIONS */}
            {mode === "worker" && (
              <Link
                to="/"
                className="text-gray-700 hover:text-black"
              >
                Find Work
              </Link>
            )}

            {mode === "employer" && (
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
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {mode === "worker" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Available Jobs
            </h2>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </>
        )}

        {mode === "employer" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Employer Dashboard
            </h2>
            <Routes>
              <Route path="/post" element={<PostJob />} />
              <Route
                path="/manage"
                element={<ManageJobs />}
              />
              {/* default employer view */}
              <Route
                path="*"
                element={
                  <p className="text-gray-600">
                    Post a job or manage applicants
                  </p>
                }
              />
            </Routes>
          </>
        )}
      </main>
    </div>
  );
}
