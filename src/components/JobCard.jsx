const APPLY_API = "https://worknow-backend-production.up.railway.app/apply";

export default function JobCard({ job }) {
  async function apply() {
    const name = prompt("Your name");
    if (!name) return;

    const note = prompt("Why are you a good fit?") || "";

    await fetch(
      `${APPLY_API}/${job.id}?applicantName=${encodeURIComponent(name)}&note=${encodeURIComponent(note)}`,
      { method: "POST" }
    );

    alert("Applied successfully");
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="font-semibold text-lg">{job.title}</h2>
      <div className="text-sm text-gray-500">₹{job.payment} · {job.deadline}</div>
      <div className="mt-2">📍 {job.city}</div>

      <button
        onClick={apply}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Apply
      </button>
    </div>
  );
}
