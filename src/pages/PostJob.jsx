import { useState } from "react";
import CityInput from "../components/CityInput";

const API = "https://worknow-backend.onrender.com/gigs";

export default function PostJob() {
  const [posterName, setPosterName] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [payment, setPayment] = useState("");
  const [deadline, setDeadline] = useState("Today");

  async function submit(e) {
    e.preventDefault();

    if (!city) {
      alert("Select city from suggestions");
      return;
    }

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posterName,
        title,
        city,
        payment,
        deadline
      })
    });

    const saved = await res.json();
    alert(`Job posted. Job ID: ${saved.id}`);
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">Post a Job</h2>

      <input
        value={posterName}
        onChange={e => setPosterName(e.target.value)}
        placeholder="Your name"
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Work title"
        className="w-full border rounded-lg px-4 py-2"
      />

      <CityInput
        value={city}
        onSelect={setCity}
        placeholder="City / Area"
      />

      <input
        value={payment}
        onChange={e => setPayment(e.target.value)}
        placeholder="Payment ₹"
        className="w-full border rounded-lg px-4 py-2"
      />

      <select
        value={deadline}
        onChange={e => setDeadline(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option>Today</option>
        <option>Tomorrow</option>
      </select>

      <button className="w-full bg-black text-white py-2 rounded-lg">
        Post Job
      </button>
    </form>
  );
}
