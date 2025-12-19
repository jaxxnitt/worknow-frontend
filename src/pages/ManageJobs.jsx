import { useState } from "react";

const API = "https://worknow-backend.onrender.com/manage";

export default function ManageJobs() {
  const [name, setName] = useState("");
  const [jobs, setJobs] = useState([]);

  function loadJobs() {
    if (!name.trim()) {
      alert("Enter your name");
      return;
    }

    fetch(
      `${API}/jobs?posterName=${encodeURIComponent(name)}`
    )
      .then(r => r.json())
      .then(setJobs);
  }

  function loadApplicant(gigId) {
    fetch(`${API}/gigs/${gigId}/current-applicant`)
      .then(r => r.json())
      .then(app => {
        setJobs(jobs =>
          jobs.map(j =>
            j.id === gigId ? { ...j, currentApp: app } : j
          )
        );
      });
  }

  function action(id, type) {
    fetch(
      `https://worknow-backend.onrender.com/applications/${id}/${type}`,
      { method: "POST" }
    ).then(() => loadJobs());
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Manage My Jobs
      </h2>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <button
          onClick={loadJobs}
          className="bg-black text-white px-6 rounded-lg"
        >
          Load
        </button>
      </div>

      {jobs.map(job => (
        <div
          key={job.id}
          className="bg-white rounded-xl shadow p-4"
        >
          <div className="font-semibold">
            {job.title}
          </div>

          <button
            className="mt-2 text-blue-600"
            onClick={() => loadApplicant(job.id)}
          >
            View Applicant
          </button>

          {job.currentApp && (
            <div className="mt-3 border-t pt-3">
              <b>{job.currentApp.applicantName}</b>
              <p className="text-sm text-gray-600">
                {job.currentApp.note || "No message"}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    action(job.currentApp.id, "hire")
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Hire
                </button>

                <button
                  onClick={() =>
                    action(job.currentApp.id, "reject")
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
