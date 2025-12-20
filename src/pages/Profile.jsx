export default function Profile({ mode }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl">
          👤
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {mode === "worker" ? "Worker Profile" : "Employer Profile"}
          </h2>
          <div className="text-sm text-gray-500">
            ⭐ 4.8 rating
          </div>
        </div>
      </div>

      {mode === "worker" ? (
        <>
          <div className="text-sm">
            Total earned: <b>₹12,500</b>
          </div>
          <div className="text-sm text-gray-500">
            Jobs completed: 14
          </div>
        </>
      ) : (
        <>
          <div className="text-sm">
            Jobs posted: <b>9</b>
          </div>
          <div className="text-sm text-gray-500">
            Workers hired: 11
          </div>
        </>
      )}
    </div>
  );
}
