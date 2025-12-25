import { useAuth } from "../auth/AuthContext";

export default function Profile({ mode, onModeChange }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <p className="text-gray-600">
        Please log in to view your profile.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      {/* USER INFO */}
      <div className="flex items-center gap-4">
        <img
          src={user.avatar || "https://via.placeholder.com/64"}
          alt="Profile"
          className="w-16 h-16 rounded-full"
        />

        <div>
          <h2 className="text-xl font-semibold">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500">
            {user.email}
          </p>
        </div>
      </div>

      {/* MODE SELECTOR */}
      <div>
        <p className="text-sm font-medium mb-2">
          Preferred mode
        </p>
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => onModeChange("worker")}
            className={`px-3 py-1 rounded-md text-sm ${
              mode === "worker"
                ? "bg-white shadow font-semibold"
                : "text-gray-500"
            }`}
          >
            Worker
          </button>

          <button
            onClick={() => onModeChange("employer")}
            className={`px-3 py-1 rounded-md text-sm ${
              mode === "employer"
                ? "bg-white shadow font-semibold"
                : "text-gray-500"
            }`}
          >
            Employer
          </button>
        </div>
      </div>

      {/* STATS (PLACEHOLDER) */}
      {mode === "worker" ? (
        <div className="space-y-1 text-sm">
          <div>Total earned: ₹12,500</div>
          <div>Jobs completed: 14</div>
          <div>Rating: 4.8</div>
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          <div>Jobs posted: 9</div>
          <div>Workers hired: 11</div>
          <div>Rating: 4.9</div>
        </div>
      )}

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="text-red-600 text-sm"
      >
        Logout
      </button>
    </div>
  );
}
