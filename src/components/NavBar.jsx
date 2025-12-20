import { Link } from "react-router-dom";

export default function Navbar({ mode, setMode }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">WorkNow</h1>

        <div className="flex items-center gap-4">
          {/* MODE SWITCH */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode("worker")}
              className={`px-3 py-1 rounded-md text-sm ${
                mode === "worker"
                  ? "bg-white shadow font-medium"
                  : "text-gray-500"
              }`}
            >
              Worker
            </button>
            <button
              onClick={() => setMode("employer")}
              className={`px-3 py-1 rounded-md text-sm ${
                mode === "employer"
                  ? "bg-white shadow font-medium"
                  : "text-gray-500"
              }`}
            >
              Employer
            </button>
          </div>

          <Link
            to="/profile"
            className="text-gray-600 hover:text-black"
          >
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
