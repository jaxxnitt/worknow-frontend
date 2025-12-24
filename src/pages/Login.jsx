import { useAuth } from "../auth/AuthContext";

const API = "https://worknow-backend.onrender.com";

export default function Login() {
  const { login } = useAuth();

  async function handleGoogleLogin() {
    // Google Identity Services should give you this token
    const idToken = window.googleToken; // placeholder

    const res = await fetch(`${API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    const data = await res.json();

    login(data.token, data.user);
  }

  return (
    <div className="flex justify-center mt-20">
      <button
        onClick={handleGoogleLogin}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Continue with Google
      </button>
    </div>
  );
}
