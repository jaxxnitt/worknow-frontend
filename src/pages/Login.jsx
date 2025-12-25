import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

const API = "https://worknow-backend.onrender.com";

export default function Login() {
  const { login } = useAuth();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || !window.google) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const res = await fetch(`${API}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: response.credential
            })
          });

          if (!res.ok) {
            throw new Error("Login failed");
          }

          const data = await res.json();
          login(data.token, data.user);
        } catch (err) {
          alert("Login failed. Please try again.");
        }
      }
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login"),
      {
        theme: "outline",
        size: "large",
        width: 280
      }
    );
  }, [login]);

  return (
    <div className="flex justify-center mt-20">
      <div
        id="google-login"
        className="flex justify-center"
      />
    </div>
  );
}
