import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";

export default function App() {
    const [mode, setMode] = useState("worker"); // default
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">WorkNow</h1>

          <div className="flex gap-3">
            <Link
              to="/"
              className="text-gray-600 hover:text-black"
            >
              Find Work
            </Link>

            <Link
              to="/manage"
              className="text-gray-600 hover:text-black"
            >
              Manage My Jobs
            </Link>

            <Link
              to="/post"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Post Job
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/manage" element={<ManageJobs />} />
        </Routes>
      </main>
    </div>
  );
}
