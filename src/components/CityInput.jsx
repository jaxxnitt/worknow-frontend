import { useEffect, useRef, useState } from "react";

// Popular Indian cities for instant suggestions
const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Surat", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
  "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
  "Amritsar", "Allahabad", "Ranchi", "Howrah", "Coimbatore",
  "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur",
  "Noida", "Gurugram", "Mysore", "Mangalore", "Trivandrum"
];

export default function CityInput({
  value,
  onChange,
  onValidSelection,
  placeholder,
  showIcon = true,
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const q = e.target.value;
    onChange(q, false); // false = not a valid selection yet
    setIsValid(false);
    if (onValidSelection) onValidSelection(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    // First, filter local cities instantly
    const localMatches = POPULAR_CITIES.filter(city =>
      city.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);

    if (localMatches.length > 0) {
      setSuggestions(localMatches);
    }

    // Then fetch from API with debounce for more results
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`
        );
        const data = await res.json();

        const apiCities = data
          .map(p =>
            p.address?.city ||
            p.address?.town ||
            p.address?.village ||
            p.display_name.split(",")[0]
          )
          .filter(Boolean);

        // Merge local and API results, remove duplicates
        const allCities = [...new Set([...localMatches, ...apiCities])].slice(0, 8);
        setSuggestions(allCities);
      } catch (err) {
        // Keep local matches if API fails
        console.error("City search failed:", err);
      }
    }, 400);
  }

  function selectCity(city) {
    onChange(city, true); // true = valid selection
    setIsValid(true);
    if (onValidSelection) onValidSelection(true);
    setSuggestions([]);
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        {showIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`w-full border border-gray-200 rounded-xl ${showIcon ? 'pl-12' : 'pl-4'} pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-400 transition-all duration-200 bg-white/80 ${className}`}
        />
        {isValid && value && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-xl w-full mt-2 shadow-xl overflow-hidden animate-slideDown">
          {suggestions.map((city, idx) => (
            <div
              key={`${city}-${idx}`}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
              onClick={() => selectCity(city)}
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
