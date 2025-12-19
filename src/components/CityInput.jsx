import { useEffect, useRef, useState } from "react";

export default function CityInput({ value, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const timeoutRef = useRef(null);

  function handleChange(e) {
    const q = e.target.value;
    onSelect(q);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();

      setSuggestions(
        data.map(p =>
          p.address?.city ||
          p.address?.town ||
          p.address?.village ||
          p.display_name.split(",")[0]
        )
      );
    }, 300);
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-4 py-2"
      />

      {suggestions.length > 0 && (
        <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full">
          {suggestions.map(city => (
            <div
              key={city}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(city);
                setSuggestions([]);
              }}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
