import { useEffect, useState } from "react";

const API = "https://worknow-backend.onrender.com";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // ✅ ADD THIS


  useEffect(() => {
    fetchJobs();
  }, []);

  function fetchJobs(cityFilter) {
    setLoading(true);

    const url = cityFilter
      ? `${API}/gigs?city=${encodeURIComponent(cityFilter)}`
      : `${API}/gigs`;

    fetch(url)
      .then(r => r.json())
      .then(data => setJobs(data))
      .finally(() => setLoading(false));
  }

  function apply(gigId) {
    const name = prompt("Your name");
    if (!name) return;

    const note =
      prompt("Why are you a good fit? (optional)") || "";

    fetch(
      `${API}/apply/${gigId}?applicantName=${encodeURIComponent(
        name
      )}&note=${encodeURIComponent(note)}`,
      { method: "POST" }
    )
      .then(r => r.text())
      .then(msg => alert(msg))
      .then(() => fetchJobs(city));
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Find urgent work. Get paid fast.
      </p>

      {/* SEARCH */}
    <div className="flex gap-2 relative">
  <div className="flex-1 relative">
    <input
      value={city}
      onChange={e => {
        const val = e.target.value;
        setCity(val);

        if (val.length < 2) {
          setSuggestions([]);
          return;
        }

        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(val)}`
        )
          .then(r => r.json())
          .then(data => {
            const cities = data.map(p =>
              p.address?.city ||
              p.address?.town ||
              p.address?.village ||
              p.display_name.split(",")[0]
            );
            setSuggestions([...new Set(cities)]);
          });
      }}
      placeholder="Enter city"
      className="w-full border rounded-lg px-4 py-2"
    />

    {suggestions.length > 0 && (
      <div className="absolute z-10 bg-white border rounded-lg w-full mt-1 shadow">
        {suggestions.map(c => (
          <div
            key={c}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setCity(c);
              setSuggestions([]);
              fetchJobs(c);
            }}
          >
            {c}
          </div>
        ))}
      </div>
    )}
  </div>

  <button
    onClick={() => fetchJobs(city)}
    className="bg-black text-white px-6 rounded-lg"
  >
    Search
  </button>
</div>


      {loading && <p>Loading jobs...</p>}

      {!loading && jobs.length === 0 && (
        <p>No jobs found</p>
      )}

      {jobs.map(job => (
        <div
          key={job.id}
          className="bg-white rounded-xl shadow p-5"
        >
          <h2 className="font-semibold text-lg">
            {job.title}
          </h2>

          <div className="text-sm text-gray-500 mt-1">
            ₹{job.payment} · {job.city}
          </div>

          <div className="text-sm mt-2">
            Applications: {job.applicationCount} / 10
          </div>

          <button
            onClick={() => apply(job.id)}
            disabled={job.applicationCount >= 10}
            className={`mt-4 w-full py-2 rounded-lg text-white ${
              job.applicationCount >= 10
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600"
            }`}
          >
            {job.applicationCount >= 10
              ? "Closed"
              : "Apply"}
          </button>
        </div>
      ))}
    </div>
  );
}
